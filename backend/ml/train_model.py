import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from ml.preprocessing import (
    create_preprocessor,
    clean_dataframe,
    FEATURE_COLUMNS,
    TARGET_COLUMN,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES
)
from ml.evaluate_model import calculate_metrics

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "bovine_mastitis_synthetic_10000.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def get_feature_names(preprocessor):
    """
    Extract feature names after one-hot encoding.
    """
    feature_names = list(NUMERICAL_FEATURES)
    try:
        cat_encoder = preprocessor.named_transformers_['cat'].named_steps['onehot']
        encoded_cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
        feature_names.extend(encoded_cat_names)
    except Exception as e:
        print(f"Warning extracting feature names: {e}")
    return feature_names

def train_and_save():
    print(f"Loading dataset from: {DATA_PATH}")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
        
    df = pd.read_csv(DATA_PATH)
    df_clean = clean_dataframe(df)
    
    X = df_clean[FEATURE_COLUMNS]
    y = df_clean[TARGET_COLUMN].values
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    preprocessor = create_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    
    feature_names = get_feature_names(preprocessor)
    
    # 1. Baseline Model: Logistic Regression with balanced class weights
    print("Training Baseline Model (Logistic Regression with class_weight='balanced')...")
    baseline_clf = LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced')
    baseline_clf.fit(X_train_trans, y_train)
    
    y_prob_base = baseline_clf.predict_proba(X_test_trans)[:, 1]
    y_pred_base = (y_prob_base >= 0.5).astype(int)
    baseline_metrics = calculate_metrics(y_test, y_pred_base, y_prob_base)
    print(f"Baseline Metrics: {baseline_metrics}")
    
    # 2. Primary Model: Random Forest Classifier with balanced class weights
    print("Training Primary Model (Random Forest Classifier with class_weight='balanced')...")
    rf_clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    rf_clf.fit(X_train_trans, y_train)
    
    y_prob_rf = rf_clf.predict_proba(X_test_trans)[:, 1]
    y_pred_rf = (y_prob_rf >= 0.5).astype(int)
    rf_metrics = calculate_metrics(y_test, y_pred_rf, y_prob_rf)
    print(f"Random Forest Metrics: {rf_metrics}")
    
    # Compute feature importances
    importances = rf_clf.feature_importances_
    feature_importance_dict = {}
    
    for orig_feat in FEATURE_COLUMNS:
        feature_importance_dict[orig_feat] = 0.0
        
    for name, imp in zip(feature_names, importances):
        matched = False
        for orig_feat in FEATURE_COLUMNS:
            if name == orig_feat or name.startswith(orig_feat + "_"):
                feature_importance_dict[orig_feat] += float(imp)
                matched = True
                break
        if not matched:
            feature_importance_dict[name] = float(imp)
            
    # Sort feature importances
    sorted_importances = sorted(
        [{"feature": k, "name": k.replace('_', ' ').title(), "importance": round(v, 4)} for k, v in feature_importance_dict.items()],
        key=lambda x: x["importance"],
        reverse=True
    )
    
    model_payload = {
        "preprocessor": preprocessor,
        "rf_model": rf_clf,
        "baseline_model": baseline_clf,
        "metrics": {
            "random_forest": rf_metrics,
            "logistic_regression": baseline_metrics
        },
        "feature_importances": sorted_importances,
        "feature_names": feature_names,
        "feature_columns": FEATURE_COLUMNS
    }
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model_payload, MODEL_PATH)
    print(f"Model and preprocessing payload saved to {MODEL_PATH}")
    return model_payload

if __name__ == "__main__":
    train_and_save()
