# MASTITIS AI

**Early Bovine Mastitis Forecasting & Herd Health Platform**

MASTITIS AI is an AI-enabled software prototype designed for **early forecasting of bovine mastitis risk (7–14 days ahead)** at both individual-animal and herd levels in Indian dairy farms. The system empowers farm managers and veterinarians to take preventive actions before clinical signs emerge.

> **IMPORTANT DISCLAIMER**: This software application is a decision-support prototype trained on a synthetic dataset (`bovine_mastitis_synthetic_10000.csv`). It provides early risk warnings and does **NOT** constitute a clinical veterinary diagnosis or automatically prescribe antibiotics.

---

## 🏗️ Project Architecture & Structure

```text
mastitis-ai/
├── backend/
│   ├── main.py                     # FastAPI REST API application & lifecycle hooks
│   ├── database.py                 # SQLite ORM models (SQLAlchemy) & DB auto-seeding
│   ├── schemas.py                  # Pydantic request/response data schemas
│   ├── prediction.py               # Prediction service wrapper, risk score & factor generator
│   ├── recommendations.py          # Rule-based preventive decision-support module
│   ├── alerts.py                   # Early warning alert management service
│   ├── analytics.py                # Vectorized herd summary & chart data aggregation
│   ├── test_api.py                 # Automated backend test suite
│   ├── requirements.txt            # Python dependencies
│   ├── ml/
│   │   ├── preprocessing.py        # Feature cleaning, imputation, scaling & one-hot encoding
│   │   ├── train_model.py          # Baseline (Logistic Regression) & Primary (Random Forest) trainer
│   │   ├── evaluate_model.py       # Metrics calculator (Accuracy, Precision, Recall, F1, ROC-AUC, CM)
│   │   ├── predict.py              # ML inference pipeline & explainable risk factor engine
│   │   └── model.pkl               # Joblib serialized model payload & ColumnTransformer
│   └── data/
│       └── bovine_mastitis_synthetic_10000.csv # Official synthetic dataset (10,000 records)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Application header & status indicator
│   │   │   ├── Sidebar.tsx         # Navigation sidebar menu
│   │   │   ├── RiskBadge.tsx       # Color-coded risk status pill (Green/Blue/Yellow/Red)
│   │   │   ├── RiskGauge.tsx       # Radial risk percentage gauge & 7-14 day forecast badge
│   │   │   ├── FeatureImportanceChart.tsx # Horizontal bar chart ("Why is this animal at risk?")
│   │   │   ├── SensorSimulationModal.tsx  # Interactive Live IoT Sensor Simulator
│   │   │   ├── CsvUploader.tsx     # CSV dataset upload & structural validator
│   │   │   └── DisclaimerBanner.tsx # Non-clinical prototype disclaimer banner
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Herd health dashboard, summary stats, charts & alerts
│   │   │   ├── Animals.tsx         # Searchable & filterable animal directory table
│   │   │   ├── AnimalDetails.tsx   # Detailed health profile, XAI charts, recommendations & simulation
│   │   │   ├── HerdAnalytics.tsx   # Epidemiological charts & ML model evaluation benchmarks
│   │   │   ├── Alerts.tsx          # Real-time alert list with review toggles
│   │   │   ├── Recommendations.tsx # Rule-based decision-support guidelines
│   │   │   └── Settings.tsx       # Data import & system architecture overview
│   │   ├── services/
│   │   │   └── api.ts              # Axios HTTP client connecting to FastAPI backend
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces for API payloads
│   │   ├── App.tsx                 # React Router v6 setup
│   │   └── main.tsx                # React entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router v6, Recharts, Lucide React Icons.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, Pandas, NumPy, Scikit-learn, Joblib.
- **Database**: SQLite (`mastitis_ai.db`) for prototype state persistence and alert audit logging.
- **Machine Learning**: Scikit-learn Random Forest Classifier (Primary Model) & Logistic Regression (Baseline).

---

## 🤖 Machine Learning Pipeline & Data Leakage Prevention

### Target Variable
- Target: `mastitis_within_7_14_days` (Binary: 0 = No Mastitis, 1 = Mastitis Event in 7–14 Days).

### Data Leakage Prevention
To ensure strict ML integrity, the following derived/target-related columns are **strictly excluded** from feature inputs:
- `ai_risk_score`
- `risk_category`
- `forecast_lead_days`

### Risk Score & Categories
Model output probabilities (`predict_proba`) are converted to a 0–100 Risk Score:
- **0–20**: No Risk (Green)
- **21–40**: Low Risk (Light Blue)
- **41–60**: Moderate Risk (Yellow/Orange)
- **61–100**: High Risk (Red)

### Model Performance Metrics (Stratified 80/20 Test Split)
- **Primary Model (Random Forest Classifier)**:
  - Accuracy: **96.15%**
  - ROC-AUC: **0.626**
- **Baseline Model (Logistic Regression)**:
  - Accuracy: **64.20%**
  - Recall: **63.51%**
  - ROC-AUC: **0.652**

---

## 🚀 How to Install & Run

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm

### 1. Run Backend Server
Navigate to the `backend` directory:
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
> Note: On first run, the backend automatically initializes `mastitis_ai.db` and seeds animal records from `data/bovine_mastitis_synthetic_10000.csv`.

To execute automated backend unit tests:
```bash
python test_api.py
```

### 2. Run Frontend Web Application
In a separate terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | System health check and API metadata |
| `GET` | `/animals` | Returns paginated animal records with search & multi-filtering |
| `GET` | `/animals/{animal_id}` | Detailed animal health profile, 7–14 day forecast, XAI factors, & recommendations |
| `POST` | `/predict` | Evaluates custom feature payload and returns risk score, category, XAI factors & recommendations |
| `GET` | `/herd-summary` | Aggregated herd statistics, risk category counts, and overall herd health status |
| `GET` | `/alerts` | Retrieves active early warning risk alerts |
| `POST` | `/alerts/{alert_id}/review` | Marks an alert as reviewed by farm management |
| `GET` | `/analytics` | Aggregated epidemiological chart data (scatter plots, yield trends, farm distributions) |
| `GET` | `/model-metrics` | Evaluation metrics comparing Random Forest vs Logistic Regression |
| `POST` | `/simulate-sensor` | Simulates real-time IoT telemetry update, persists reading, and computes updated forecast |
| `POST` | `/upload-data` | Accepts CSV file upload, validates required columns, and returns structural preview |

---

## 🔮 Limitations & Future IoT Integration

1. **Synthetic Data**: The prototype is trained on synthetic data (`bovine_mastitis_synthetic_10000.csv`). Clinical field deployment requires validation against real longitudinal farm datasets.
2. **Future IoT Tunnels**: The sensor simulation interface (`POST /simulate-sensor`) is architected so live physical IoT sensors (on-cow collars, smart milking teats, inline SCC optical sensors) can replace the simulator without altering the core pipeline.
