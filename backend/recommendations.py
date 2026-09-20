from typing import List, Dict, Any

def generate_recommendations(data_dict: dict, risk_score: float, risk_factors: list) -> List[Dict[str, Any]]:
    """
    Generates preventive and monitoring recommendations based on parameters and risk level.
    Ensures NO automatic antibiotic or medical prescription occurs.
    """
    recs = []
    
    scc = float(data_dict.get('scc_cells_ml', 0) or 0)
    cond = float(data_dict.get('milk_conductivity_ms_cm', 0) or 0)
    yield_l = float(data_dict.get('milk_yield_l_day', 0) or 0)
    rumination = float(data_dict.get('rumination_min_day', 0) or 0)
    hygiene = float(data_dict.get('hygiene_score', 0) or 0)
    milking_hygiene = float(data_dict.get('milking_hygiene_score', 0) or 0)
    prev_mastitis = int(data_dict.get('previous_mastitis', 0) or 0)
    body_temp = float(data_dict.get('body_temperature_c', 0) or 0)

    # 1. High SCC Rule
    if scc > 250000:
        recs.append({
            "id": "rec_scc",
            "category": "Milk Quality",
            "title": "Somatic Cell Count (SCC) Monitoring",
            "action": "Perform individual quarter Somatic Cell Count (SCC) or California Mastitis Test (CMT) check and monitor the animal closely over the next 48 hours.",
            "priority": "HIGH" if scc > 400000 else "MEDIUM"
        })

    # 2. High Conductivity Rule
    if cond > 5.5:
        recs.append({
            "id": "rec_cond",
            "category": "Udder Health",
            "title": "Milk Electrical Conductivity Inspection",
            "action": "Inspect udder quarters for physical swelling, heat, or early milk texture variations (flakes/clots).",
            "priority": "HIGH" if cond > 6.2 else "MEDIUM"
        })

    # 3. Reduced Milk Yield Rule
    if yield_l < 15.0:
        recs.append({
            "id": "rec_yield",
            "category": "Production",
            "title": "Milk Yield Production Review",
            "action": "Review recent 7-day milk yield trends and check for sudden production drop or appetite loss.",
            "priority": "MEDIUM"
        })

    # 4. Low Rumination Rule
    if rumination < 400 and rumination > 0:
        recs.append({
            "id": "rec_rumination",
            "category": "Behavior & Digestion",
            "title": "Rumination & Feeding Assessment",
            "action": "Review feeding behavior, forage quality, and monitor for early systemic discomfort or metabolic stress.",
            "priority": "MEDIUM"
        })

    # 5. Low Hygiene Score Rule
    if hygiene < 6.5 or milking_hygiene < 6.5:
        recs.append({
            "id": "rec_hygiene",
            "category": "Sanitation",
            "title": "Milking & Environment Hygiene Protocols",
            "action": "Sanitize milking unit teats before and after milking, replace worn teat cups, and clean stall bedding to minimize bacterial load.",
            "priority": "MEDIUM"
        })

    # 6. Previous Mastitis History Rule
    if prev_mastitis == 1:
        recs.append({
            "id": "rec_history",
            "category": "History Surveillance",
            "title": "High-Surveillance Protocol",
            "action": "Increase observation frequency for this animal as prior mastitis cases increase recurrence risk.",
            "priority": "MEDIUM"
        })

    # 7. High Body Temperature Rule
    if body_temp > 39.0:
        recs.append({
            "id": "rec_temp",
            "category": "Systemic Health",
            "title": "Thermal & Temperature Monitoring",
            "action": "Isolate cow in a shaded, well-ventilated area, provide clean fresh water, and track temperature twice daily.",
            "priority": "HIGH"
        })

    # 8. High Risk Severity Trigger
    if risk_score > 60 or len(risk_factors) >= 3:
        recs.insert(0, {
            "id": "rec_vet",
            "category": "Veterinary Review",
            "title": "Prioritize Professional Veterinary Assessment",
            "action": "Prioritize a physical veterinary udder examination and milk microbiology/sensitivity test before taking therapeutic action.",
            "priority": "CRITICAL"
        })
    elif not recs:
        # Default preventive routine care recommendation for healthy/low risk animals
        recs.append({
            "id": "rec_routine",
            "category": "Routine Care",
            "title": "Standard Preventive Maintenance",
            "action": "Maintain standard milking routine, clean water access, and routine herd health monitoring.",
            "priority": "LOW"
        })

    return recs
