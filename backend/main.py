import os
import io
import json
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import init_db, get_db, AnimalModel, AlertRecord, PredictionRecord, SensorObservation
from schemas import (
    AnimalResponse,
    PredictionRequest,
    PredictionResponse,
    HerdSummaryResponse,
    AlertResponse,
    ModelMetricsResponse,
    SensorSimulateRequest,
    SMSSendRequest,
    SMSTestRequest,
    SMSSettingsRequest,
    SMSSettingsResponse,
    SMSNotificationResponse,
)
from prediction import run_prediction_for_animal, predict_single
from recommendations import generate_recommendations
from alerts import get_active_alerts, create_alert_if_needed
from analytics import get_herd_summary_data, get_analytics_charts_data, get_vectorized_animal_predictions
from ml.predict import get_model_payload, compute_risk_category
import sms_service

app = FastAPI(
    title="Mastitis AI API",
    description="Early Bovine Mastitis Forecasting & Herd Health Platform API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    try:
        get_model_payload()
        print("ML Model loaded successfully on startup.")
    except Exception as e:
        print(f"Error initializing ML Model on startup: {e}")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "MASTITIS AI Backend API",
        "subtitle": "Early Bovine Mastitis Forecasting & Herd Health Platform",
        "forecasting_window": "7–14 days",
        "disclaimer": "Prototype trained on synthetic data for decision support. Not a clinical diagnosis."
    }

@app.get("/animals")
def get_animals(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    farm_id: Optional[str] = None,
    breed: Optional[str] = None,
    risk_category: Optional[str] = None,
    previous_mastitis: Optional[int] = None,
    sensor_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AnimalModel)
    
    if search:
        query = query.filter(
            (AnimalModel.animal_id.ilike(f"%{search}%")) |
            (AnimalModel.farm_id.ilike(f"%{search}%")) |
            (AnimalModel.breed.ilike(f"%{search}%"))
        )
    if farm_id and farm_id != "All":
        query = query.filter(AnimalModel.farm_id == farm_id)
    if breed and breed != "All":
        query = query.filter(AnimalModel.breed == breed)
    if previous_mastitis is not None:
        query = query.filter(AnimalModel.previous_mastitis == previous_mastitis)
    if sensor_status and sensor_status != "All":
        query = query.filter(AnimalModel.sensor_status == sensor_status)
        
    animals = query.all()
    if not animals:
        return {"total": 0, "page": page, "limit": limit, "animals": []}

    # Vectorized prediction over queried animals
    df_preds = get_vectorized_animal_predictions(animals)
    
    if risk_category and risk_category != "All":
        df_preds = df_preds[df_preds['risk_category'].str.upper() == risk_category.upper()]

    total = len(df_preds)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    df_page = df_preds.iloc[start_idx:end_idx]

    results = []
    for _, row in df_page.iterrows():
        results.append({
            "animal_id": str(row["animal_id"]),
            "record_id": str(row["record_id"]),
            "farm_id": str(row["farm_id"]),
            "breed": str(row["breed"]),
            "age_years": float(row["age_years"]) if pd.notnull(row["age_years"]) else 0.0,
            "lactation_number": int(row["lactation_number"]) if pd.notnull(row["lactation_number"]) else 1,
            "days_in_milk": int(row["days_in_milk"]) if pd.notnull(row["days_in_milk"]) else 0,
            "previous_mastitis": int(row["previous_mastitis"]) if pd.notnull(row["previous_mastitis"]) else 0,
            "disease_history": str(row["disease_history"]) if pd.notnull(row["disease_history"]) else 'None',
            "vaccination_status": str(row["vaccination_status"]) if pd.notnull(row["vaccination_status"]) else 'Up to date',
            "treatment_history": str(row["treatment_history"]) if pd.notnull(row["treatment_history"]) else None,
            "milk_yield_l_day": float(row["milk_yield_l_day"]) if pd.notnull(row["milk_yield_l_day"]) else 0.0,
            "scc_cells_ml": int(row["scc_cells_ml"]) if pd.notnull(row["scc_cells_ml"]) else 0,
            "milk_conductivity_ms_cm": float(row["milk_conductivity_ms_cm"]) if pd.notnull(row["milk_conductivity_ms_cm"]) else None,
            "milk_temperature_c": float(row["milk_temperature_c"]) if pd.notnull(row["milk_temperature_c"]) else 0.0,
            "body_temperature_c": float(row["body_temperature_c"]) if pd.notnull(row["body_temperature_c"]) else None,
            "udder_surface_temperature_c": float(row["udder_surface_temperature_c"]) if pd.notnull(row["udder_surface_temperature_c"]) else None,
            "activity_percent": float(row["activity_percent"]) if pd.notnull(row["activity_percent"]) else None,
            "rumination_min_day": float(row["rumination_min_day"]) if pd.notnull(row["rumination_min_day"]) else None,
            "feeding_behavior_score": float(row["feeding_behavior_score"]) if pd.notnull(row["feeding_behavior_score"]) else 0.0,
            "water_intake_l_day": float(row["water_intake_l_day"]) if pd.notnull(row["water_intake_l_day"]) else 0.0,
            "feed_quality_score": float(row["feed_quality_score"]) if pd.notnull(row["feed_quality_score"]) else None,
            "hygiene_score": float(row["hygiene_score"]) if pd.notnull(row["hygiene_score"]) else 0.0,
            "housing_condition_score": float(row["housing_condition_score"]) if pd.notnull(row["housing_condition_score"]) else 0.0,
            "milking_hygiene_score": float(row["milking_hygiene_score"]) if pd.notnull(row["milking_hygiene_score"]) else 0.0,
            "worker_hygiene_score": float(row["worker_hygiene_score"]) if pd.notnull(row["worker_hygiene_score"]) else None,
            "milking_frequency_per_day": int(row["milking_frequency_per_day"]) if pd.notnull(row["milking_frequency_per_day"]) else 2,
            "milking_schedule": str(row["milking_schedule"]) if pd.notnull(row["milking_schedule"]) else 'Standard',
            "ambient_temperature_c": float(row["ambient_temperature_c"]) if pd.notnull(row["ambient_temperature_c"]) else 0.0,
            "relative_humidity_percent": float(row["relative_humidity_percent"]) if pd.notnull(row["relative_humidity_percent"]) else 0.0,
            "climate_risk": str(row["climate_risk"]) if pd.notnull(row["climate_risk"]) else 'Low',
            "co_morbidity": int(row["co_morbidity"]) if pd.notnull(row["co_morbidity"]) else 0,
            "sensor_status": str(row["sensor_status"]) if pd.notnull(row["sensor_status"]) else 'Active',
            "risk_score": float(row["risk_score"]),
            "risk_category": str(row["risk_category"])
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "animals": results
    }

@app.get("/animals/{animal_id}")
def get_animal_detail(animal_id: str, db: Session = Depends(get_db)):
    animal = db.query(AnimalModel).filter(AnimalModel.animal_id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal {animal_id} not found")
        
    pred_res = run_prediction_for_animal(db, animal)
    
    anim_dict = {
        "animal_id": animal.animal_id,
        "record_id": animal.record_id,
        "farm_id": animal.farm_id,
        "breed": animal.breed,
        "age_years": animal.age_years,
        "lactation_number": animal.lactation_number,
        "days_in_milk": animal.days_in_milk,
        "previous_mastitis": animal.previous_mastitis,
        "disease_history": animal.disease_history,
        "vaccination_status": animal.vaccination_status,
        "treatment_history": animal.treatment_history,
        "milk_yield_l_day": animal.milk_yield_l_day,
        "scc_cells_ml": animal.scc_cells_ml,
        "milk_conductivity_ms_cm": animal.milk_conductivity_ms_cm,
        "milk_temperature_c": animal.milk_temperature_c,
        "body_temperature_c": animal.body_temperature_c,
        "udder_surface_temperature_c": animal.udder_surface_temperature_c,
        "activity_percent": animal.activity_percent,
        "rumination_min_day": animal.rumination_min_day,
        "feeding_behavior_score": animal.feeding_behavior_score,
        "water_intake_l_day": animal.water_intake_l_day,
        "feed_quality_score": animal.feed_quality_score,
        "hygiene_score": animal.hygiene_score,
        "housing_condition_score": animal.housing_condition_score,
        "milking_hygiene_score": animal.milking_hygiene_score,
        "worker_hygiene_score": animal.worker_hygiene_score,
        "milking_frequency_per_day": animal.milking_frequency_per_day,
        "milking_schedule": animal.milking_schedule,
        "ambient_temperature_c": animal.ambient_temperature_c,
        "relative_humidity_percent": animal.relative_humidity_percent,
        "climate_risk": animal.climate_risk,
        "co_morbidity": animal.co_morbidity,
        "sensor_status": animal.sensor_status,
        "mastitis_within_7_14_days": animal.mastitis_within_7_14_days,
        "updated_at": animal.updated_at,
        "ai_assessment": pred_res
    }
    return anim_dict

@app.post("/predict", response_model=PredictionResponse)
def predict_endpoint(req: PredictionRequest, db: Session = Depends(get_db)):
    data_dict = req.dict()
    res = predict_single(data_dict)
    recs = generate_recommendations(data_dict, res["risk_score"], res["risk_factors"])
    res["recommendations"] = recs
    res["animal_id"] = req.animal_id
    
    create_alert_if_needed(
        db=db,
        animal_id=req.animal_id,
        farm_id=req.farm_id or "FARM-001",
        risk_score=res["risk_score"],
        risk_category=res["risk_category"],
        risk_factors=res["risk_factors"]
    )
    return res

@app.get("/herd-summary", response_model=HerdSummaryResponse)
def get_herd_summary(db: Session = Depends(get_db)):
    return get_herd_summary_data(db)

@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return get_active_alerts(db)

@app.post("/alerts/{alert_id}/review")
def review_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(AlertRecord).filter(AlertRecord.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_reviewed = True
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} marked as reviewed"}

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return get_analytics_charts_data(db)

@app.get("/model-metrics")
def get_model_metrics():
    payload = get_model_payload()
    return {
        "random_forest": payload["metrics"]["random_forest"],
        "logistic_regression": payload["metrics"]["logistic_regression"],
        "feature_importances": payload["feature_importances"]
    }

@app.post("/simulate-sensor")
def simulate_sensor(req: SensorSimulateRequest, db: Session = Depends(get_db)):
    animal = db.query(AnimalModel).filter(AnimalModel.animal_id == req.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal {req.animal_id} not found")
        
    animal.body_temperature_c = req.body_temperature_c
    animal.udder_surface_temperature_c = req.udder_surface_temperature_c
    animal.milk_conductivity_ms_cm = req.milk_conductivity_ms_cm
    animal.milk_temperature_c = req.milk_temperature_c
    animal.milk_yield_l_day = req.milk_yield_l_day
    animal.activity_percent = req.activity_percent
    animal.rumination_min_day = req.rumination_min_day
    animal.scc_cells_ml = req.scc_cells_ml
    
    if req.water_intake_l_day is not None:
        animal.water_intake_l_day = req.water_intake_l_day
    if req.feeding_behavior_score is not None:
        animal.feeding_behavior_score = req.feeding_behavior_score
    if req.ambient_temperature_c is not None:
        animal.ambient_temperature_c = req.ambient_temperature_c
    if req.relative_humidity_percent is not None:
        animal.relative_humidity_percent = req.relative_humidity_percent
        
    obs = SensorObservation(
        animal_id=req.animal_id,
        readings_json=json.dumps(req.dict())
    )
    db.add(obs)
    db.commit()
    db.refresh(animal)
    
    pred_res = run_prediction_for_animal(db, animal)
    
    # If High Risk, ensure simulated SMS notification is logged for demonstration
    sms_result = None
    if pred_res["risk_score"] > 60 or pred_res["risk_category"] == "High Risk":
        sms_result = sms_service.send_sms(
            db=db,
            animal_id=animal.animal_id,
            farm_id=animal.farm_id or "FARM-001",
            risk_score=pred_res["risk_score"],
            risk_category=pred_res["risk_category"],
            recipient="+1-555-HERD-VET",
            mode="SIMULATED",
            skip_cooldown_check=True
        )

    return {
        "status": "success",
        "message": f"Simulated IoT sensor data recorded for {req.animal_id}",
        "simulated_data_notice": "Simulated IoT Data — Software simulation using synthetic telemetry",
        "updated_measurements": req.dict(),
        "ai_assessment": pred_res,
        "simulated_sms": sms_result,
        "alert_created": (pred_res["risk_score"] > 40)
    }


@app.post("/upload-data")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
        
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file format: {e}")
        
    required_cols = ['animal_id', 'farm_id', 'milk_yield_l_day', 'scc_cells_ml']
    missing_required = [c for c in required_cols if c not in df.columns]
    if missing_required:
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing mandatory columns: {', '.join(missing_required)}"
        )
        
    detected_missing = {col: int(count) for col, count in df.isnull().sum().items() if count > 0}
    unique_animals = df['animal_id'].nunique() if 'animal_id' in df.columns else 0
    unique_farms = df['farm_id'].nunique() if 'farm_id' in df.columns else 0
    
    preview_data = df.head(10).fillna("").to_dict(orient="records")
    
    return {
        "status": "validated",
        "filename": file.filename,
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "unique_animals": unique_animals,
        "unique_farms": unique_farms,
        "detected_missing_values": detected_missing,
        "columns_found": list(df.columns),
        "preview": preview_data
    }


# ---------------------------------------------------------------------------
# SMS Notification Endpoints
# ---------------------------------------------------------------------------

@app.get("/sms/history")
def get_sms_history_endpoint(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns recent SMS notification records (newest first).
    Persists across backend restarts because records live in SQLite.
    """
    return sms_service.get_sms_history(db, limit=limit)


@app.get("/sms/settings")
def get_sms_settings_endpoint(db: Session = Depends(get_db)):
    """Retrieve current SMS configuration."""
    return sms_service.get_sms_settings(db)


@app.post("/sms/settings")
def update_sms_settings_endpoint(req: SMSSettingsRequest, db: Session = Depends(get_db)):
    """Persist new SMS configuration (enabled, phone numbers, mode)."""
    return sms_service.update_sms_settings(
        db=db,
        enabled=req.enabled,
        farmer_phone=req.farmer_phone or "",
        vet_phone=req.vet_phone or "",
        mode=req.mode or "SIMULATED",
    )


@app.post("/sms/test")
def send_test_sms_endpoint(req: SMSTestRequest, db: Session = Depends(get_db)):
    """
    Sends a test SMS to the specified recipient.
    Always operates in SIMULATED mode — no real telecom call is made.
    Useful for verifying the notification pipeline is configured correctly.
    """
    result = sms_service.send_test_sms(
        db=db,
        recipient=req.recipient,
        mode=req.mode or "SIMULATED",
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("reason", "Test SMS failed."))
    return result


@app.post("/sms/send")
def send_sms_manual_endpoint(req: SMSSendRequest, db: Session = Depends(get_db)):
    """
    Manually dispatch an SMS alert for a specific animal.
    Validates animal exists, generates a fresh prediction, then sends the SMS.
    Manual sends skip the cooldown guard (user explicitly requested it).
    Safety: Message never prescribes medication or claims clinical accuracy.
    """
    animal = db.query(AnimalModel).filter(AnimalModel.animal_id == req.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal {req.animal_id} not found.")

    # Use the latest prediction for this animal
    pred_res = run_prediction_for_animal(db, animal)

    result = sms_service.send_sms(
        db=db,
        animal_id=req.animal_id,
        farm_id=animal.farm_id or "UNKNOWN",
        risk_score=pred_res["risk_score"],
        risk_category=pred_res["risk_category"],
        recipient=req.recipient,
        mode="SIMULATED",
        skip_cooldown_check=True,   # Manual sends always go through
    )

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("reason", "SMS dispatch failed."))

    return {
        **result,
        "ai_assessment": pred_res,
        "note": "Demo Mode: SMS messages are simulated and no real SMS was sent.",
    }
