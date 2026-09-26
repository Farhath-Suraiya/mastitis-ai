import pandas as pd
import numpy as np
import joblib
from database import SessionLocal, AnimalModel
from ml.preprocessing import clean_dataframe, FEATURE_COLUMNS

db = SessionLocal()
animals = db.query(AnimalModel).all()

payload = joblib.load("ml/model.pkl")
preprocessor = payload["preprocessor"]
rf = payload["rf_model"]

rows = []
for a in animals:
    rows.append({
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
    })

base_df = pd.DataFrame(rows)

def eval_df(df_in):
    df_c = clean_dataframe(df_in)
    for c in FEATURE_COLUMNS:
        if c not in df_c.columns:
            df_c[c] = np.nan
    X = df_c[FEATURE_COLUMNS]
    X_trans = preprocessor.transform(X)
    return rf.predict_proba(X_trans)[:, 1]

# 1. Baseline
p_base = eval_df(base_df)

# 2. Scenario 1: Healthy Cow
df_s1 = base_df.copy()
df_s1["milk_yield_l_day"] = 22.0
df_s1["scc_cells_ml"] = 95000
df_s1["milk_conductivity_ms_cm"] = 4.85
df_s1["body_temperature_c"] = 38.4
df_s1["udder_surface_temperature_c"] = 37.1
df_s1["milk_temperature_c"] = 38.2
df_s1["activity_percent"] = 88.0
df_s1["rumination_min_day"] = 500.0
p_s1 = eval_df(df_s1)

# 3. Scenario 2: Early Warning
df_s2 = base_df.copy()
df_s2["milk_yield_l_day"] = 15.0
df_s2["scc_cells_ml"] = 210000
df_s2["milk_conductivity_ms_cm"] = 5.55
df_s2["body_temperature_c"] = 38.68
df_s2["udder_surface_temperature_c"] = 37.70
df_s2["milk_temperature_c"] = 38.5
df_s2["activity_percent"] = 80.0
df_s2["rumination_min_day"] = 475.0
p_s2 = eval_df(df_s2)

# 4. Scenario 3: Developing / Moderate Mastitis
df_s3 = base_df.copy()
df_s3["milk_yield_l_day"] = 8.5
df_s3["scc_cells_ml"] = 310000
df_s3["milk_conductivity_ms_cm"] = 5.80
df_s3["body_temperature_c"] = 38.90
df_s3["udder_surface_temperature_c"] = 38.10
df_s3["milk_temperature_c"] = 38.8
df_s3["activity_percent"] = 72.0
df_s3["rumination_min_day"] = 450.0
p_s3 = eval_df(df_s3)

# 5. Scenario 4: Acute / High Risk Mastitis
df_s4 = base_df.copy()
df_s4["milk_yield_l_day"] = 3.5
df_s4["scc_cells_ml"] = 420000
df_s4["milk_conductivity_ms_cm"] = 6.20
df_s4["body_temperature_c"] = 39.25
df_s4["udder_surface_temperature_c"] = 38.50
df_s4["milk_temperature_c"] = 39.1
df_s4["activity_percent"] = 64.0
df_s4["rumination_min_day"] = 420.0
p_s4 = eval_df(df_s4)

print("=" * 60)
print("FAST VECTORIZED SCENARIOS EVALUATION ACROSS ALL 500 COWS")
print("=" * 60)
print(f"Current DB Baseline: min={p_base.min():.4f}, mean={p_base.mean():.4f}, max={p_base.max():.4f}")
print(f"Scenario 1 (Healthy): min={p_s1.min():.4f}, mean={p_s1.mean():.4f}, max={p_s1.max():.4f}")
print(f"Scenario 2 (Early Warning): min={p_s2.min():.4f}, mean={p_s2.mean():.4f}, max={p_s2.max():.4f}")
print(f"Scenario 3 (Developing/Mod): min={p_s3.min():.4f}, mean={p_s3.mean():.4f}, max={p_s3.max():.4f}")
print(f"Scenario 4 (High Risk/Acute): min={p_s4.min():.4f}, mean={p_s4.mean():.4f}, max={p_s4.max():.4f}")
