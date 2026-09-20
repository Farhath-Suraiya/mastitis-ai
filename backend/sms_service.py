"""
sms_service.py
--------------
Handles all SMS-style early-warning notification logic for the Mastitis AI platform.

Default operating mode: SIMULATED
  - Messages are formatted, validated, and persisted to the SQLite database.
  - No external telecom API or network call is made.
  - A placeholder real-SMS stub is included for future integration (e.g. Twilio, AWS SNS).

Safety/Domain rules enforced here:
  - SMS text NEVER prescribes antibiotics or medication automatically.
  - SMS text NEVER claims clinical diagnosis or guaranteed prediction accuracy.
  - All messages direct recipients to inspect the animal and consult a veterinary professional.
"""

import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from database import SMSNotificationRecord, SMSSettingsRecord

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SMS_COOLDOWN_MINUTES = 60   # Minimum gap between repeated SMS for the same animal
SMS_HIGH_RISK_THRESHOLD = 60.0  # Only auto-send SMS when risk_score > this


# ---------------------------------------------------------------------------
# Message formatting
# ---------------------------------------------------------------------------

def _build_sms_message(
    animal_id: str,
    farm_id: str,
    risk_score: float,
    risk_category: str,
    forecast_period: str = "7–14 days",
) -> str:
    """
    Formats a short, non-prescriptive, clear SMS alert message.
    NEVER prescribes medication or claims clinical accuracy.
    """
    return (
        f"MASTITIS ALERT [PROTOTYPE]: Animal {animal_id} (Farm {farm_id}) "
        f"has {risk_category.upper()} mastitis risk ({risk_score:.1f}%). "
        f"Potential risk within {forecast_period}. "
        f"Please inspect the animal and consult the responsible veterinary professional. "
        f"[Simulated Demo — Not a clinical diagnosis. Trained on synthetic data only.]"
    )


def _build_test_message(recipient: str) -> str:
    return (
        "MASTITIS AI TEST ALERT [PROTOTYPE]: "
        "Your SMS notification system is correctly configured and active. "
        "This is a simulated test message. No real SMS was transmitted. "
        "[Demo Mode — trained on synthetic data only.]"
    )


# ---------------------------------------------------------------------------
# Settings CRUD
# ---------------------------------------------------------------------------

def get_sms_settings(db: Session) -> Dict[str, Any]:
    """Retrieve the persistent SMS settings row. Creates default if missing."""
    row = db.query(SMSSettingsRecord).first()
    if not row:
        row = SMSSettingsRecord(enabled=False, farmer_phone="", vet_phone="", mode="SIMULATED")
        db.add(row)
        db.commit()
        db.refresh(row)
    return {
        "id": row.id,
        "enabled": row.enabled,
        "farmer_phone": row.farmer_phone or "",
        "vet_phone": row.vet_phone or "",
        "mode": row.mode or "SIMULATED",
    }


def update_sms_settings(
    db: Session,
    enabled: bool,
    farmer_phone: str,
    vet_phone: str,
    mode: str = "SIMULATED",
) -> Dict[str, Any]:
    """Persist updated SMS settings to the database."""
    row = db.query(SMSSettingsRecord).first()
    if not row:
        row = SMSSettingsRecord()
        db.add(row)
    row.enabled = enabled
    row.farmer_phone = farmer_phone.strip()
    row.vet_phone = vet_phone.strip()
    row.mode = mode if mode in ("SIMULATED", "REAL") else "SIMULATED"
    db.commit()
    db.refresh(row)
    return get_sms_settings(db)


# ---------------------------------------------------------------------------
# Duplicate / cooldown guard
# ---------------------------------------------------------------------------

def _has_recent_sms(db: Session, animal_id: str) -> bool:
    """
    Returns True if an SMS for this animal was already sent within
    the cooldown window (SMS_COOLDOWN_MINUTES).
    This prevents unlimited repeated notifications for the same prediction.
    """
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=SMS_COOLDOWN_MINUTES)
    recent = (
        db.query(SMSNotificationRecord)
        .filter(
            SMSNotificationRecord.animal_id == animal_id,
            SMSNotificationRecord.sent_at >= cutoff,
        )
        .first()
    )
    return recent is not None


# ---------------------------------------------------------------------------
# Core send function (Simulated mode)
# ---------------------------------------------------------------------------

def send_sms(
    db: Session,
    animal_id: str,
    farm_id: str,
    risk_score: float,
    risk_category: str,
    recipient: str,
    forecast_period: str = "7–14 days",
    mode: str = "SIMULATED",
    skip_cooldown_check: bool = False,
) -> Dict[str, Any]:
    """
    Send (or simulate) an SMS alert. Logs every attempt to SQLite.

    Parameters
    ----------
    skip_cooldown_check : bool
        Set True only for explicit manual sends / test sends called from the UI.
        Auto-triggered sends always respect the cooldown.

    Returns a dict describing the outcome (status, message, id, duplicate_suppressed).
    """
    if not recipient or not recipient.strip():
        return {
            "success": False,
            "status": "FAILED",
            "reason": "No recipient phone number configured.",
            "duplicate_suppressed": False,
        }

    # Cooldown check for auto-triggered (not manual) sends
    if not skip_cooldown_check and _has_recent_sms(db, animal_id):
        return {
            "success": False,
            "status": "SKIPPED",
            "reason": f"SMS already sent for {animal_id} within the last {SMS_COOLDOWN_MINUTES} minutes.",
            "duplicate_suppressed": True,
        }

    message = _build_sms_message(
        animal_id=animal_id,
        farm_id=farm_id,
        risk_score=risk_score,
        risk_category=risk_category,
        forecast_period=forecast_period,
    )

    # In REAL mode this is where you would call an SMS API (e.g. Twilio, AWS SNS).
    # For now, the stub simply marks the attempt as simulated.
    if mode == "REAL":
        # Future integration point:
        # result = _real_sms_send(recipient, message)
        # status = "SENT_REAL" if result.success else "FAILED"
        status = "SENT_SIMULATED"   # Fallback until real credentials are configured
    else:
        status = "SENT_SIMULATED"

    record = SMSNotificationRecord(
        animal_id=animal_id,
        farm_id=farm_id,
        recipient=recipient.strip(),
        message=message,
        risk_category=risk_category,
        risk_score=float(risk_score),
        status=status,
        mode=mode,
        sent_at=datetime.datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "success": True,
        "status": status,
        "id": record.id,
        "animal_id": animal_id,
        "recipient": recipient.strip(),
        "message": message,
        "mode": mode,
        "sent_at": record.sent_at.isoformat(),
        "duplicate_suppressed": False,
    }


# ---------------------------------------------------------------------------
# Auto-trigger helper (called from prediction.py on High Risk)
# ---------------------------------------------------------------------------

def auto_send_sms_if_high_risk(
    db: Session,
    animal_id: str,
    farm_id: str,
    risk_score: float,
    risk_category: str,
) -> Optional[Dict[str, Any]]:
    """
    Automatically sends SMS notifications (to farmer + vet) when a HIGH RISK
    prediction is generated, subject to:
      - SMS feature being enabled in settings
      - Risk score exceeding SMS_HIGH_RISK_THRESHOLD (>60%)
      - Not having already sent within the cooldown window

    Returns a result dict, or None if SMS was not triggered.
    """
    if risk_score <= SMS_HIGH_RISK_THRESHOLD:
        return None

    settings = get_sms_settings(db)

    if not settings["enabled"]:
        return None

    mode = settings.get("mode", "SIMULATED")
    results = []

    for recipient_key in ("farmer_phone", "vet_phone"):
        phone = settings.get(recipient_key, "").strip()
        if not phone:
            continue
        # Use shared cooldown: if ANY sms was recently sent for this animal, skip
        if _has_recent_sms(db, animal_id):
            results.append({"recipient": phone, "status": "SKIPPED", "reason": "cooldown"})
            continue
        result = send_sms(
            db=db,
            animal_id=animal_id,
            farm_id=farm_id,
            risk_score=risk_score,
            risk_category=risk_category,
            recipient=phone,
            mode=mode,
            skip_cooldown_check=False,
        )
        results.append(result)

    return {"auto_sms_results": results} if results else None


# ---------------------------------------------------------------------------
# Test SMS
# ---------------------------------------------------------------------------

def send_test_sms(
    db: Session,
    recipient: str,
    mode: str = "SIMULATED",
) -> Dict[str, Any]:
    """
    Sends a test SMS to the provided recipient. Always skips cooldown.
    Does not attach to any animal record.
    """
    if not recipient or not recipient.strip():
        return {
            "success": False,
            "status": "FAILED",
            "reason": "Recipient phone number is required for test SMS.",
        }

    message = _build_test_message(recipient)

    record = SMSNotificationRecord(
        animal_id="TEST",
        farm_id="TEST",
        recipient=recipient.strip(),
        message=message,
        risk_category="TEST",
        risk_score=0.0,
        status="SENT_SIMULATED",
        mode=mode,
        sent_at=datetime.datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "success": True,
        "status": "SENT_SIMULATED",
        "id": record.id,
        "recipient": recipient.strip(),
        "message": message,
        "mode": mode,
        "sent_at": record.sent_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# History retrieval
# ---------------------------------------------------------------------------

def get_sms_history(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    """Return recent SMS notification records, newest first."""
    rows = (
        db.query(SMSNotificationRecord)
        .order_by(SMSNotificationRecord.sent_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "animal_id": r.animal_id,
            "farm_id": r.farm_id,
            "recipient": r.recipient,
            "message": r.message,
            "risk_category": r.risk_category,
            "risk_score": r.risk_score,
            "status": r.status,
            "mode": r.mode,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None,
        }
        for r in rows
    ]
