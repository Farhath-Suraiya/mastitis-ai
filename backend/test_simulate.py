import urllib.request
import urllib.parse
import json

def post_simulate(cow_id, body_temp, scc, conductivity, milk_yield):
    payload = json.dumps({
        "animal_id": cow_id,
        "body_temperature_c": body_temp,
        "udder_surface_temperature_c": 35.5,
        "milk_conductivity_ms_cm": conductivity,
        "milk_temperature_c": 34.8,
        "milk_yield_l_day": milk_yield,
        "activity_percent": 80.0,
        "rumination_min_day": 470,
        "scc_cells_ml": scc,
        "water_intake_l_day": 75.0,
        "feeding_behavior_score": 8.0,
        "ambient_temperature_c": 24.0,
        "relative_humidity_percent": 62.0
    }).encode('utf-8')
    req = urllib.request.Request(
        'http://localhost:8000/simulate-sensor',
        data=payload,
        method='POST',
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
    ai = data['ai_assessment']
    alert = data['alert_created']
    print(cow_id + ': ' + ai['risk_category'] + ' | score=' + str(ai['risk_score']) + '% | alert=' + str(alert))

# Test LOW RISK cow with healthy vitals
post_simulate('COW-001', 38.3, 90000, 4.8, 22.0)

# Test HIGH RISK cow with mastitis-like vitals  
post_simulate('COW-363', 39.8, 650000, 7.2, 9.0)

# Test same high-risk cow again (should NOT duplicate alert)
post_simulate('COW-363', 39.6, 700000, 7.0, 8.0)
