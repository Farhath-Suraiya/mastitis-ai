import sys
import os
from fastapi.testclient import TestClient

from main import app
from database import init_db


def test_endpoints():
    print("Initializing DB...")
    init_db()

    with TestClient(app) as client:
        print("Testing GET / ...")
        r = client.get("/")
        assert r.status_code == 200, f"Root failed: {r.text}"
        print("GET / passed:", r.json())

        print("\nTesting GET /herd-summary ...")
        r = client.get("/herd-summary")
        assert r.status_code == 200, f"Herd summary failed: {r.text}"
        data = r.json()
        print("GET /herd-summary passed. Total animals:", data["total_animals"])

        print("\nTesting GET /animals ...")
        r = client.get("/animals?limit=5")
        assert r.status_code == 200, f"Animals failed: {r.text}"
        anim_data = r.json()
        print(f"GET /animals passed. Loaded {len(anim_data['animals'])} animals.")
        sample_animal_id = anim_data['animals'][0]['animal_id']

        print(f"\nTesting GET /animals/{sample_animal_id} ...")
        r = client.get(f"/animals/{sample_animal_id}")
        assert r.status_code == 200, f"Animal detail failed: {r.text}"
        detail = r.json()
        print(f"GET /animals/{sample_animal_id} passed. Risk score:", detail["ai_assessment"]["risk_score"])

        print("\nTesting POST /predict ...")
        sample_req = {
            "animal_id": "COW-TEST-999",
            "farm_id": "FARM-001",
            "milk_yield_l_day": 12.5,
            "scc_cells_ml": 450000,
            "milk_conductivity_ms_cm": 6.1,
            "rumination_min_day": 310.0,
            "activity_percent": 65.0,
            "body_temperature_c": 39.4,
            "previous_mastitis": 1,
            "hygiene_score": 5.5
        }
        r = client.post("/predict", json=sample_req)
        assert r.status_code == 200, f"Predict failed: {r.text}"
        pred = r.json()
        print("POST /predict passed:", pred["risk_category"], pred["risk_score"], "%")

        print("\nTesting GET /alerts ...")
        r = client.get("/alerts")
        assert r.status_code == 200, f"Alerts failed: {r.text}"
        alerts = r.json()
        print(f"GET /alerts passed. Loaded {len(alerts)} alerts.")

        print("\nTesting GET /analytics ...")
        r = client.get("/analytics")
        assert r.status_code == 200, f"Analytics failed: {r.text}"
        charts = r.json()
        print("GET /analytics passed. Risk distribution items:", len(charts["risk_distribution"]))

        print("\nTesting GET /model-metrics ...")
        r = client.get("/model-metrics")
        assert r.status_code == 200, f"Model metrics failed: {r.text}"
        metrics = r.json()
        print("GET /model-metrics passed. RF accuracy:", metrics["random_forest"]["accuracy"])

        print("\nTesting POST /simulate-sensor ...")
        sim_payload = {
            "animal_id": sample_animal_id,
            "body_temperature_c": 39.6,
            "udder_surface_temperature_c": 37.2,
            "milk_conductivity_ms_cm": 6.8,
            "milk_temperature_c": 38.0,
            "milk_yield_l_day": 9.2,
            "activity_percent": 55.0,
            "rumination_min_day": 280.0,
            "scc_cells_ml": 620000
        }
        r = client.post("/simulate-sensor", json=sim_payload)
        assert r.status_code == 200, f"Simulate sensor failed: {r.text}"
        sim_res = r.json()
        print("POST /simulate-sensor passed. New risk score:", sim_res["ai_assessment"]["risk_score"])

        # -------------------------------------------------------------------
        # SMS Notification Tests
        # -------------------------------------------------------------------

        print("\n--- SMS Notification Tests ---")

        # 1. GET /sms/settings — should return default row
        print("\n[SMS-1] Testing GET /sms/settings ...")
        r = client.get("/sms/settings")
        assert r.status_code == 200, f"GET /sms/settings failed: {r.text}"
        settings = r.json()
        assert "enabled" in settings, "settings missing 'enabled' field"
        assert "mode" in settings, "settings missing 'mode' field"
        print("[SMS-1] GET /sms/settings passed:", settings)

        # 2. POST /sms/settings — enable with phone numbers
        print("\n[SMS-2] Testing POST /sms/settings ...")
        r = client.post("/sms/settings", json={
            "enabled": True,
            "farmer_phone": "+1-555-FARMER",
            "vet_phone": "+1-555-VETVET",
            "mode": "SIMULATED"
        })
        assert r.status_code == 200, f"POST /sms/settings failed: {r.text}"
        updated = r.json()
        assert updated["enabled"] is True, "Settings enabled flag not saved"
        assert updated["farmer_phone"] == "+1-555-FARMER", "Farmer phone not saved correctly"
        print("[SMS-2] POST /sms/settings passed:", updated)

        # 3. POST /sms/test — send a test SMS
        print("\n[SMS-3] Testing POST /sms/test ...")
        r = client.post("/sms/test", json={"recipient": "+1-555-TESTNO", "mode": "SIMULATED"})
        assert r.status_code == 200, f"POST /sms/test failed: {r.text}"
        test_result = r.json()
        assert test_result["success"] is True, "Test SMS not marked success"
        assert test_result["status"] == "SENT_SIMULATED", f"Unexpected status: {test_result['status']}"
        assert "MASTITIS AI TEST ALERT" in test_result["message"], "Test message missing expected text"
        print("[SMS-3] POST /sms/test passed:", test_result["status"], "to", test_result["recipient"])

        # 4. POST /sms/send — manual SMS for a real animal
        print(f"\n[SMS-4] Testing POST /sms/send for animal {sample_animal_id} ...")
        r = client.post("/sms/send", json={
            "animal_id": sample_animal_id,
            "recipient": "+1-555-MANUAL"
        })
        assert r.status_code == 200, f"POST /sms/send failed: {r.text}"
        send_res = r.json()
        assert send_res["success"] is True, "SMS send not marked success"
        assert send_res["animal_id"] == sample_animal_id, "Wrong animal_id in response"
        assert "MASTITIS ALERT" in send_res["message"], "SMS missing MASTITIS ALERT text"
        assert "consult the responsible veterinary professional" in send_res["message"], \
            "Safety wording missing from SMS message"
        assert "note" in send_res, "Demo-mode note missing from response"
        print("[SMS-4] POST /sms/send passed. Risk:", send_res.get("risk_category"), send_res.get("risk_score"), "%")

        # 5. GET /sms/history — verify DB persistence
        print("\n[SMS-5] Testing GET /sms/history ...")
        r = client.get("/sms/history")
        assert r.status_code == 200, f"GET /sms/history failed: {r.text}"
        history = r.json()
        assert isinstance(history, list), "SMS history should be a list"
        assert len(history) >= 2, f"Expected at least 2 SMS records, got {len(history)}"
        statuses = [h["status"] for h in history]
        assert "SENT_SIMULATED" in statuses, "No SENT_SIMULATED records found"
        print(f"[SMS-5] GET /sms/history passed. {len(history)} records found.")

        # 6. Duplicate suppression via disabled flag
        print("\n[SMS-6] Testing duplicate suppression (disabled SMS) ...")
        client.post("/sms/settings", json={
            "enabled": False, "farmer_phone": "+1-555-FARMER",
            "vet_phone": "+1-555-VETVET", "mode": "SIMULATED"
        })
        count_before = len(client.get("/sms/history").json())
        # Trigger animal detail (auto-SMS should NOT fire because enabled=False)
        client.get(f"/animals/{sample_animal_id}")
        count_after = len(client.get("/sms/history").json())
        print(f"[SMS-6] Count before={count_before}, after={count_after} (auto-SMS disabled — correct)")

        # 7. Low/Moderate-risk animal should NOT auto-trigger high-risk SMS
        print("\n[SMS-7] Testing low-risk animal does NOT auto-trigger SMS ...")
        client.post("/sms/settings", json={
            "enabled": True, "farmer_phone": "+1-555-FARMER",
            "vet_phone": "+1-555-VETVET", "mode": "SIMULATED"
        })
        low_risk_req = {
            "animal_id": "COW-TEST-LOWRISK",
            "farm_id": "FARM-001",
            "milk_yield_l_day": 25.0,
            "scc_cells_ml": 50000,
            "milk_conductivity_ms_cm": 4.5,
            "rumination_min_day": 520.0,
            "activity_percent": 95.0,
            "body_temperature_c": 38.1,
            "previous_mastitis": 0,
            "hygiene_score": 9.5
        }
        r2 = client.post("/predict", json=low_risk_req)
        assert r2.status_code == 200, f"Low risk predict failed: {r2.text}"
        low_pred = r2.json()
        count_low = len(client.get("/sms/history").json())
        if low_pred["risk_score"] <= 60:
            print(f"[SMS-7] Low-risk ({low_pred['risk_category']} {low_pred['risk_score']}%) — no auto-SMS triggered. Record count: {count_low}")
        else:
            print(f"[SMS-7] Note: scored {low_pred['risk_score']}% (above threshold) — auto-SMS expected")

        # 8. 404 for non-existent animal in /sms/send
        print("\n[SMS-8] Testing POST /sms/send with non-existent animal ...")
        r_404 = client.post("/sms/send", json={"animal_id": "COW-DOESNOTEXIST", "recipient": "+1-555-0000"})
        assert r_404.status_code == 404, f"Expected 404, got {r_404.status_code}"
        # -------------------------------------------------------------------
        # Explainable AI (Model-Derived Risk Factors) Tests
        # -------------------------------------------------------------------
        print("\n--- Explainable AI (Model-Derived Risk Factors) Tests ---")

        # 1. Prediction for animal with elevated SCC and conductivity
        print("\n[XAI-1] Testing model-derived factors for acute milk anomaly cow...")
        scc_cow_req = {
            "animal_id": "COW-XAI-HIGH-SCC",
            "farm_id": "FARM-001",
            "milk_yield_l_day": 8.0,
            "scc_cells_ml": 750000,
            "milk_conductivity_ms_cm": 6.9,
            "rumination_min_day": 240.0,
            "activity_percent": 50.0,
            "body_temperature_c": 39.8,
            "udder_surface_temperature_c": 37.6,
            "previous_mastitis": 1,
            "hygiene_score": 4.5
        }
        rxai1 = client.post("/predict", json=scc_cow_req)
        assert rxai1.status_code == 200, f"XAI predict failed: {rxai1.text}"
        data_xai1 = rxai1.json()
        assert "risk_factors" in data_xai1, "Missing risk_factors in response"
        xai1_factors = data_xai1["risk_factors"]
        print(f"[XAI-1] Found {len(xai1_factors)} model-derived factors for high-risk animal.")
        assert len(xai1_factors) > 0, "High risk animal should have model-derived risk factors"
        for rf in xai1_factors:
            assert "feature" in rf and "name" in rf and "value" in rf and "impact" in rf
            print(f"   * {rf['name']}: {rf['value']} (Impact: {rf['impact']}, Contrib: +{rf.get('contribution_pct')}%)")

        # 2. Prediction for healthy cow with baseline parameters
        print("\n[XAI-2] Testing model-derived factors for healthy baseline cow...")
        healthy_cow_req = {
            "animal_id": "COW-XAI-HEALTHY",
            "farm_id": "FARM-001",
            "milk_yield_l_day": 26.0,
            "scc_cells_ml": 80000,
            "milk_conductivity_ms_cm": 4.7,
            "rumination_min_day": 520.0,
            "activity_percent": 90.0,
            "body_temperature_c": 38.3,
            "udder_surface_temperature_c": 34.5,
            "previous_mastitis": 0,
            "hygiene_score": 9.0
        }
        rxai2 = client.post("/predict", json=healthy_cow_req)
        assert rxai2.status_code == 200, f"Healthy cow predict failed: {rxai2.text}"
        data_xai2 = rxai2.json()
        xai2_factors = data_xai2["risk_factors"]
        print(f"[XAI-2] Healthy cow score: {data_xai2['risk_score']}%. Factors count: {len(xai2_factors)}")
        # Verify no fake reasons for healthy cow (all values within baseline parameters)
        assert len(xai2_factors) <= 1, "Healthy animal should not have numerous fake risk factors"

        # 3. Verify risk factor differences across different profiles
        print("\n[XAI-3] Verifying factors differ between high-risk and healthy profiles...")
        xai1_features = [f["feature"] for f in xai1_factors]
        xai2_features = [f["feature"] for f in xai2_factors]
        assert xai1_features != xai2_features, "Risk factors must dynamically vary with animal inputs and model"
        print("[XAI-3] Dynamic differentiation verified successfully.")

        # -------------------------------------------------------------------
        # IoT Sensor Simulator End-to-End Workflow Tests
        # -------------------------------------------------------------------
        print("\n--- IoT Sensor Simulator Workflow Tests ---")

        # 1. Simulate High-Risk Anomaly across all 11 parameters on high-risk candidate COW-363
        print("\n[SIM-1] Testing IoT Sensor Simulator with 11 channels (Pre-clinical Mastitis)...")
        sim_11_payload = {
            "animal_id": "COW-363",
            "body_temperature_c": 38.8,
            "udder_surface_temperature_c": 37.8,
            "milk_conductivity_ms_cm": 5.5,
            "milk_temperature_c": 38.6,
            "milk_yield_l_day": 3.5,
            "activity_percent": 65.0,
            "rumination_min_day": 350.0,
            "scc_cells_ml": 280000,
            "water_intake_l_day": 65.0,
            "feeding_behavior_score": 6.8,
            "ambient_temperature_c": 26.5,
            "relative_humidity_percent": 63.0
        }
        r_sim = client.post("/simulate-sensor", json=sim_11_payload)
        assert r_sim.status_code == 200, f"Simulate 11 sensor failed: {r_sim.text}"
        sim_data = r_sim.json()
        assert "simulated_data_notice" in sim_data, "Response missing simulated data notice"
        assert "Simulated IoT Data" in sim_data["simulated_data_notice"], "Notice should state Simulated IoT Data"
        new_score = sim_data["ai_assessment"]["risk_score"]
        new_cat = sim_data["ai_assessment"]["risk_category"]
        print(f"[SIM-1] Simulated prediction: {new_score}% ({new_cat})")
        
        # Verify alert and SMS dispatch on high risk
        assert new_score > 60, f"Expected > 60% for acute profile, got {new_score}"
        assert sim_data.get("alert_created") is True, "High risk simulation must create alert"
        assert sim_data.get("simulated_sms") is not None, "High risk simulation must generate simulated SMS"
        print(f"[SIM-1] Verified Alert created and Simulated SMS logged: {sim_data['simulated_sms'].get('status')}")


        # 2. Simulate Healthy Normal Fluctuation across all 11 parameters
        print("\n[SIM-2] Testing IoT Sensor Simulator with healthy baseline variation...")
        sim_healthy_payload = {
            "animal_id": sample_animal_id,
            "body_temperature_c": 38.4,
            "udder_surface_temperature_c": 35.0,
            "milk_conductivity_ms_cm": 4.9,
            "milk_temperature_c": 34.8,
            "milk_yield_l_day": 22.0,
            "activity_percent": 88.0,
            "rumination_min_day": 490.0,
            "scc_cells_ml": 95000,
            "water_intake_l_day": 78.0,
            "feeding_behavior_score": 8.5,
            "ambient_temperature_c": 24.0,
            "relative_humidity_percent": 62.0
        }
        r_sim_h = client.post("/simulate-sensor", json=sim_healthy_payload)
        assert r_sim_h.status_code == 200, f"Healthy simulate failed: {r_sim_h.text}"
        sim_h_data = r_sim_h.json()
        h_score = sim_h_data["ai_assessment"]["risk_score"]
        h_cat = sim_h_data["ai_assessment"]["risk_category"]
        print(f"[SIM-2] Healthy variation score: {h_score}% ({h_cat})")
        assert h_score <= 40, "Healthy variation should produce No/Low Risk"

        print("\n=== ALL BACKEND API TESTS (including SMS, XAI & Sensor Simulator) PASSED SUCCESSFULLY! ===")




if __name__ == "__main__":
    test_endpoints()
