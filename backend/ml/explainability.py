import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from ml.preprocessing import clean_dataframe, FEATURE_COLUMNS, NUMERICAL_FEATURES, CATEGORICAL_FEATURES

# Feature metadata: Display names, units, normal baselines, and physiological rationale
FEATURE_METADATA = {
    "scc_cells_ml": {
        "name": "Somatic Cell Count (SCC)",
        "format": lambda v: f"{int(v):,} cells/ml" if v is not None else "N/A",
        "description": "Elevated white blood cells in milk reflect an active immune response to intramammary infection.",
        "risk_condition": lambda v: v is not None and float(v) > 200000
    },
    "milk_conductivity_ms_cm": {
        "name": "Milk Electrical Conductivity",
        "format": lambda v: f"{float(v):.2f} mS/cm" if v is not None else "N/A",
        "description": "Increased sodium (Na+) and chloride (Cl-) ion permeability from inflamed alveolar tissue increases electrical conductivity.",
        "risk_condition": lambda v: v is not None and float(v) > 5.4
    },
    "milk_yield_l_day": {
        "name": "Milk Production Yield",
        "format": lambda v: f"{float(v):.1f} L/day" if v is not None else "N/A",
        "description": "Noticeable drop in daily milk yield is an early physiological indicator of mammary epithelial stress.",
        "risk_condition": lambda v: v is not None and float(v) < 16.0
    },
    "rumination_min_day": {
        "name": "Daily Rumination Duration",
        "format": lambda v: f"{int(v)} min/day" if v is not None else "N/A",
        "description": "Depressed rumination reflects systemic discomfort, reduced feed intake, or acute metabolic stress.",
        "risk_condition": lambda v: v is not None and float(v) < 420.0
    },
    "activity_percent": {
        "name": "Cow Activity Level",
        "format": lambda v: f"{float(v):.1f}%" if v is not None else "N/A",
        "description": "Altered locomotor activity and increased resting indicate lethargy, discomfort, or systemic illness.",
        "risk_condition": lambda v: v is not None and float(v) < 70.0
    },
    "udder_surface_temperature_c": {
        "name": "Udder Surface Temperature",
        "format": lambda v: f"{float(v):.1f} °C" if v is not None else "N/A",
        "description": "Thermal elevation on udder skin surfaces is associated with local vascular vasodilation and tissue inflammation.",
        "risk_condition": lambda v: v is not None and float(v) > 36.2
    },
    "body_temperature_c": {
        "name": "Core Body Temperature",
        "format": lambda v: f"{float(v):.1f} °C" if v is not None else "N/A",
        "description": "Elevated systemic temperature indicates early inflammatory cytokine release or febrile response.",
        "risk_condition": lambda v: v is not None and float(v) > 38.9
    },
    "hygiene_score": {
        "name": "Stall & Environment Hygiene Score",
        "format": lambda v: f"{float(v):.1f} / 10" if v is not None else "N/A",
        "description": "Lower environment hygiene increases teat exposure to environmental pathogens such as E. coli and Strep. uberis.",
        "risk_condition": lambda v: v is not None and float(v) < 6.5
    },
    "milking_hygiene_score": {
        "name": "Milking Routine Hygiene Score",
        "format": lambda v: f"{float(v):.1f} / 10" if v is not None else "N/A",
        "description": "Poor pre- and post-milking disinfection protocol increases risk of contagious pathogen transmission.",
        "risk_condition": lambda v: v is not None and float(v) < 7.0
    },
    "housing_condition_score": {
        "name": "Housing Condition Score",
        "format": lambda v: f"{float(v):.1f} / 10" if v is not None else "N/A",
        "description": "Inadequate bedding dryness, poor ventilation, or overcrowding elevates bacterial load in the stall.",
        "risk_condition": lambda v: v is not None and float(v) < 6.5
    },
    "previous_mastitis": {
        "name": "Previous Mastitis History",
        "format": lambda v: "Yes (Historical Infection)" if int(v or 0) == 1 else "No",
        "description": "History of prior clinical or subclinical mastitis causes internal tissue scarring and heightened recurrence risk.",
        "risk_condition": lambda v: int(v or 0) == 1
    },
    "climate_risk": {
        "name": "Environmental & Climate Risk",
        "format": lambda v: str(v).title() if v else "Low",
        "description": "Elevated ambient heat and humidity induce thermal stress, compromising mucosal immunity and udder defense.",
        "risk_condition": lambda v: str(v).strip().lower() in ["high", "extreme", "moderate"]
    },
    "ambient_temperature_c": {
        "name": "Ambient Barn Temperature",
        "format": lambda v: f"{float(v):.1f} °C" if v is not None else "N/A",
        "description": "High ambient temperature exacerbates heat load and facilitates environmental pathogen proliferation.",
        "risk_condition": lambda v: v is not None and float(v) > 30.0
    },
    "relative_humidity_percent": {
        "name": "Barn Relative Humidity",
        "format": lambda v: f"{float(v):.1f}%" if v is not None else "N/A",
        "description": "Excess humidity impairs evaporative cooling and promotes wet bedding conditions conducive to bacterial growth.",
        "risk_condition": lambda v: v is not None and float(v) > 75.0
    },
    "vaccination_status": {
        "name": "Vaccination Status",
        "format": lambda v: str(v).title() if v else "Unknown",
        "description": "Overdue or incomplete vaccination schedules leave the herd vulnerable to preventable microbial threats.",
        "risk_condition": lambda v: str(v).strip().lower() in ["overdue", "none", "incomplete"]
    },
    "disease_history": {
        "name": "Comorbid Disease History",
        "format": lambda v: str(v).title() if v else "None",
        "description": "Prior health conditions or chronic ailments weaken systemic immunological resilience.",
        "risk_condition": lambda v: str(v).strip().lower() not in ["none", "healthy", "no"]
    },
    "treatment_history": {
        "name": "Recent Medical Treatment",
        "format": lambda v: str(v).title() if v else "None",
        "description": "Recent therapeutic interventions indicate compromised physical condition requiring continued vigilance.",
        "risk_condition": lambda v: bool(v) and str(v).strip().lower() not in ["none", "healthy", "no"]
    },
    "breed": {
        "name": "Breed Predisposition Factor",
        "format": lambda v: str(v) if v else "Unknown",
        "description": "Breed characteristics and production volumes influence physiological udder conformation and stress susceptibility.",
        "risk_condition": lambda v: True
    },
    "age_years": {
        "name": "Animal Age",
        "format": lambda v: f"{float(v):.1f} years" if v is not None else "N/A",
        "description": "Older cows face greater cumulative teat sphincter wear and decreased natural immunological competence.",
        "risk_condition": lambda v: v is not None and float(v) >= 6.0
    },
    "days_in_milk": {
        "name": "Lactation Stage (Days in Milk)",
        "format": lambda v: f"{int(v)} days" if v is not None else "N/A",
        "description": "Early peak lactation (0-60 DIM) places maximal metabolic strain on udder secretory tissue.",
        "risk_condition": lambda v: v is not None and (float(v) <= 60.0 or float(v) > 280.0)
    },
    "lactation_number": {
        "name": "Lactation Number (Parity)",
        "format": lambda v: f"Lactation {int(v)}" if v is not None else "N/A",
        "description": "Multi-parity animals have wider teat canals and increased historical exposure to milking stress.",
        "risk_condition": lambda v: v is not None and float(v) >= 4
    },
    "water_intake_l_day": {
        "name": "Daily Water Intake",
        "format": lambda v: f"{float(v):.1f} L/day" if v is not None else "N/A",
        "description": "Inadequate hydration exacerbates heat stress and impairs normal physiological clearance.",
        "risk_condition": lambda v: v is not None and float(v) < 55.0
    },
    "worker_hygiene_score": {
        "name": "Worker Hygiene & Handling Score",
        "format": lambda v: f"{float(v):.1f} / 10" if v is not None else "N/A",
        "description": "Inconsistent milking unit sanitization or glove hygiene between cows elevates cross-contamination risk.",
        "risk_condition": lambda v: v is not None and float(v) < 7.0
    },
    "co_morbidity": {
        "name": "Co-morbidity Indicator",
        "format": lambda v: "Present" if int(v or 0) == 1 else "None",
        "description": "Concurrent metabolic or physical illness diverts immune resources away from mammary defense.",
        "risk_condition": lambda v: int(v or 0) == 1
    }
}


def compute_tree_contributions(rf_model, X_trans: np.ndarray) -> Tuple[float, np.ndarray]:
    """
    Computes local feature contributions for an individual prediction using
    exact Random Forest decision tree path decomposition.

    For each tree:
        contribution(feature) = sum_{splits on feature} [ P(child_node) - P(parent_node) ]
    Averaged across all estimators in the ensemble.
    Returns:
        (bias, contributions) where bias + sum(contributions) == rf_model.predict_proba(X_trans)[0, 1]
    """
    indicator, n_nodes_ptr = rf_model.decision_path(X_trans)
    indices = indicator.indices

    n_features = X_trans.shape[1]
    contributions = np.zeros(n_features)
    biases = []

    for i, tree in enumerate(rf_model.estimators_):
        start = n_nodes_ptr[i]
        end = n_nodes_ptr[i + 1]
        tree_nodes = indices[(indices >= start) & (indices < end)] - start
        t = tree.tree_

        values = t.value[:, 0, :]
        probs = values[:, 1] / values.sum(axis=1)
        biases.append(probs[0])

        for j in range(len(tree_nodes) - 1):
            curr_n = tree_nodes[j]
            next_n = tree_nodes[j + 1]
            feat = t.feature[curr_n]
            if feat >= 0:
                contributions[feat] += (probs[next_n] - probs[curr_n])

    n_estimators = len(rf_model.estimators_)
    contributions /= n_estimators
    bias = float(np.mean(biases))

    return bias, contributions


def extract_model_derived_risk_factors(
    data_dict: dict,
    rf_model,
    preprocessor,
    feature_names: List[str],
    global_importances: List[dict] = None
) -> List[Dict[str, Any]]:
    """
    Identifies authentic, model-derived risk factors for a specific animal.
    Adheres strictly to the following rules:
      1. No fake or hardcoded reasons.
      2. Features must have positive model contribution to risk (C_j > 0).
      3. Actual animal data must substantiate the risk condition.
      4. Categorical encoded features are mapped back to readable names.
      5. Returned factors are sorted by model risk contribution magnitude.
    """
    df_single = pd.DataFrame([data_dict])
    df_clean = clean_dataframe(df_single)

    for col in FEATURE_COLUMNS:
        if col not in df_clean.columns:
            df_clean[col] = np.nan

    X_single = df_clean[FEATURE_COLUMNS]
    X_trans = preprocessor.transform(X_single)

    # 1. Compute exact local tree-path contributions
    bias, contributions = compute_tree_contributions(rf_model, X_trans)

    # 2. Map encoded features back to parent original features
    feature_contributions = {}
    for feat_name, c in zip(feature_names, contributions):
        matched = False
        for orig in FEATURE_COLUMNS:
            if feat_name == orig or feat_name.startswith(orig + "_"):
                feature_contributions[orig] = feature_contributions.get(orig, 0.0) + float(c)
                matched = True
                break
        if not matched:
            feature_contributions[feat_name] = feature_contributions.get(feat_name, 0.0) + float(c)

    # 3. Filter candidates: must have positive model contribution
    # We only include factors that actively shifted probability toward mastitis
    MIN_CONTRIBUTION_THRESHOLD = 0.003  # At least +0.3% risk contribution

    candidates = []
    for feat, contrib in feature_contributions.items():
        if contrib < MIN_CONTRIBUTION_THRESHOLD:
            continue

        raw_val = data_dict.get(feat)
        meta = FEATURE_METADATA.get(feat, {
            "name": feat.replace("_", " ").title(),
            "format": lambda v: str(v) if v is not None else "N/A",
            "description": f"Observed reading contributing to model risk probability.",
            "risk_condition": lambda v: True
        })

        # Check that actual animal data supports this feature being in a risk state
        risk_checker = meta.get("risk_condition", lambda v: True)
        if not risk_checker(raw_val):
            # If the animal's value is completely normal, do not falsely claim it as an adverse factor
            continue

        candidates.append((feat, contrib, raw_val, meta))

    # 4. Sort descending by model risk contribution
    candidates.sort(key=lambda x: x[1], reverse=True)

    # 5. Format into standardized RiskFactor dictionaries
    risk_factors = []
    for feat, contrib, raw_val, meta in candidates[:6]:  # Show top 5-6 factors
        contrib_pct = round(contrib * 100.0, 1)

        # Impact calibration based on model probability contribution
        if contrib >= 0.045:
            impact = "High"
        elif contrib >= 0.015:
            impact = "Medium"
        else:
            impact = "Low"

        formatted_val = meta["format"](raw_val)
        desc = meta["description"]

        risk_factors.append({
            "feature": feat,
            "name": meta["name"],
            "value": formatted_val,
            "impact": impact,
            "contribution_pct": contrib_pct,
            "description": desc
        })

    return risk_factors
