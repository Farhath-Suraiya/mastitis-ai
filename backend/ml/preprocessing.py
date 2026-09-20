import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Explicit feature list to prevent data leakage
CATEGORICAL_FEATURES = [
    'breed',
    'disease_history',
    'vaccination_status',
    'treatment_history',
    'milking_schedule',
    'climate_risk',
    'sensor_status'
]

NUMERICAL_FEATURES = [
    'age_years',
    'lactation_number',
    'days_in_milk',
    'previous_mastitis',
    'milk_yield_l_day',
    'scc_cells_ml',
    'milk_conductivity_ms_cm',
    'milk_temperature_c',
    'body_temperature_c',
    'udder_surface_temperature_c',
    'activity_percent',
    'rumination_min_day',
    'feeding_behavior_score',
    'water_intake_l_day',
    'feed_quality_score',
    'hygiene_score',
    'housing_condition_score',
    'milking_hygiene_score',
    'worker_hygiene_score',
    'milking_frequency_per_day',
    'ambient_temperature_c',
    'relative_humidity_percent',
    'co_morbidity'
]

FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
TARGET_COLUMN = 'mastitis_within_7_14_days'
LEAKAGE_COLUMNS = ['ai_risk_score', 'risk_category', 'forecast_lead_days']
ID_COLUMNS = ['record_id', 'farm_id', 'animal_id']

def create_preprocessor():
    """
    Builds a scikit-learn ColumnTransformer for imputing, scaling, and encoding features.
    """
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='None')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, NUMERICAL_FEATURES),
            ('cat', cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder='drop'
    )
    return preprocessor

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Basic dataframe cleaning before feature extraction.
    """
    df_clean = df.copy()
    # Fill categorical missing values explicitly with string 'None'
    for col in CATEGORICAL_FEATURES:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].fillna('None').astype(str)
            
    # Ensure numerical columns are float/int
    for col in NUMERICAL_FEATURES:
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
            
    return df_clean
