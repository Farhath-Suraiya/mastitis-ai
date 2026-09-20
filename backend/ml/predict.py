import os
import joblib
import pandas as pd
import numpy as np
from ml.preprocessing import clean_dataframe, FEATURE_COLUMNS
from ml.train_model import MODEL_PATH, train_and_save

_MODEL_CACHE = None

def get_model_payload():
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE
        
    if not os.path.exists(MODEL_PATH):
        print(f"Model file {MODEL_PATH} not found. Running training step...")
        _MODEL_CACHE = train_and_save()
    else:
        _MODEL_CACHE = joblib.load(MODEL_PATH)
        
    return _MODEL_CACHE

def compute_risk_category(risk_score: float) -> str:
    if risk_score <= 20:
        return "No Risk"
    elif risk_score <= 40:
        return "Low Risk"
    elif risk_score <= 60:
        return "Moderate Risk"
    else:
        return "High Risk"

from ml.explainability import extract_model_derived_risk_factors
from ml.train_model import get_feature_names

def calculate_individual_risk_factors(data_dict: dict, rf_model, preprocessor, feature_names: list, feature_importances: list = None) -> list:
    """
    Identifies actual features contributing to the prediction using the trained
    Random Forest tree-path decomposition and verified against actual animal data.
    """
    if not feature_names:
        feature_names = get_feature_names(preprocessor)
        
    return extract_model_derived_risk_factors(
        data_dict=data_dict,
        rf_model=rf_model,
        preprocessor=preprocessor,
        feature_names=feature_names,
        global_importances=feature_importances
    )

def predict_single(data_dict: dict) -> dict:
    payload = get_model_payload()
    preprocessor = payload["preprocessor"]
    rf_model = payload["rf_model"]
    
    df_single = pd.DataFrame([data_dict])
    df_clean = clean_dataframe(df_single)
    
    # Ensure all required feature columns exist
    for col in FEATURE_COLUMNS:
        if col not in df_clean.columns:
            df_clean[col] = np.nan
            
    X_single = df_clean[FEATURE_COLUMNS]
    X_trans = preprocessor.transform(X_single)
    
    prob = float(rf_model.predict_proba(X_trans)[0, 1])
    risk_score = round(prob * 100.0, 1)
    risk_category = compute_risk_category(risk_score)
    pred_binary = 1 if prob >= 0.5 else 0
    
    feature_names = payload.get("feature_names")
    if not feature_names:
        feature_names = get_feature_names(preprocessor)
        
    risk_factors = calculate_individual_risk_factors(
        data_dict=data_dict,
        rf_model=rf_model,
        preprocessor=preprocessor,
        feature_names=feature_names,
        feature_importances=payload.get("feature_importances", [])
    )
    
    return {
        "risk_score": risk_score,
        "risk_category": risk_category,
        "forecast": "7–14 days",
        "prediction": pred_binary,
        "probability": prob,
        "risk_factors": risk_factors
    }

