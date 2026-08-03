import firebase_admin
from firebase_admin import credentials, db, firestore
import joblib
import pandas as pd
import numpy as np
from datetime import datetime,timezone
import time
from datetime import timedelta
import os,json
DIRECTIVE_LIBRARY = {
    "Healthy": "Vitals are optimal. Continue regular care.",
    "Moderate": "Early stress detected. Monitor plant conditions.",
    "Critical": "Immediate attention required. Check soil and environment."
}

# =====================================================
# 1. CONFIGURATION & INITIALIZATION
# =====================================================
RTDB_URL = os.getenv("RTDB")
servicekey=os.getenv("FIREBASE_SERVICE_ACCOUNT")
service_key = json.loads(servicekey)
cred = credentials.Certificate(service_key)
firebase_admin.initialize_app(cred, {"databaseURL": RTDB_URL})
print("✅ Firebase Connection Established")

# Load trained model & label encoder
clf = joblib.load("agropulse_model_pipeline.joblib")
le = joblib.load("agropulse_label_encoder.joblib")

# Firestore client
fs = firestore.client()

# Cache for trend calculation
last_values = {}

# =====================================================
# 2. FEATURE ENGINEERING (MATCHES TRAINING)
# =====================================================
def get_ml_features(data, plant_id, plant_type):
    now = datetime.now()

    # Raw sensor values (same scale as training)
    moisture = float(data["moisture"])
    temperature = float(data["temperature"])
    humidity = float(data["humidity"])
    pressure = float(data["pressure"])

    # --- VPD calculation ---
    es = 0.6108 * np.exp((17.27 * temperature) / (temperature + 237.3))
    ea = es * (humidity / 100.0)
    vpd = float(np.clip(es - ea, 0.0, 3.0))

    # --- Trends ---
    prev = last_values.get(plant_id)

    if prev is None:
        m_trend = 0.0
        t_trend = 0.0
    else:
        m_trend = float(np.clip(moisture - prev["moisture"], -3.0, 3.0))
        t_trend = float(np.clip(temperature - prev["temperature"], -2.0, 2.0))

    last_values[plant_id] = {
        "moisture": moisture,
        "temperature": temperature
    }

    # Placeholder rolling avg (until real history is built)
    moisture_24h_avg = moisture
    moisture_trend = m_trend
    temp_trend = t_trend

    #24hr logic
    """
    cutoff_time = datetime.now() - timedelta(hours=24)

    history_docs = (
        fs.collection("All_Plants")
          .document(plant_id)
          .collection("sensorData")
          .where("timestamp", ">=", cutoff_time.isoformat())
          .stream()
    )

    moisture_vals = []
    temp_vals = []

    for doc in history_docs:
        d = doc.to_dict()
        sensor = d.get("sensor", {})
        moisture_vals.append(sensor.get("moisture"))
        temp_vals.append(sensor.get("temperature"))

    # Safety guard
    if len(moisture_vals) >= 3:
        moisture_24h_avg = float(np.mean(moisture_vals))
        moisture_trend = float(moisture_vals[-1] - moisture_vals[0])
        temp_trend = float(temp_vals[-1] - temp_vals[0])
    else:
        moisture_24h_avg = moisture
        moisture_trend = 0.0
        temp_trend = 0.0
    """
    return pd.DataFrame([{
        "Soil_Moisture": moisture,
        "Temperature": temperature,
        "Humidity": humidity,
        "Pressure": pressure,
        "Plant_Type": plant_type,
        "Hour_Sin": np.sin(2 * np.pi * now.hour / 24),
        "Hour_Cos": np.cos(2 * np.pi * now.hour / 24),
        "Moisture_Trend": moisture_trend,
        "Temp_Trend": temp_trend,
        "Moisture_24h_Avg": moisture_24h_avg,
        "VPD_Index": vpd
    }])

# =====================================================
# 3. CORE LISTENER CALLBACK (PURE ML)
# =====================================================
def sync_and_predict(event):
    if event.data is None:
        return

    path = event.path.strip("/")
    if not path:
        return

    plant_id = path.split("/")[0]
    raw = event.data

    if not isinstance(raw, dict):
        raw = db.reference(f"sensorData/{plant_id}").get()
        if not raw:
            return

    try:
        # Fetch plant metadata
        plant_doc = fs.collection("All_Plants").document(plant_id).get()
        plant_data = plant_doc.to_dict() if plant_doc.exists else {}
        plant_type = plant_data.get("plantType", "Urban_Garden_Plant")

        # Feature engineering
        features = get_ml_features(raw, plant_id, plant_type)

        # ML inference
        probs = clf.predict_proba(features)[0]

        # Map numeric classes → labels
        prob_map = {
            le.inverse_transform([cls])[0]: float(p)
            for cls, p in zip(clf.classes_, probs)
        }

        # PURE ML DECISION (ARGMAX)
        health = max(prob_map, key=prob_map.get)
        confidence = prob_map[health]
        directive =(
        "High stress risk detected. Conditions are unfavorable. "
        "Monitor closely and consider watering soon." if health=="Critical"and confidence<0.75
        else DIRECTIVE_LIBRARY.get(health, "Monitoring..."))

        # Debug log (keep temporarily if needed)
        # print(f"\n Plant: {plant_id}")
        # for k, v in prob_map.items():
        #     print(f"  {k:<9}: {v:.4f}")
        # print(f"➡️ Final ML decision: {health} ({confidence:.2%})")

        # Write to RTDB for dashboard
        db.reference(f"mlPredictions/{plant_id}").set({
            "health": health,
            "confidence": round(confidence, 3),
            "directive":directive,
            "timestamp": datetime.now().isoformat(timespec="seconds")
        })

        #firestore history
        now = datetime.now(timezone.utc)
        doc_id = now.strftime("%Y-%m-%d %H:%M:%S")

        fs.collection("All_Plants") \
        .document(plant_id) \
        .collection("sensorData") \
        .document(doc_id) \
        .set({
           "timestamp": now,
            "sensor": {
                "moisture": float(raw["moisture"]),
                "temperature": float(raw["temperature"]),
                "humidity": float(raw["humidity"]),
                "pressure": float(raw["pressure"]),
            },
            "ml": {
                "health": health,
                "confidence": round(float(confidence), 3)
            }
        })


    except Exception as e:
        print(f"❌ Prediction Error for {plant_id}: {e}")

# =====================================================
# 4. START LISTENER (SAFE SHUTDOWN)
# =====================================================
if __name__ == "__main__":
    print("🚀 AgroPulse Brain listening... (Ctrl+C to stop)")
    listener = None

    try:
        listener = db.reference("sensorData").listen(sync_and_predict)
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Stopping listener...")

    finally:
        if listener:
            listener.close()
            print("✅ Firebase listener closed")
