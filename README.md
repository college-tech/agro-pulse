# AgroPulse

**Name:** AgroPulse

**Overview:**
AgroPulse is a full-stack plant-monitoring application that collects sensor data from IoT devices, runs an on-premises Python ML listener to infer plant health, and provides a React-based dashboard (maps, QR tools, and user profiles) powered by Firebase services.

**Problem Statement:**
Small urban gardens and community plant projects lack an affordable, easy-to-use system to continuously monitor plant vitals and surface actionable alerts. AgroPulse aims to fill that gap with low-cost sensors, automated model-driven health scoring, and a simple dashboard for users and managers.

**Features:**
- **Real-time ingestion:** Sensor data is streamed to Firebase Realtime Database.
- **ML health prediction:** A Python listener runs a trained model pipeline and writes health predictions.
- **Historical storage:** Sensor records and ML results are archived in Firestore.
- **Map-based UI:** Plant locations are shown on interactive maps (Leaflet).
- **QR integration:** QR codes for plant identification and quick access to plant details.
- **User auth & profiles:** Firebase Auth and Firestore-backed user profiles and settings.

**Tech Stack:**
- **Frontend:** React, Vite, Tailwind CSS, React Router, Recharts.
- **Backend / ML:** Python, firebase-admin, joblib, pandas, numpy, scikit-learn.
- **Cloud / Realtime:** Firebase Realtime Database, Firestore, Cloud Functions, Firebase Auth.

**System Architecture (high level):**
1. IoT sensors -> Firebase Realtime Database (`sensorData/{plant_id}`)
2. Local or cloud Python listener (`backend/app.py`) subscribes to RTDB changes, computes features, runs the model, and writes predictions to RTDB (`mlPredictions/{plant_id}`) and Firestore (`All_Plants/{plant_id}/sensorData/{timestamp}`).
3. Frontend reads RTDB/Firestore and displays live dashboards, maps, and historical charts.
4. Cloud Functions (`functions/`) keep user records in Firestore synchronized and perform cleanup on account deletion.

**Project Folder Structure:**
- `src/` — React app (components, pages, contexts)
- `public/` — static assets and images
- `backend/` — Python listener, trained joblib files
- `package.json` — frontend scripts & deps

**Installation & Dependencies:**
- Frontend: run

```bash
npm install
npm run dev
```

- Backend (Python): create a venv and install requirements

```bash
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r backend/requirements.txt
python backend/app.py
```

- Firebase CLI for functions and hosting:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only functions
```

**Firebase Data Structure:**
- Realtime Database:
	- `sensorData/{plant_id}`: latest raw sensor readings pushed by devices
	- `mlPredictions/{plant_id}`: most recent ML health prediction (health, confidence, directive, timestamp)
- Firestore:
	- `All_Plants/{plant_id}`: plant metadata (e.g., `plantType`, owner, location)
		- `sensorData` (subcollection): historical documents keyed by timestamp containing:
			- `timestamp` (Firestore timestamp)
			- `sensor`: object with `moisture`, `temperature`, `humidity`, `pressure`
			- `ml`: object with `health`, `confidence`
	- `UsersDetail/{uid}`: user profile documents kept in sync by Cloud Functions

**Contributors:**
- Subhadip Mondal <rocker909090@gmail.com>

---

