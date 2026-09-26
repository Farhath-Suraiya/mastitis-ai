import joblib
import numpy as np
from database import SessionLocal, AnimalModel
from ml.predict import predict_single

payload = joblib.load("ml/model.pkl")
rf = payload["rf_model"]
pos_idx = int(np.where(rf.classes_ == 1)[0][0])

def compute_risk_category(risk_score: float) -> str:
    if risk_score <= 15.0:
        return "No Risk"
    elif risk_score <= 28.0:
        return "Low Risk"
    elif risk_score <= 45.0:
        return "Moderate Risk"
    else:
        return "High Risk"

db = SessionLocal()
animals = db.query(AnimalModel).limit(5).all()

scenarios = [
    ("Healthy Cow (No Risk)", {
        "milk_yield_l_day": 22.0, "scc_cells_ml": 85000, "milk_conductivity_ms_cm": 4.85,
        "body_temperature_c": 38.45, "udder_surface_temperature_c": 37.35, "milk_temperature_c": 38.45,
        "activity_percent": 88.0, "rumination_min_day": 510.0, "feeding_behavior_score": 8.5, "water_intake_l_day": 78.0
    }),
    ("Early Warning (Low Risk)", {
        "milk_yield_l_day": 13.5, "scc_cells_ml": 235000, "milk_conductivity_ms_cm": 5.62,
        "body_temperature_c": 38.75, "udder_surface_temperature_c": 37.85, "milk_temperature_c": 38.70,
        "activity_percent": 76.0, "rumination_min_day": 460.0, "feeding_behavior_score": 7.2, "water_intake_l_day": 65.0
    }),
    ("Developing Mastitis (Moderate Risk)", {
        "milk_yield_l_day": 7.5, "scc_cells_ml": 340000, "milk_conductivity_ms_cm": 5.88,
        "body_temperature_c": 39.05, "udder_surface_temperature_c": 38.20, "milk_temperature_c": 38.95,
        "activity_percent": 70.0, "rumination_min_day": 430.0, "feeding_behavior_score": 6.4, "water_intake_l_day": 56.0
    }),
    ("Acute Mastitis (High Risk)", {
        "milk_yield_l_day": 3.0, "scc_cells_ml": 550000, "milk_conductivity_ms_cm": 6.35,
        "body_temperature_c": 39.30, "udder_surface_temperature_c": 38.55, "milk_temperature_c": 39.20,
        "activity_percent": 62.0, "rumination_min_day": 370.0, "feeding_behavior_score": 5.2, "water_intake_l_day": 48.0
    }),
    ("Recovery (No Risk)", {
        "milk_yield_l_day": 20.0, "scc_cells_ml": 120000, "milk_conductivity_ms_cm": 5.00,
        "body_temperature_c": 38.45, "udder_surface_temperature_c": 37.40, "milk_temperature_c": 38.45,
        "activity_percent": 86.0, "rumination_min_day": 495.0, "feeding_behavior_score": 8.2, "water_intake_l_day": 75.0
    })
]

for a in animals:
    print("=" * 60)
    print(f"COW: {a.animal_id} | Breed: {a.breed}")
    print("=" * 60)
    base = {
        "animal_id": a.animal_id, "farm_id": a.farm_id, "breed": a.breed,
        "age_years": a.age_years, "lactation_number": a.lactation_number,
        "days_in_milk": a.days_in_milk, "previous_mastitis": a.previous_mastitis,
        "disease_history": a.disease_history, "vaccination_status": a.vaccination_status,
        "treatment_history": a.treatment_history, "milk_yield_l_day": a.milk_yield_l_day,
        "scc_cells_ml": a.scc_cells_ml, "milk_conductivity_ms_cm": a.milk_conductivity_ms_cm,
        "milk_temperature_c": a.milk_temperature_c, "body_temperature_c": a.body_temperature_c,
        "udder_surface_temperature_c": a.udder_surface_temperature_c,
        "activity_percent": a.activity_percent, "rumination_min_day": a.rumination_min_day,
        "feeding_behavior_score": a.feeding_behavior_score, "water_intake_l_day": a.water_intake_l_day,
        "feed_quality_score": a.feed_quality_score, "hygiene_score": a.hygiene_score,
        "housing_condition_score": a.housing_condition_score,
        "milking_hygiene_score": a.milking_hygiene_score,
        "worker_hygiene_score": a.worker_hygiene_score,
        "milking_frequency_per_day": a.milking_frequency_per_day,
        "milking_schedule": a.milking_schedule, "ambient_temperature_c": a.ambient_temperature_c,
        "relative_humidity_percent": a.relative_humidity_percent,
        "climate_risk": a.climate_risk, "co_morbidity": a.co_morbidity,
        "sensor_status": a.sensor_status
    }
    
    for sc_name, vit in scenarios:
        d = dict(base)
        d.update(vit)
        res = predict_single(d)
        score = res["risk_score"]
        cat = compute_risk_category(score)
        print(f"{sc_name:<36} -> Prob: {res['probability']:.4f} | Score: {score:5.1f}% | Category: {cat}")
