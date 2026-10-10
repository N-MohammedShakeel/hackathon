# TalentGuard — Team Implementation Plan
### Maverick Mini Hackathon · 2-Person Team · MS + Praveen

---

## Team Assignments at a Glance

| Person | Role | Folder | Responsibilities |
|--------|------|--------|-----------------|
| **MS** | Full-Stack + AI Engineer | `talentguard/ms-workspace/` | Frontend (React), Backend (FastAPI), Agentic AI Layer |
| **Praveen** | ML / Data Science Engineer | `talentguard/praveen-workspace/` | EDA, ML Pipeline, Model Training, SHAP, MLflow, Top-50 Artifact |

```
talentguard/                          ← root repo (shared Git)
├── ms-workspace/                     ← MS works here
│   ├── frontend/                     (React + TailwindCSS)
│   ├── backend/                      (FastAPI)
│   └── README.md
├── praveen-workspace/                ← Praveen works here
│   ├── ml/                           (training + EDA + SHAP)
│   ├── artifacts/                    (exports: model.pkl, top50.csv, metrics.json)
│   └── README.md
├── shared/                           ← Integration contracts (both read)
│   ├── api_contract.md               (API spec MS builds, Praveen references)
│   ├── schema.py                     (Pydantic models, shared types)
│   └── employee_fields.json          (canonical field list for both sides)
└── README.md                         (submission README)
```

> [!IMPORTANT]
> **Integration rule**: Praveen exports artifacts to `praveen-workspace/artifacts/`. MS mounts those artifacts in `ms-workspace/backend/models/`. The `shared/api_contract.md` is the single source of truth for the prediction API shape — both must honor it.

---

## Module Breakdown

```
MODULE 1: Project Setup & Repo Init       → MS (15 min)
MODULE 2: EDA & Data Insights             → PRAVEEN (50 min)
MODULE 3: ML Training Pipeline            → PRAVEEN (50 min)
MODULE 4: SHAP + Top-50 Artifact          → PRAVEEN (30 min)
MODULE 5: FastAPI Backend                 → MS (60 min)
MODULE 6: React Frontend                  → MS (75 min)
MODULE 7: Agentic AI Layer                → MS (30 min)
──────────────────────────────────────────────────────
INTEGRATION + DEPLOY                      → Both (30 min)
```

---

## MODULE 1 — Project Setup & Repo Init
**Owner: MS** | ⏱ 15 min | Runs parallel with Praveen starting EDA

### Tasks

- [ ] Create root folder: `talentguard/`
- [ ] Initialize Git repo: `git init` + create `.gitignore`
- [ ] Create folder structure (both workspaces + shared)
- [ ] Copy dataset to `praveen-workspace/ml/data/WA_Fn-UseC_-HR-Employee-Attrition.csv`
- [ ] Copy reference ML codebase files to `praveen-workspace/ml/src/`
- [ ] Init Vite React app in `ms-workspace/frontend/`
- [ ] Init FastAPI project in `ms-workspace/backend/`
- [ ] Write `shared/employee_fields.json` (canonical 30-field list)
- [ ] Write `shared/api_contract.md` (API spec)
- [ ] Create GitHub repo + push + add Praveen as collaborator
- [ ] Share `shared/api_contract.md` with Praveen

### Done Criteria
✅ Both teammates can clone, see their folders, and the shared spec file

---

## MODULE 2 — EDA & Data Insights (T2: 20 pts)
**Owner: PRAVEEN** | ⏱ 50 min | Runs in `praveen-workspace/ml/`

### Folder
```
praveen-workspace/ml/
├── data/
│   └── WA_Fn-UseC_-HR-Employee-Attrition.csv
├── notebooks/
│   └── 01_EDA.ipynb                 ← main deliverable
├── src/
│   └── (reference files from employee-attrition-prediction-main)
└── artifacts/
    └── (populated in Module 3 & 4)
```

### Tasks

- [ ] Load dataset, inspect shape (1470 × 35), data types, nulls
- [ ] **Handle hidden traps** (judge T2 marks):
  - [ ] Identify & document `EmployeeNumber` as ID → drop
  - [ ] Identify & document `EmployeeCount=1`, `StandardHours=80`, `Over18=Y` as constants → drop
  - [ ] Document the accuracy trap: all-No baseline = 84% → never use accuracy
- [ ] EDA findings (minimum 3 evidence-backed with charts):
  - [ ] OverTime attrition rate: ~30% vs ~10% (plot bar chart)
  - [ ] Job Role attrition: Sales Rep ~40% highest (plot)
  - [ ] MonthlyIncome distribution by Attrition (box plot)
  - [ ] Satisfaction scores vs Attrition (heatmap)
  - [ ] Tenure/YearsAtCompany vs Attrition
  - [ ] Correlation heatmap of top features
- [ ] Export EDA summary as `artifacts/eda_summary.json`:
  ```json
  {
    "attrition_rate": 0.161,
    "total_employees": 1470,
    "key_findings": ["OverTime increases risk 3x", ...],
    "dropped_columns": ["EmployeeNumber", "EmployeeCount", "StandardHours", "Over18"]
  }
  ```

### Done Criteria
✅ `01_EDA.ipynb` fully run with 5+ charts + `artifacts/eda_summary.json` exported

---

## MODULE 3 — ML Training Pipeline (T3: 30 pts + +5 MLflow bonus)
**Owner: PRAVEEN** | ⏱ 50 min | Runs in `praveen-workspace/ml/`

### Folder additions
```
praveen-workspace/ml/
├── notebooks/
│   ├── 01_EDA.ipynb
│   └── 02_Training.ipynb             ← new
├── src/
│   ├── preprocessing.py              ← adapted from reference codebase
│   ├── train.py
│   ├── tune_models.py
│   ├── evaluate.py
│   └── feature_importance.py
└── artifacts/
    ├── best_model.pkl                ← output
    ├── scaler.pkl                    ← output
    ├── feature_columns.json          ← output (column order model was trained on)
    └── model_metrics.json            ← output
```

### Tasks

- [ ] **Preprocessing** (leakage-free):
  - [ ] Drop 4 columns identified in EDA (EmployeeNumber, EmployeeCount, StandardHours, Over18)
  - [ ] Encode Attrition: Yes→1, No→0
  - [ ] `pd.get_dummies(drop_first=True)` on categoricals
  - [ ] Stratified 80/20 split (`stratify=y`)
  - [ ] Fit `StandardScaler` on `X_train` ONLY, transform both
  - [ ] Save `feature_columns.json` — column order for inference
- [ ] **Baseline model** (logistic regression with `class_weight='balanced'`):
  - [ ] Train, get ROC-AUC (~0.80)
  - [ ] Document: "baseline to beat"
- [ ] **Best model** (Random Forest, RandomizedSearchCV, `scoring='f1'`, cv=5):
  - [ ] Tune: n_estimators, max_depth, min_samples_split, min_samples_leaf
  - [ ] Target ROC-AUC ~0.82 (honest — flag if > 0.95 as leakage)
  - [ ] Evaluate: Precision@50, Recall, F1, ROC-AUC (NOT accuracy as headline)
- [ ] **MLflow tracking** (+5 bonus):
  - [ ] `mlflow.start_run()` for each model
  - [ ] Log params, metrics (ROC-AUC, F1, Precision@50)
  - [ ] `mlflow ui` screenshot or export run comparison
- [ ] **Export artifacts**:
  - [ ] `joblib.dump(best_rf, 'artifacts/best_model.pkl')`
  - [ ] `joblib.dump(scaler, 'artifacts/scaler.pkl')`
  - [ ] `json.dump(feature_cols, open('artifacts/feature_columns.json', 'w'))`
  - [ ] Export `artifacts/model_metrics.json`:
    ```json
    {
      "model": "RandomForest",
      "roc_auc": 0.823,
      "f1": 0.58,
      "precision_at_50": 0.44,
      "recall": 0.61,
      "baseline_roc_auc": 0.802,
      "n_features": 46,
      "trained_at": "2026-10-10T..."
    }
    ```

### Done Criteria
✅ `artifacts/best_model.pkl`, `scaler.pkl`, `feature_columns.json`, `model_metrics.json` all present and loadable
✅ ROC-AUC between 0.78–0.90 (honest range; flag if higher)

---

## MODULE 4 — SHAP Explainability + Top-50 Artifact (T4: 20 pts)
**Owner: PRAVEEN** | ⏱ 30 min | Runs in `praveen-workspace/ml/`

### Folder additions
```
praveen-workspace/ml/
├── notebooks/
│   └── 03_SHAP_and_Artifact.ipynb    ← new
└── artifacts/
    ├── top50_watchlist.csv           ← THE required T4 output
    ├── top50_watchlist.json          ← JSON version for API
    └── feature_importance.json       ← global feature importance
```

### Tasks

- [ ] **SHAP setup**:
  - [ ] `shap.TreeExplainer(best_rf)` for efficiency
  - [ ] Run on full dataset (all 1470 employees)
  - [ ] Extract per-employee SHAP values for class=1 (Attrition=Yes)
- [ ] **Top-50 watch list generation**:
  - [ ] Sort all 1470 employees by `predict_proba[:, 1]` descending
  - [ ] Take top 50
  - [ ] For each employee, extract top-3 SHAP features (highest |impact|)
  - [ ] Map SHAP feature names to human-readable labels:
    - `OverTime_Yes` → "Works Overtime"
    - `MonthlyIncome` → "Low Monthly Income"
    - `YearsAtCompany` → "Short Company Tenure"
    - etc.
  - [ ] Export `top50_watchlist.csv` with columns:
    ```
    Rank | EmployeeID | AttritionProbability | RiskBand | 
    TopRisk1 | TopRisk2 | TopRisk3 | RetentionAction
    ```
- [ ] **Retention recommendations for top 10** (maps to bonus agent touch):
  - [ ] Apply rule-based mapping from `explain_prediction.py.generate_recommendations()`
  - [ ] Extend with specific actions for top-10:
    - OverTime → "Schedule 1:1 to review workload; offer flex hours this quarter"
    - MonthlyIncome → "Flag for next comp review cycle; benchmark against market"
    - YearsAtCompany < 2 → "Assign mentor; 30-60-90 day check-in cadence"
    - JobSatisfaction ≤ 2 → "Conduct anonymous pulse survey; offer role rotation"
    - BusinessTravel=Frequently → "Reduce travel quota; offer remote option"
- [ ] **Feature importance export**:
  - [ ] `model.feature_importances_` → top 15 features
  - [ ] Export `feature_importance.json`: `[{"feature": "OverTime_Yes", "importance": 0.18}, ...]`
- [ ] **SHAP per-employee JSON** (MS will call this from the API):
  - Export `top50_watchlist.json`:
    ```json
    [
      {
        "rank": 1,
        "employee_id": 123,
        "attrition_probability": 0.87,
        "risk_band": "High",
        "top_risk_factors": [
          {"feature": "Works Overtime", "direction": "Increase Risk", "impact": 0.22},
          {"feature": "Low Monthly Income", "direction": "Increase Risk", "impact": 0.18},
          {"feature": "Single Marital Status", "direction": "Increase Risk", "impact": 0.12}
        ],
        "retention_action": "Reduce overtime hours and review compensation package within 2 weeks"
      },
      ...
    ]
    ```

### Done Criteria
✅ `top50_watchlist.csv` + `top50_watchlist.json` present, 50 rows, top-3 risk reasons per employee
✅ Top-10 have concrete retention recommendations
✅ `feature_importance.json` present (15 entries)

---

## MODULE 5 — FastAPI Backend
**Owner: MS** | ⏱ 60 min | Runs in `ms-workspace/backend/`

### Folder structure
```
ms-workspace/backend/
├── main.py                    ← FastAPI app entry point
├── config.py                  ← env vars, settings
├── schemas.py                 ← Pydantic models
├── database.py                ← SQLAlchemy + Supabase (optional for hackathon)
├── models/                    ← ML artifacts mounted here (from Praveen)
│   ├── best_model.pkl         ← copy from praveen-workspace/artifacts/
│   ├── scaler.pkl
│   └── feature_columns.json
├── routers/
│   ├── predict.py             ← /api/v1/predict/*
│   ├── dashboard.py           ← /api/v1/dashboard/*
│   ├── model_info.py          ← /api/v1/model/*
│   └── agent.py               ← /api/v1/agent/* (retention coach)
├── ml/                        ← adapted from Praveen's src/
│   ├── predict.py             ← inference engine
│   ├── explain.py             ← SHAP wrapper
│   └── preprocessing.py       ← feature prep
├── services/
│   ├── prediction_service.py
│   ├── agent_service.py       ← Gemini/LLM integration
│   └── dashboard_service.py
├── requirements.txt
├── .env.example
└── Procfile                   ← for Render deploy
```

### Tasks

**Setup (5 min)**
- [ ] `pip install fastapi uvicorn scikit-learn joblib shap pandas numpy python-dotenv google-generativeai`
- [ ] Create `main.py` with CORS, router registration, startup model loading

**Schemas (10 min)**
- [ ] `EmployeeInput` Pydantic model (30 fields matching dataset columns)
- [ ] `PredictionResult` response model
- [ ] `WatchListItem` model (matches Praveen's JSON schema)

**ML Layer — `ml/predict.py` (10 min)**
- [ ] Port `load_artifacts()` from reference codebase
- [ ] Port `_prepare_features()` (one-hot encode + reindex to training columns)
- [ ] Port `predict(raw_record)` → `{prediction, attrition_probability, risk_band}`

**Prediction Router — `routers/predict.py` (15 min)**
- [ ] `POST /api/v1/predict/single` → single employee prediction + SHAP
- [ ] `POST /api/v1/predict/whatif` → override params + re-predict (no SHAP/LLM)
- [ ] `POST /api/v1/predict/batch` → CSV upload → batch results

**Dashboard Router — `routers/dashboard.py` (10 min)**
- [ ] `GET /api/v1/dashboard/overview` → load `top50_watchlist.json` + `model_metrics.json` → return aggregated stats:
  ```json
  {
    "total_employees": 1470,
    "high_risk_count": 87,
    "medium_risk_count": 234,
    "low_risk_count": 1149,
    "top_10_at_risk": [...],
    "dept_breakdown": {...}
  }
  ```
- [ ] `GET /api/v1/dashboard/watchlist` → return full top-50 list

**Model Info Router — `routers/model_info.py` (5 min)**
- [ ] `GET /api/v1/model/metrics` → serve `model_metrics.json`
- [ ] `GET /api/v1/model/feature-importance` → serve `feature_importance.json`

**Agent Router — `routers/agent.py` (5 min)**
- [ ] `POST /api/v1/agent/retention-plan` → takes employee risk data → calls agent service → returns plan

### Done Criteria
✅ All endpoints return correct JSON
✅ `POST /api/v1/predict/single` works with a sample employee JSON
✅ CORS configured for `http://localhost:5173` (Vite dev) + Vercel URL

---

## MODULE 6 — React Frontend
**Owner: MS** | ⏱ 75 min | Runs in `ms-workspace/frontend/`

### Folder structure
```
ms-workspace/frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx          ← overview KPIs + risk table
│   │   ├── Predictor.jsx          ← single employee form
│   │   ├── WatchList.jsx          ← top-50 list view
│   │   ├── WhatIf.jsx             ← interactive simulator
│   │   └── ModelPerformance.jsx   ← metrics + feature importance
│   ├── components/
│   │   ├── Layout.jsx             ← sidebar + header
│   │   ├── RiskBadge.jsx          ← High/Medium/Low colored badge
│   │   ├── KpiCard.jsx            ← metric tile
│   │   ├── ShapChart.jsx          ← horizontal bar chart for SHAP
│   │   ├── RiskTable.jsx          ← sortable employee table
│   │   ├── RetentionPlan.jsx      ← AI recommendations display
│   │   └── EmployeeForm.jsx       ← 30-field prediction form
│   ├── services/
│   │   └── api.js                 ← axios instance + all API calls
│   ├── hooks/
│   │   └── usePrediction.js       ← prediction state management
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                  ← global styles + TailwindCSS
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Tasks

**Setup (5 min)**
- [ ] `npm create vite@latest frontend -- --template react`
- [ ] `npm install axios recharts react-router-dom react-hook-form @headlessui/react`
- [ ] Configure TailwindCSS
- [ ] Set up `VITE_API_URL` env var

**Design System & Layout (10 min)**
- [ ] Dark theme: bg-gray-950 + accent indigo/violet gradient
- [ ] Typography: Inter font from Google Fonts
- [ ] Sidebar nav: Dashboard | Watch List | Predictor | What-If | Model Stats
- [ ] Header with TalentGuard logo/name + tagline

**Dashboard Page (15 min)**
- [ ] KPI tiles: Total Employees | High Risk | Medium Risk | Low Risk
- [ ] Risk distribution donut chart (Recharts PieChart)
- [ ] Top-10 at-risk employees table (with risk badges)
- [ ] Quick action button: "View Full Watch List"

**Watch List Page (10 min)**
- [ ] Full 50-employee ranked table
- [ ] Columns: Rank | Employee ID | Probability | Risk Band | Top Risk 1 | Top Risk 2 | Top Risk 3 | Action
- [ ] Color-coded rows by risk band
- [ ] Download CSV button

**Employee Predictor Page (15 min)**
- [ ] 30-field form split into 3 columns (Personal | Job | Satisfaction)
- [ ] Validate with react-hook-form
- [ ] Submit → show result card with:
  - Risk probability gauge (0–100%)
  - Risk band badge (High/Medium/Low)
  - SHAP bar chart (top-5 factors)
  - AI Retention Plan section

**What-If Simulator Page (10 min)**
- [ ] Dropdowns/sliders for key features: OverTime, MonthlyIncome, JobSatisfaction, WorkLifeBalance
- [ ] Live re-prediction on change (debounced 300ms)
- [ ] Show delta: "Risk changed from 72% → 51% (-21%)"

**Model Performance Page (10 min)**
- [ ] Metrics table: ROC-AUC | F1 | Precision@50 | Recall | Baseline ROC-AUC
- [ ] Feature importance horizontal bar chart (top 15)
- [ ] Model info: "Random Forest · 46 features · Trained on 1,176 employees"

### Done Criteria
✅ All 5 pages render with live data from backend
✅ Prediction form works end-to-end
✅ SHAP chart displays correctly
✅ Watch List shows 50 employees

---

## MODULE 7 — Agentic AI Layer (+5 bonus pts)
**Owner: MS** | ⏱ 30 min | Runs in `ms-workspace/backend/services/`

### What we build
The **Retention Coach Agent** — takes SHAP top-5 risk factors for an employee and generates:
1. A structured retention plan with prioritized actions
2. A **draft retention email** marked `PENDING_APPROVAL` (this is exactly what the bonus requires)

### Tasks

**Agent Service (`services/agent_service.py`) (20 min)**
- [ ] Configure Google Gemini (free tier: `gemini-1.5-flash`)
- [ ] Build `generate_retention_plan(employee_data, shap_factors)`:
  ```python
  prompt = f"""
  You are an HR retention specialist at TechNova Solutions.
  
  Employee Risk Profile:
  - Attrition Probability: {probability}%
  - Risk Band: {risk_band}
  - Top Risk Factors:
    1. {factor1}: {direction} (impact: {impact})
    2. {factor2}: ...
    3. {factor3}: ...
  
  Generate a structured retention plan with:
  1. 3 prioritized retention actions (action, timeline, owner)
  2. A draft retention email to the employee's manager
     marked clearly as [PENDING_APPROVAL - Review before sending]
  
  Format as JSON.
  """
  ```
- [ ] Fallback to rule-based recommendations if Gemini fails/rate-limited
- [ ] Build `generate_department_insight(dept_data)` for dashboard commentary
- [ ] Cap LLM calls to avoid rate limiting (cache results by employee feature hash)

**Retention Plan Display (in `components/RetentionPlan.jsx`) (10 min)**
- [ ] Expandable retention actions list
- [ ] Email draft panel with `[PENDING_APPROVAL]` banner (yellow/amber)
- [ ] Copy-to-clipboard button for email
- [ ] "Approve & Send" button (UI only — marks as approved in state)

### Done Criteria
✅ `POST /api/v1/agent/retention-plan` returns structured JSON with actions + email draft
✅ Email draft shows `PENDING_APPROVAL` label in UI
✅ Falls back gracefully if LLM is unavailable

---

## INTEGRATION — Both Team Members (30 min)

### Step 1: Praveen Hands Off Artifacts to MS (5 min)

Praveen copies these to `ms-workspace/backend/models/`:
```
praveen-workspace/artifacts/best_model.pkl      → ms-workspace/backend/models/
praveen-workspace/artifacts/scaler.pkl           → ms-workspace/backend/models/
praveen-workspace/artifacts/feature_columns.json → ms-workspace/backend/models/
praveen-workspace/artifacts/model_metrics.json   → ms-workspace/backend/models/
praveen-workspace/artifacts/top50_watchlist.json → ms-workspace/backend/models/
praveen-workspace/artifacts/feature_importance.json → ms-workspace/backend/models/
```

Or via Git: Praveen pushes → MS pulls.

### Step 2: End-to-End Smoke Test (10 min)

MS runs:
```bash
# Start backend
cd ms-workspace/backend
uvicorn main:app --reload

# Start frontend
cd ms-workspace/frontend
npm run dev
```

Checklist:
- [ ] `GET /api/v1/dashboard/overview` → returns real counts
- [ ] `GET /api/v1/dashboard/watchlist` → returns 50 employees
- [ ] `POST /api/v1/predict/single` → returns prediction + SHAP
- [ ] `POST /api/v1/agent/retention-plan` → returns AI plan + email draft
- [ ] `GET /api/v1/model/metrics` → returns Praveen's metrics
- [ ] Dashboard page loads with live data
- [ ] Watch List shows all 50 employees

### Step 3: Deploy (15 min)

**MS deploys**:
1. Push to GitHub
2. Connect `ms-workspace/backend/` to Render → set env vars → deploy
3. Connect `ms-workspace/frontend/` to Vercel → set `VITE_API_URL` → deploy
4. Test live URLs

---

## API Contract (Shared Reference)

> File: `shared/api_contract.md` — **Praveen reads this to know what MS will consume from his artifacts.**

### What MS's backend exposes (routes):

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| `GET` | `/api/v1/health` | — | `{status: "ok"}` |
| `POST` | `/api/v1/predict/single` | `EmployeeInput JSON` | `PredictionResult` |
| `POST` | `/api/v1/predict/whatif` | `{base: EmployeeInput, overrides: {...}}` | `{probability, risk_band, delta}` |
| `POST` | `/api/v1/predict/batch` | CSV file | `{results[], summary}` |
| `GET` | `/api/v1/dashboard/overview` | — | `DashboardOverview` |
| `GET` | `/api/v1/dashboard/watchlist` | — | `WatchListItem[]` |
| `GET` | `/api/v1/model/metrics` | — | `ModelMetrics` |
| `GET` | `/api/v1/model/feature-importance` | — | `FeatureImportance[]` |
| `POST` | `/api/v1/agent/retention-plan` | `{employee_id, probability, shap_factors[]}` | `RetentionPlan` |

### Artifact schemas Praveen must produce:

**`feature_columns.json`** — exact list of column names in training order:
```json
["Age", "DailyRate", "DistanceFromHome", ..., "OverTime_Yes", "Department_Sales", ...]
```

**`model_metrics.json`**:
```json
{
  "model": "RandomForest",
  "roc_auc": 0.823,
  "f1": 0.581,
  "precision_at_50": 0.44,
  "recall": 0.612,
  "baseline_model": "LogisticRegression",
  "baseline_roc_auc": 0.802,
  "n_features": 46,
  "n_train_samples": 1176,
  "n_test_samples": 294,
  "trained_at": "2026-10-10T07:00:00"
}
```

**`feature_importance.json`**:
```json
[
  {"feature": "OverTime_Yes", "importance": 0.182, "label": "Works Overtime"},
  {"feature": "MonthlyIncome", "importance": 0.141, "label": "Monthly Income"},
  ...
]
```

**`top50_watchlist.json`**:
```json
[
  {
    "rank": 1,
    "employee_id": 859,
    "attrition_probability": 0.874,
    "risk_band": "High",
    "department": "Sales",
    "job_role": "Sales Representative",
    "monthly_income": 2089,
    "overtime": "Yes",
    "years_at_company": 1,
    "top_risk_factors": [
      {"feature": "OverTime_Yes", "label": "Works Overtime", "direction": "Increase Risk", "impact": 0.22},
      {"feature": "MonthlyIncome", "label": "Low Monthly Income", "direction": "Increase Risk", "impact": 0.18},
      {"feature": "YearsAtCompany", "label": "Short Company Tenure", "direction": "Increase Risk", "impact": 0.11}
    ],
    "retention_action": "Reduce overtime + schedule compensation review this quarter"
  }
]
```

---

## Parallel Timeline (4 Hours)

```
TIME    MS                                    PRAVEEN
──────────────────────────────────────────────────────────────────────
0:00    Module 1: Setup repo, folders,        Module 2: EDA sprint starts
        shared API contract (15 min)          in 01_EDA.ipynb (50 min)

0:15    Module 5: FastAPI backend starts      (EDA continues...)
        - schemas, ML layer, predict route    

0:50    Module 5 continues...                Module 2 DONE ✅
                                              Module 3: ML Training starts
                                              (50 min)

1:15    Module 5 DONE ✅                     (Training continues...)
        Module 6: React frontend starts
        - Layout, Dashboard (25 min)

1:40    Module 6 continues...               Module 3 DONE ✅
        - Predictor, Watch List pages         Module 4: SHAP + Top-50
                                              artifact (30 min)

2:10    Module 6 continues...               Module 4 DONE ✅
        - What-If, Model Performance          → Push artifacts to Git

2:30    Module 7: Agentic AI layer          INTEGRATION: Copy artifacts
        (30 min)                              to ms-workspace, smoke test

2:50    Module 7 DONE ✅                    Both: Integration testing
        Frontend polish                       (15 min)

3:10    DEPLOYMENT (15 min)                 Help with testing + pitch prep
        - Vercel + Render

3:25    Both: Pitch prep                    Both: 3-slide deck + rehearse
        Live demo walkthrough

3:40    PITCH 🎤
```

---

## Per-Person Task Checklist Summary

### PRAVEEN's Checklist
```
MODULE 2 — EDA (50 min)
  [ ] Load & inspect dataset
  [ ] Find & document 4 hidden traps
  [ ] 5+ EDA charts with findings
  [ ] Export eda_summary.json

MODULE 3 — ML Training (50 min)
  [ ] Leakage-free preprocessing pipeline
  [ ] Baseline: Logistic Regression (class_weight='balanced')
  [ ] Best model: Random Forest with RandomizedSearchCV
  [ ] ROC-AUC target: ~0.82 (NOT > 0.95)
  [ ] MLflow tracking for both models (+5 bonus)
  [ ] Export: best_model.pkl, scaler.pkl, feature_columns.json, model_metrics.json

MODULE 4 — SHAP + Artifact (30 min)
  [ ] SHAP TreeExplainer on full dataset
  [ ] Top-50 ranked by probability
  [ ] Top-3 risk reasons per employee (human-readable)
  [ ] Retention recommendations for top-10
  [ ] Export: top50_watchlist.csv, top50_watchlist.json, feature_importance.json

INTEGRATION (10 min)
  [ ] Push artifacts to Git / copy to ms-workspace/backend/models/
  [ ] Verify JSON schemas match api_contract.md
```

### MS's Checklist
```
MODULE 1 — Setup (15 min)
  [ ] Repo + folder structure
  [ ] Shared API contract
  [ ] Both workspaces initialized

MODULE 5 — Backend (60 min)
  [ ] FastAPI with all 9 endpoints
  [ ] ML inference layer (from Praveen's artifacts)
  [ ] CORS + health check
  [ ] Agent service (Gemini integration)

MODULE 6 — Frontend (75 min)
  [ ] 5 pages: Dashboard, Predictor, WatchList, WhatIf, ModelPerformance
  [ ] SHAP chart component
  [ ] Risk badge component
  [ ] All API calls wired up

MODULE 7 — Agentic AI (30 min)
  [ ] Gemini retention plan generator
  [ ] Email draft with PENDING_APPROVAL label
  [ ] Rule-based fallback

DEPLOY (15 min)
  [ ] Backend → Render
  [ ] Frontend → Vercel
  [ ] Smoke test live URLs
```

---

## Deliverables Checklist (Submission)

| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| 1 | GitHub repo with both workspaces | MS | [ ] |
| 2 | Grant access to `2000127800@hexaware.com` | MS | [ ] |
| 3 | `top50_watchlist.csv` (T4 required artifact) | Praveen | [ ] |
| 4 | `top50_watchlist.json` (served via API) | Praveen | [ ] |
| 5 | Live frontend URL (Vercel) | MS | [ ] |
| 6 | Live backend URL (Render) | MS | [ ] |
| 7 | README.md with all sections | Both | [ ] |
| 8 | PPT/DOCX solution document | Both | [ ] |
| 9 | `01_EDA.ipynb` (T2 evidence) | Praveen | [ ] |
| 10 | `02_Training.ipynb` (T3 evidence) | Praveen | [ ] |
| 11 | MLflow run comparison screenshot (+5 bonus) | Praveen | [ ] |
| 12 | Retention email draft `[PENDING_APPROVAL]` (+5 bonus) | MS | [ ] |

---

> [!TIP]
> **If time runs short, prioritize in this order:**
> 1. `top50_watchlist.csv` — judges MUST see this (T4 = 20 pts)
> 2. Live deployment URL — (+5 bonus, shows it works)
> 3. MLflow screenshot — (+5 bonus, quick win for Praveen)
> 4. Retention email draft — (+5 bonus, our agentic differentiator)
> 5. All 5 frontend pages — nice to have but T4 is the core
