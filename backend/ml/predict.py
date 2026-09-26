import os
import joblib
import json
import logging
import pandas as pd
import numpy as np
from ml.preprocessing import clean_dataframe, FEATURE_COLUMNS
from ml.train_model import MODEL_PATH, train_and_save

logger = logging.getLogger("mastitis.prediction")
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

def probability_to_calibrated_risk_score(prob: float) -> float:
    """
    Monotonically maps the raw Random Forest positive-class probability P(mastitis_within_7_14_days=1)
    to a standardized 0-100% risk score index calibrated against the empirical distribution
    of the trained model (where target positive prevalence is ~3.68% and raw probabilities span 0.01 to 0.775):
      prob < 0.13: No Risk [0, 20)
      0.13 <= prob < 0.22: Low Risk [20, 40)
      0.22 <= prob < 0.35: Moderate Risk [40, 60)
      prob >= 0.35: High Risk [60, 100]
    """
    prob = max(0.0, min(1.0, float(prob)))
    if prob < 0.13:
        score = (prob / 0.13) * 20.0
    elif prob < 0.22:
        score = 20.0 + ((prob - 0.13) / (0.22 - 0.13)) * 20.0
    elif prob < 0.35:
        score = 40.0 + ((prob - 0.22) / (0.35 - 0.22)) * 20.0
    else:
        score = 60.0 + min(40.0, ((prob - 0.35) / (0.65 - 0.35)) * 40.0)
    return round(float(score), 1)

def compute_risk_category(risk_score: float) -> str:
    if risk_score < 20.0:
        return "No Risk"
    elif risk_score < 40.0:
        return "Low Risk"
    elif risk_score < 60.0:
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
    
    # Preprocess features
    X_trans = preprocessor.transform(X_single)
    
    # Determine positive-class index explicitly from rf_model.classes_
    classes = list(rf_model.classes_)
    pos_idx = classes.index(1) if 1 in classes else (classes.index(True) if True in classes else 1)
    
    # Predict probabilities
    raw_probs = rf_model.predict_proba(X_trans)[0]
    prob = float(raw_probs[pos_idx])
    
    risk_score = probability_to_calibrated_risk_score(prob)
    risk_category = compute_risk_category(risk_score)
    pred_binary = 1 if prob >= 0.5 else 0
    
    # Trace log the exact pipeline values immediately around predict_proba()
    print("=" * 60)
    print("PREDICTION PIPELINE TRACE")
    print("=" * 60)
    print(f"1. Complete feature DataFrame shape: {X_single.shape}")
    print(f"2. Feature names ({len(FEATURE_COLUMNS)} features):\n   {FEATURE_COLUMNS}")
    print(f"3. Feature values:\n{json.dumps(X_single.iloc[0].dropna().to_dict(), indent=2, default=str)}")
    print(f"4. model.classes_: {rf_model.classes_}")
    print(f"5. model.predict_proba(X): {raw_probs}")
    print(f"6. Positive class index: {pos_idx} -> P(mastitis_within_7_14_days=1) = {prob:.4f}")
    print(f"7. Final calibrated risk score: {risk_score}%")
    print(f"8. Final risk category: {risk_category}")
    print("=" * 60)
    
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
        "raw_probabilities": [float(p) for p in raw_probs],
        "risk_factors": risk_factors
    }


