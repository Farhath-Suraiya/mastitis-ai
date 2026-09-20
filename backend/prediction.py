import json
from sqlalchemy.orm import Session
from database import AnimalModel, PredictionRecord
from ml.predict import predict_single
from recommendations import generate_recommendations
from alerts import create_alert_if_needed
import sms_service

def run_prediction_for_animal(db: Session, animal: AnimalModel) -> dict:
    """
    Constructs feature dictionary from AnimalModel object, invokes ML prediction,
    generates recommendations, logs prediction record, and checks alert generation.
    """
    data_dict = {
        "animal_id": animal.animal_id,
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
        "sensor_status": animal.sensor_status
    }

    pred_res = predict_single(data_dict)
    
    # Generate recommendations
    recs = generate_recommendations(data_dict, pred_res["risk_score"], pred_res["risk_factors"])
    pred_res["recommendations"] = recs
    pred_res["animal_id"] = animal.animal_id

    # Persist prediction to database
    p_record = PredictionRecord(
        animal_id=animal.animal_id,
        risk_score=pred_res["risk_score"],
        risk_category=pred_res["risk_category"],
        forecast=pred_res["forecast"],
        prediction=pred_res["prediction"],
        probability=pred_res["probability"],
        risk_factors_json=json.dumps(pred_res["risk_factors"]),
        recommendations_json=json.dumps(recs)
    )
    db.add(p_record)
    db.commit()

    # Trigger alert if Moderate or High risk
    create_alert_if_needed(
        db=db,
        animal_id=animal.animal_id,
        farm_id=animal.farm_id,
        risk_score=pred_res["risk_score"],
        risk_category=pred_res["risk_category"],
        risk_factors=pred_res["risk_factors"]
    )

    # Auto-dispatch simulated SMS when animal is High Risk
    sms_service.auto_send_sms_if_high_risk(
        db=db,
        animal_id=animal.animal_id,
        farm_id=animal.farm_id or "",
        risk_score=pred_res["risk_score"],
        risk_category=pred_res["risk_category"],
    )

    return pred_res
