import urllib.request
import json
import sys

BASE_URL = 'http://127.0.0.1:8000'

def get(path):
    with urllib.request.urlopen(BASE_URL + path, timeout=10) as resp:
        return json.loads(resp.read().decode('utf-8'))

def post(path, data):
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(
        BASE_URL + path,
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode('utf-8'))

print('=== STARTING TESTS ===')

# Initial Dashboard State
init_summary = get('/herd-summary')
print(f"Initial Herd Summary: High Risk Count = {init_summary['high_risk_count']}, Moderate = {init_summary['moderate_risk_count']}, No Risk = {init_summary['no_risk_count']}, Low = {init_summary['low_risk_count']}")

# TEST 1: NO/LOW RISK (COW-486)
print('\n--- TEST 1: NO/LOW RISK (COW-486) ---')
cow486_detail = get('/animals/COW-486')
print(f"COW-486 Baseline SCC: {cow486_detail['scc_cells_ml']}, Temp: {cow486_detail['body_temperature_c']}")
sim_payload_1 = {
    'animal_id': 'COW-486',
    'body_temperature_c': float(cow486_detail['body_temperature_c'] or 38.4),
    'udder_surface_temperature_c': float(cow486_detail['udder_surface_temperature_c'] or 35.0),
    'milk_conductivity_ms_cm': float(cow486_detail['milk_conductivity_ms_cm'] or 4.9),
    'milk_temperature_c': float(cow486_detail['milk_temperature_c'] or 34.8),
    'milk_yield_l_day': float(cow486_detail['milk_yield_l_day'] or 22.0),
    'activity_percent': float(cow486_detail['activity_percent'] or 88.0),
    'rumination_min_day': float(cow486_detail['rumination_min_day'] or 490.0),
    'scc_cells_ml': int(cow486_detail['scc_cells_ml'] or 95000),
    'water_intake_l_day': float(cow486_detail['water_intake_l_day'] or 78.0),
    'feeding_behavior_score': float(cow486_detail['feeding_behavior_score'] or 8.5),
    'ambient_temperature_c': float(cow486_detail['ambient_temperature_c'] or 24.0),
    'relative_humidity_percent': float(cow486_detail['relative_humidity_percent'] or 62.0)
}
res1 = post('/simulate-sensor', sim_payload_1)
print(f"Result: Category = {res1['ai_assessment']['risk_category']}, Score = {res1['ai_assessment']['risk_score']}%, Alert Created = {res1['alert_created']}")
assert res1['ai_assessment']['risk_category'] in ['No Risk', 'Low Risk'], f"Expected No or Low Risk, got {res1['ai_assessment']['risk_category']}"
assert res1['alert_created'] == False, 'Expected alert_created to be False'
sum1 = get('/herd-summary')
assert sum1['high_risk_count'] == init_summary['high_risk_count'], 'High risk count should NOT increase'
print('TEST 1 PASSED!')

# TEST 2: MODERATE RISK (COW-157)
print('\n--- TEST 2: MODERATE RISK (COW-157) ---')
cow157_detail = get('/animals/COW-157')
print(f"COW-157 Baseline SCC: {cow157_detail['scc_cells_ml']}, Temp: {cow157_detail['body_temperature_c']}, Score: {cow157_detail['ai_assessment']['risk_score']}%")
sim_payload_2 = {
    'animal_id': 'COW-157',
    'body_temperature_c': float(cow157_detail['body_temperature_c'] or 38.3),
    'udder_surface_temperature_c': float(cow157_detail['udder_surface_temperature_c'] or 37.7),
    'milk_conductivity_ms_cm': float(cow157_detail['milk_conductivity_ms_cm'] or 5.59),
    'milk_temperature_c': float(cow157_detail['milk_temperature_c'] or 38.15),
    'milk_yield_l_day': float(cow157_detail['milk_yield_l_day'] or 17.55),
    'activity_percent': float(cow157_detail['activity_percent'] or 78.0),
    'rumination_min_day': float(cow157_detail['rumination_min_day'] or 470.0),
    'scc_cells_ml': int(cow157_detail['scc_cells_ml'] or 152000),
    'water_intake_l_day': float(cow157_detail['water_intake_l_day'] or 70.0),
    'feeding_behavior_score': float(cow157_detail['feeding_behavior_score'] or 9.4),
    'ambient_temperature_c': float(cow157_detail['ambient_temperature_c'] or 25.0),
    'relative_humidity_percent': float(cow157_detail['relative_humidity_percent'] or 65.0)
}
res2 = post('/simulate-sensor', sim_payload_2)
print(f"Result: Category = {res2['ai_assessment']['risk_category']}, Score = {res2['ai_assessment']['risk_score']}%, Alert Created = {res2['alert_created']}")
assert res2['ai_assessment']['risk_category'] == 'Moderate Risk', f"Expected Moderate Risk, got {res2['ai_assessment']['risk_category']}"
assert res2['alert_created'] == False, 'Expected alert_created to be False for Moderate Risk'
animals_res2 = get('/animals?search=COW-157')
assert animals_res2['animals'][0]['risk_category'] == 'Moderate Risk', 'Animals page must show Moderate Risk'
sum2 = get('/herd-summary')
assert sum2['high_risk_count'] == init_summary['high_risk_count'], 'Dashboard must NOT count moderate risk as high risk'
print('TEST 2 PASSED!')

# TEST 3: HIGH RISK (COW-194)
print('\n--- TEST 3: HIGH RISK (COW-194) ---')
cow194_detail = get('/animals/COW-194')
print(f"COW-194 Baseline SCC: {cow194_detail['scc_cells_ml']}, Temp: {cow194_detail['body_temperature_c']}, Score: {cow194_detail['ai_assessment']['risk_score']}%")
sim_payload_3 = {
    'animal_id': 'COW-194',
    'body_temperature_c': float(cow194_detail['body_temperature_c'] or 38.48),
    'udder_surface_temperature_c': float(cow194_detail['udder_surface_temperature_c'] or 37.37),
    'milk_conductivity_ms_cm': float(cow194_detail['milk_conductivity_ms_cm'] or 6.73),
    'milk_temperature_c': float(cow194_detail['milk_temperature_c'] or 38.42),
    'milk_yield_l_day': float(cow194_detail['milk_yield_l_day'] or 8.07),
    'activity_percent': float(cow194_detail['activity_percent'] or 105.3),
    'rumination_min_day': float(cow194_detail['rumination_min_day'] or 436.0),
    'scc_cells_ml': int(cow194_detail['scc_cells_ml'] or 303790),
    'water_intake_l_day': float(cow194_detail['water_intake_l_day'] or 83.4),
    'feeding_behavior_score': float(cow194_detail['feeding_behavior_score'] or 7.6),
    'ambient_temperature_c': float(cow194_detail['ambient_temperature_c'] or 38.0),
    'relative_humidity_percent': float(cow194_detail['relative_humidity_percent'] or 79.2)
}
res3 = post('/simulate-sensor', sim_payload_3)
print(f"Result: Category = {res3['ai_assessment']['risk_category']}, Score = {res3['ai_assessment']['risk_score']}%, Alert Created = {res3['alert_created']}")
assert res3['ai_assessment']['risk_category'] == 'High Risk', f"Expected High Risk, got {res3['ai_assessment']['risk_category']}"
assert res3['alert_created'] == True, 'Expected alert_created to be True for High Risk'
sum3 = get('/herd-summary')
high_cow_ids = [h['animal_id'] for h in sum3['high_risk_animals']]
print(f"Dashboard High Risk Count: {sum3['high_risk_count']}, High Risk Animals: {high_cow_ids}")
assert 'COW-194' in high_cow_ids, 'COW-194 must appear in high risk animals on Dashboard'
animals_res3 = get('/animals?search=COW-194')
assert animals_res3['animals'][0]['risk_category'] == 'High Risk', 'Animals page must show High Risk'
print('TEST 3 PASSED!')

# TEST 4: SAME COW AGAIN (COW-194)
print('\n--- TEST 4: SAME COW AGAIN (COW-194) ---')
res4 = post('/simulate-sensor', sim_payload_3)
sum4 = get('/herd-summary')
high_cow_ids_4 = [h['animal_id'] for h in sum4['high_risk_animals']]
print(f"Dashboard High Risk Count: {sum4['high_risk_count']}, High Risk Animals: {high_cow_ids_4}")
assert sum4['high_risk_count'] == sum3['high_risk_count'], 'Duplicate high risk cow count must NOT occur'
assert high_cow_ids_4.count('COW-194') == 1, 'COW-194 must appear exactly ONCE'
print('TEST 4 PASSED!')

# TEST 5: DIFFERENT COW (COW-001)
print('\n--- TEST 5: DIFFERENT COW (COW-001) ---')
cow001_detail = get('/animals/COW-001')
print(f"COW-001 Baseline SCC: {cow001_detail['scc_cells_ml']}, Temp: {cow001_detail['body_temperature_c']}")
sim_payload_5 = {
    'animal_id': 'COW-001',
    'body_temperature_c': float(cow001_detail['body_temperature_c'] or 38.3),
    'udder_surface_temperature_c': float(cow001_detail['udder_surface_temperature_c'] or 35.0),
    'milk_conductivity_ms_cm': float(cow001_detail['milk_conductivity_ms_cm'] or 4.8),
    'milk_temperature_c': float(cow001_detail['milk_temperature_c'] or 34.7),
    'milk_yield_l_day': float(cow001_detail['milk_yield_l_day'] or 22.0),
    'activity_percent': float(cow001_detail['activity_percent'] or 88.0),
    'rumination_min_day': float(cow001_detail['rumination_min_day'] or 490.0),
    'scc_cells_ml': int(cow001_detail['scc_cells_ml'] or 92000),
    'water_intake_l_day': float(cow001_detail['water_intake_l_day'] or 78.0),
    'feeding_behavior_score': float(cow001_detail['feeding_behavior_score'] or 8.5),
    'ambient_temperature_c': float(cow001_detail['ambient_temperature_c'] or 24.0),
    'relative_humidity_percent': float(cow001_detail['relative_humidity_percent'] or 62.0)
}
res5 = post('/simulate-sensor', sim_payload_5)
print(f"Result: Category = {res5['ai_assessment']['risk_category']}, Score = {res5['ai_assessment']['risk_score']}%, Alert Created = {res5['alert_created']}")
assert res5['ai_assessment']['risk_category'] == 'No Risk', 'Expected No Risk for healthy COW-001'
assert res5['ai_assessment']['animal_id'] == 'COW-001'
print('TEST 5 PASSED!')

print('\n========================================')
print('ALL 5 TESTS COMPLETED AND VERIFIED 100%!')
print('========================================')
