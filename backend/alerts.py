import json
from sqlalchemy.orm import Session
from database import AlertRecord, AnimalModel
from schemas import AlertResponse
from typing import List, Dict, Any

def create_alert_if_needed(db: Session, animal_id: str, farm_id: str, risk_score: float, risk_category: str, risk_factors: list) -> AlertRecord:
    """
    Creates an Alert record in DB if animal risk score is Moderate or High (> 40%),
    or if sensor warning flags are active.
    """
    if risk_score <= 40:
        return None
        
    severity = "HIGH" if risk_score > 60 else "MODERATE"
    alert_type = "HIGH RISK" if risk_score > 60 else "MODERATE RISK"
    
    indicators = [rf["name"] if isinstance(rf, dict) else str(rf) for rf in risk_factors[:3]]
    if not indicators:
        indicators = ["Elevated AI Risk Model Score"]
        
    title = f"Early Warning: {animal_id} ({risk_category})"
    message = f"Animal {animal_id} on {farm_id} predicted with {risk_score}% mastitis risk within 7–14 days. Key indicators: {', '.join(indicators)}."
    
    # Check if an active unreviewed alert already exists for this animal
    existing = db.query(AlertRecord).filter(
        AlertRecord.animal_id == animal_id,
        AlertRecord.is_reviewed == False
    ).first()
    
    if existing:
        existing.risk_score = risk_score
        existing.alert_type = alert_type
        existing.severity = severity
        existing.message = message
        existing.main_indicators_json = json.dumps(indicators)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_alert = AlertRecord(
            animal_id=animal_id,
            farm_id=farm_id,
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message,
            main_indicators_json=json.dumps(indicators),
            is_reviewed=False
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        return new_alert

def get_active_alerts(db: Session) -> List[Dict[str, Any]]:
    from database import SMSNotificationRecord, PredictionRecord
    
    alerts = db.query(AlertRecord).order_by(AlertRecord.is_reviewed.asc(), AlertRecord.created_at.desc()).all()
    
    # Map latest SMS dispatch status
    sms_map = {}
    for s in db.query(SMSNotificationRecord).order_by(SMSNotificationRecord.sent_at.desc()).all():
        if s.animal_id not in sms_map:
            sms_map[s.animal_id] = "Sent (Simulated)" if s.status == "SENT_SIMULATED" else s.status

    # Map latest prediction risk score and category
    pred_map = {}
    for p in db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).all():
        if p.animal_id not in pred_map:
            pred_map[p.animal_id] = (p.risk_score, p.risk_category)

    results = []
    for a in alerts:
        indicators = []
        try:
            indicators = json.loads(a.main_indicators_json) if a.main_indicators_json else []
        except Exception:
            pass

        p_info = pred_map.get(a.animal_id, (None, None))
        risk_score = p_info[0]
        risk_cat = p_info[1] or ("High Risk" if a.severity == "HIGH" else "Moderate Risk")
        sms_st = sms_map.get(a.animal_id, "Not Dispatched")

        results.append({
            "id": a.id,
            "animal_id": a.animal_id,
            "farm_id": a.farm_id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "main_indicators": indicators,
            "is_reviewed": a.is_reviewed,
            "created_at": a.created_at,
            "risk_score": risk_score,
            "risk_category": risk_cat,
            "sms_status": sms_st
        })
    return results

