# TalentGuard — Complete Project Document
### Maverick Mini Hackathon · P1 TalentGuard · 4-Hour Build

---

## Table of Contents

0. [Official Challenge Context & Scoring](#0-official-challenge-context--scoring)
1. [Reference Codebases — What They Are & What We Reuse](#1-reference-codebases)
2. [Dataset & ML Codebase Analysis](#2-dataset--ml-codebase-analysis)
3. [TalentGuard Application Features](#3-talentguard-application-features)
4. [Training Workflow](#4-training-workflow)
5. [Prediction Workflow](#5-prediction-workflow)
6. [End-to-End System Workflow](#6-end-to-end-system-workflow)
7. [Deployment Strategy](#7-deployment-strategy)
8. [Development Phases](#8-development-phases)
9. [Architecture Diagram](#9-architecture-diagram)

---

## 0. Official Challenge Context & Scoring

> Source: `Hackathon_5_Projects_Pack.pdf` (Mavericks Mini Hackathon) + `Challenge Instructions.docx`

### 0.1 The Official TalentGuard P1 Brief

| Field | Detail |
|-------|--------|
| **Client** | TechNova Solutions — 12,000-person IT services firm losing 16% of staff per year; every exit costs 6–9 months of salary |
| **The Ask** | "Tell me who is likely to resign next cycle, why, and what to do — while there's time to act." |
| **HR Capacity** | HR can run retention talks with **50 employees per cycle** |
| **Dataset** | IBM HR Analytics Employee Attrition (1,470 employees, 35 columns, target: Attrition Yes/No) |
| **Required Output (T4)** | **Ranked TOP-50 watch list** with each employee's **top-3 risk reasons** + a **concrete retention recommendation for the top 10** |

> [!IMPORTANT]
> **Watch out (judge traps):** Dataset contains an ID column and several useless constant columns that **hurt the model** — finding and handling them is part of the score. Also think hard about which metric matters when only ~1 in 6 employees actually leaves (not accuracy!).

### 0.2 Official Scoring Rubric (100 pts + 15 bonus)

| Task | Points | What Judges Look For |
|------|--------|---------------------|
| **T1 — Business Framing** | 10 | The decision being improved + a **business success metric** (money/capacity), NOT a model metric |
| **T2 — EDA & Insights** | 20 | 3+ evidence-backed findings; the project's **hidden data traps found and handled** |
| **T3 — The Model** | 30 | A baseline + stronger model; the **RIGHT metric** (ROC-AUC / Recall / F1 — NOT accuracy); threshold tied to stated capacity (top-50); no leakage |
| **T4 — Actionable Output** | 20 | Ranked top-50 watch list WITH risk reasons + concrete retention recommendation for top-10 |
| **T5 — The Pitch** | 20 | 3-minute story ending in business value; **one live scoring/prediction on stage** |

### 0.3 Bonus Points (+15 available)

| Bonus | Points | How We Achieve It |
|-------|--------|-----------------|
| MLflow experiment tracking with run comparison | +5 | Add MLflow tracking to training pipeline |
| **Free public deployment** (Streamlit/Vercel) | **+5** | Deploy to Vercel + Render (**we're doing this**) |
| **Agent touch**: auto-draft the action (retention email / follow-up letter) marked `PENDING_APPROVAL` — rule-based is fine | **+5** | **AI Retention Coach** generating retention email drafts — this is our agentic differentiator |

> [!NOTE]
> **All 15 bonus points are within reach.** The agent bonus explicitly says "rule-based is fine" — our SHAP-to-recommendations engine qualifies, enhanced with LLM-drafted retention emails.

### 0.4 Judge Answer Key for P1 (What Judges Know)

> This is from the confidential judges' section — use this to **pre-empt every judge question**:

| Judge Question | Our Answer |
|---------------|------------|
| "Why not accuracy?" | Accuracy on 84% baseline (all-No) is useless. We use ROC-AUC (~0.82) + Precision@50 well above 16% base rate |
| "What did you fit on train only?" | StandardScaler fitted on X_train only, transformed X_test; dummy encoding from training columns only |
| "Is OverTime causal?" | Predictive, not proven causal. We recommend reducing overtime and measuring retention delta — an intervention + measurement approach |
| "AUC > 0.95?" | That's a leakage red flag. Our RF scores ~0.82 AUC, which is honest and expected |

**Expected EDA findings we must show:**
- OverTime → 30% attrition vs ~10% (3× risk multiplier)
- Sales Representative → 40% attrition (highest-risk job role)
- Low income + low tenure + low satisfaction + frequent travel all elevate risk

**Hidden traps we MUST handle (T2 marks):**
- `EmployeeNumber` → ID column, drop it
- `EmployeeCount = 1` → constant, drop it
- `StandardHours = 80` → constant, drop it
- `Over18 = Y` → constant, drop it
- Accuracy trap: all-No baseline = 84% → never report accuracy as primary metric

### 0.5 Scoring Bands & Red Flags

| Band | Score | Requirements |
|------|-------|--------------|
| **Winning** | 85+ | Traps found, leakage-free pipeline, right metric with capacity-tied operating point, artifact client could use tomorrow, business-first pitch |
| Solid | 65–84 | Working model + right metric, weaker artifact or metric-led pitch |
| Needs Work | <65 | Accuracy-led, leakage, or output client can't act on |

**Universal red flags (avoid at all costs):**
- P1 ROC-AUC > 0.95 → leakage suspected
- ID columns as features
- No split-before-fit
- Code the team can't explain

### 0.6 Challenge Instructions Deliverables

From `Challenge Instructions.docx` — required submissions:

| Deliverable | Details |
|------------|--------|
| **GitHub Repository** | Source code, architecture diagrams, supporting artifacts; access to `2000127800@hexaware.com` |
| **PPT or DOCX** | Solution document for both chosen use cases |
| **README** | Problem Statement, Solution Overview, Architecture Diagram, Tech Stack, Setup Instructions, Business Benefits, Future Enhancements |
| **Evaluation Criteria** | Innovation, business value, technical feasibility, code quality, documentation, architecture, AI tool usage, presentation quality |

---

## 1. Reference Codebases

### 1.1 Cognigen (`/Cognigen`)

| Attribute | Detail |
|-----------|--------|
| **Type** | AI-powered cognitive/productivity platform |
| **Structure** | `cognigen-frontend/` · `cognigen-backend/` · `cognigen-ai/` |
| **Stack** | React frontend · Python FastAPI backend · AI service layer |
| **What we reuse** | Full-stack separation pattern (frontend / backend / AI service as distinct layers), component styling patterns, dashboard card layouts, sidebar navigation structure |

### 1.2 FastX (`/FastX`)

| Attribute | Detail |
|-----------|--------|
| **Type** | Fast data processing / analytics platform |
| **Structure** | `FastX-Frontend/` · `FastX-Backend/` |
| **Stack** | React frontend · Python backend |
| **What we reuse** | Data table components, analytics charts layout, filtering/search UI patterns, API integration patterns between React and Python |

### 1.3 Flowforge (`/Flowforge`)

| Attribute | Detail |
|-----------|--------|
| **Type** | Workflow automation and pipeline management tool |
| **Structure** | `flowforge-ui/` · `flowforge-backend/` · `flowforge-ai/` |
| **Stack** | React UI · FastAPI backend · AI orchestration service |
| **What we reuse** | Workflow visualization patterns, pipeline status display components, agentic pipeline status tracking UI, step-by-step flow indicator components |

### 1.4 Hexa-MedPlus (`/Hexa-MedPlus-main`)

| Attribute | Detail |
|-----------|--------|
| **Type** | Enterprise-grade AI-powered clinical workflow platform |
| **Structure** | Microservices: `frontend/` · `api-gateway/` · `clinical-service/` · `document-service/` · `ai-service/` |
| **Stack** | React/Vite + TailwindCSS · Spring Boot Gateway · FastAPI AI Engine · Kafka · PostgreSQL + pgvector · Redis |
| **What we reuse** | **Most heavily referenced**: role-based UI patterns, dashboard KPI tiles design, split-screen workspace layout, SHAP/explainability panel UI design, agentic AI pipeline integration patterns, LangGraph orchestration concept for chained AI steps, risk assessment UI display patterns (High/Medium/Low risk bands), audit trail component patterns |

> **Why Hexa-MedPlus is most relevant**: Like TalentGuard, it processes individual records through an AI pipeline, displays risk levels, provides human-in-the-loop oversight, and generates plain-language AI recommendations — directly analogous to our attrition risk + retention recommendation flow.

---

## 2. Dataset & ML Codebase Analysis

### 2.1 Dataset — IBM HR Analytics Employee Attrition

**File**: `dataset/WA_Fn-UseC_-HR-Employee-Attrition.csv`

| Property | Value |
|----------|-------|
| **Source** | IBM HR Analytics (publicly available) |
| **Size** | 1,470 employee records |
| **Features** | 35 columns (demographics, compensation, job role, satisfaction scores, tenure) |
| **Target** | `Attrition` — binary: Yes / No |
| **Class imbalance** | ~16% attrition rate (imbalanced — requires stratified splits) |

**Key feature categories**:

| Category | Features |
|----------|----------|
| **Demographics** | Age, Gender, MaritalStatus, DistanceFromHome |
| **Compensation** | MonthlyIncome, DailyRate, HourlyRate, MonthlyRate, PercentSalaryHike, StockOptionLevel |
| **Job Info** | Department, JobRole, JobLevel, BusinessTravel, OverTime |
| **Satisfaction Scores** | JobSatisfaction (1–4), EnvironmentSatisfaction (1–4), WorkLifeBalance (1–4), RelationshipSatisfaction (1–4), JobInvolvement (1–4) |
| **Tenure** | YearsAtCompany, YearsInCurrentRole, YearsSinceLastPromotion, YearsWithCurrManager, TotalWorkingYears, NumCompaniesWorked |
| **Education** | Education, EducationField |
| **Dropped (constants)** | EmployeeCount, Over18, StandardHours, EmployeeNumber |

### 2.2 Employee Attrition Prediction Codebase

**Root**: `employee-attrition-prediction-main/`

| File / Module | Purpose | What We Inherit |
|---------------|---------|-----------------|
| `main.py` | End-to-end training entry point: preprocess → tune 5 models → evaluate → compare → save best | Training pipeline orchestration logic |
| `src/preprocessing.py` | Drop constants, encode target, one-hot encode categoricals, stratified 80/20 split, StandardScaler | **Directly reuse** — exact same preprocessing logic in our FastAPI training endpoint |
| `src/train.py` | Trains 5 baseline models: Logistic Regression, Decision Tree, Random Forest, KNN, SVM | Reuse model definitions and training patterns |
| `src/tune_models.py` | GridSearchCV / RandomizedSearchCV for all 5 models optimized on F1 score | **Reuse RF tuning** with RandomizedSearchCV as our primary model |
| `src/evaluate.py` | Computes Accuracy, Precision, Recall, F1, ROC-AUC per model | **Directly reuse** — expose these metrics via API |
| `src/feature_importance.py` | Plots top-15 feature importances from Random Forest | **Adapt** — return importance data as JSON for frontend charts |
| `src/explain_prediction.py` | SHAP-based per-employee explanation with direction (Increase/Decrease risk) + rule-based recommendations | **Heavily reuse** — this becomes our agentic AI explanation engine |
| `src/predict.py` | Single-record and batch prediction with risk banding (High/Medium/Low) | **Directly reuse** — wrap in FastAPI endpoints |
| `src/save_model.py` | Persists model + scaler as `.pkl` via joblib | **Directly reuse** |
| `app/app.py` | Streamlit interactive predictor (reference UI only) | **Replaced** by our React frontend — reference for field names and form structure |
| `notebooks/EDA.ipynb` | Full exploratory data analysis | Reference for understanding data distributions and patterns for our dashboard |
| `models/best_model.pkl` | Trained Random Forest model artifact | **Pre-trained model** — deploy directly, skip retraining in production |
| `models/scaler.pkl` | Fitted StandardScaler artifact | Deploy alongside model |

**Key technical decisions inherited**:
- Random Forest is the best-performing model → our primary production model
- SHAP values for explainability → our "AI Explanation" panel
- Risk bands: High (≥70%), Medium (40–70%), Low (<40%) → our UI risk indicators
- Drop columns: `EmployeeCount`, `Over18`, `StandardHours`, `EmployeeNumber`
- Encoding: `pd.get_dummies` with `drop_first=True`
- Scale: `StandardScaler` (not needed for RF, kept for model parity)

---

## 3. TalentGuard Application Features

> Beyond the basic challenge requirement, we add **production-grade agentic AI capabilities** to differentiate and maximize hackathon score.

### 3.1 Core Challenge Requirements (Must Have)

| Feature | Description |
|---------|-------------|
| **Attrition Prediction** | Input employee profile → get Yes/No prediction + probability score + risk band |
| **Risk Dashboard** | Organization-wide view of employees by risk level |
| **Model Metrics** | Display Accuracy, Precision, Recall, F1, ROC-AUC |
| **Feature Importance** | Visual chart of top predictive features |

### 3.2 Production Agentic AI Capabilities (Score Differentiators)

| Feature | Description | Agentic Layer |
|---------|-------------|---------------|
| **AI Retention Coach** | Per-employee AI-generated retention strategy based on SHAP top-5 risk factors | LLM chain: SHAP analysis → structured recommendations → actionable HR playbook |
| **Batch Risk Assessment** | Upload CSV → AI processes all employees → returns ranked risk report | Batch prediction pipeline with async processing |
| **AI Risk Explainer** | For each prediction, show SHAP waterfall chart + plain-English "Why this employee is at risk" narrative | SHAP → LLM narrative generation |
| **Department Intelligence** | Department-level attrition analysis with AI trend commentary | Aggregation + LLM commentary agent |
| **Predictive Alerts** | Configurable threshold alerts: "12 employees entered High Risk this week" | Rule engine + notification layer |
| **HR Recommendation Engine** | Rule-based + LLM hybrid that maps risk factors to specific HR interventions (salary review, role change, flex work, training) | `explain_prediction.py` extended with LLM enrichment |
| **What-If Simulator** | Adjust employee parameters (e.g., give raise, reduce overtime) → see real-time prediction change | Live prediction API calls from interactive sliders |
| **Trend Analytics** | Attrition risk trends over time per department/job role | Time-series aggregation on stored predictions |
| **Model Retraining Trigger** | HR admin can upload new data → trigger background retraining → see new metrics | FastAPI background task + Celery/asyncio |

### 3.3 UI Pages

| Page | Role | Purpose |
|------|------|---------|
| **Dashboard** | All | KPI tiles (total employees, high-risk count, dept breakdown), risk distribution chart, top risk employees table |
| **Employee Predictor** | HR / Manager | Single employee prediction form with full 30-field input → instant result + SHAP explanation |
| **Batch Upload** | HR Admin | Upload CSV → see results table → download risk report |
| **What-If Simulator** | HR / Manager | Select employee → adjust parameters → see live prediction change |
| **Department Analytics** | HR Director | Dept-level risk heatmap + AI trend commentary |
| **AI Retention Coach** | HR / Manager | Select high-risk employee → get AI-generated retention plan |
| **Model Performance** | Admin | Metrics dashboard, feature importance chart, ROC curve |
| **Settings / Config** | Admin | Risk threshold configuration, alert settings, model retraining trigger |

---

## 4. Training Workflow

> Run once (or on-demand by admin). Produces `best_model.pkl` + `scaler.pkl` artifacts deployed with the backend.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TALENTGUARD TRAINING WORKFLOW                    │
└─────────────────────────────────────────────────────────────────────┘

Step 1: DATA INGESTION
  Input: WA_Fn-UseC_-HR-Employee-Attrition.csv (1,470 rows × 35 cols)
  → Load via pandas read_csv()
  → Validate: check for nulls, unexpected values

Step 2: PREPROCESSING  [src/preprocessing.py]
  → Drop constants: EmployeeCount, Over18, StandardHours, EmployeeNumber
  → Encode target: Attrition {"No": 0, "Yes": 1}
  → One-hot encode categoricals: pd.get_dummies(drop_first=True)
     Categoricals: BusinessTravel, Department, EducationField, Gender,
                   JobRole, MaritalStatus, OverTime
  → Train/Test split: 80/20, stratified on Attrition (preserve 16% ratio)
  → Fit StandardScaler on X_train → transform X_train & X_test

Step 3: MODEL TRAINING  [src/train.py + src/tune_models.py]
  Models trained with hyperparameter tuning (GridSearchCV / RandomizedSearchCV, CV=5, scoring='f1'):
  ┌──────────────────────┬──────────────────────────────────────────┐
  │ Model                │ Tuning Strategy                          │
  ├──────────────────────┼──────────────────────────────────────────┤
  │ Logistic Regression  │ GridSearch: C=[0.01,0.1,1,10,100],       │
  │                      │ solver=[liblinear, lbfgs]                │
  │ Decision Tree        │ GridSearch: max_depth, min_samples_split, │
  │                      │ criterion=[gini, entropy]                │
  │ Random Forest ★      │ RandomizedSearch: n_estimators, max_depth,│
  │                      │ min_samples_split, min_samples_leaf       │
  │ KNN                  │ GridSearch: n_neighbors, weights, metric  │
  │ SVM                  │ GridSearch: C, kernel=[linear, rbf]       │
  └──────────────────────┴──────────────────────────────────────────┘
  ★ Primary production model

Step 4: EVALUATION  [src/evaluate.py]
  Per model:
  → Accuracy, Precision, Recall, F1, ROC-AUC
  → Classification report
  → Sort models by ROC-AUC → select best (Random Forest)

Step 5: FEATURE IMPORTANCE  [src/feature_importance.py]
  → Extract model.feature_importances_ from Random Forest
  → Rank top-15 features
  → Store as JSON for dashboard API

Step 6: MODEL PERSISTENCE  [src/save_model.py]
  → joblib.dump(best_rf, "models/best_model.pkl")
  → joblib.dump(scaler,  "models/scaler.pkl")
  → Store feature column order in model.feature_names_in_

Step 7: POST-TRAINING VALIDATION
  → Smoke test: load artifacts → run one prediction → verify output shape
  → Log metrics to DB (model_id, accuracy, f1, roc_auc, trained_at)

Output Artifacts:
  ├── models/best_model.pkl    (Random Forest, ~5-15 MB)
  ├── models/scaler.pkl        (StandardScaler, <1 KB)
  └── DB record: model_metrics table (metrics snapshot)
```

**FastAPI Training Endpoint** (admin-triggered):
```
POST /api/v1/model/train
  → Runs training as background task
  → Returns job_id
GET  /api/v1/model/train/status/{job_id}
  → Returns {status, progress, metrics}
GET  /api/v1/model/metrics
  → Returns latest model evaluation metrics
GET  /api/v1/model/feature-importance
  → Returns [{feature, importance}] JSON array
```

---

## 5. Prediction Workflow

> Called on every employee prediction request. Uses pre-trained artifacts.

```
┌─────────────────────────────────────────────────────────────────────┐
│                  TALENTGUARD PREDICTION WORKFLOW                    │
└─────────────────────────────────────────────────────────────────────┘

─── SINGLE EMPLOYEE PREDICTION ──────────────────────────────────────

Step 1: INPUT VALIDATION
  Input: Employee JSON (30 fields matching original CSV columns)
  → FastAPI Pydantic model validates field types & ranges
  → Return 422 if invalid

Step 2: ARTIFACT LOADING  [src/predict.py → load_artifacts()]
  → Load models/best_model.pkl  (Random Forest)
  → Load models/scaler.pkl      (StandardScaler)
  → Recover feature_columns from model.feature_names_in_

Step 3: FEATURE ENGINEERING  [src/predict.py → _prepare_features()]
  → Drop constant columns if present
  → Drop "Attrition" column if present
  → One-hot encode categoricals: pd.get_dummies(drop_first=True)
  → Reindex to match training feature order: fill missing dummies with 0
  → Result: X (1 row × N encoded features)

Step 4: ML INFERENCE  [src/predict.py → predict()]
  → prediction  = model.predict(X)[0]          → 0 or 1
  → probability = model.predict_proba(X)[0, 1] → float [0,1]
  → risk_band:
      probability ≥ 0.70 → "High"
      probability ≥ 0.40 → "Medium"
      probability  < 0.40 → "Low"

Step 5: SHAP EXPLAINABILITY  [src/explain_prediction.py]
  → shap.Explainer(model)(X)
  → Extract shap_values[0, :, 1]  (class=1: Attrition=Yes)
  → Build explanation DataFrame: Feature | Impact | Value | Direction
  → Sort by |Impact| descending → Top-5 risk drivers

Step 6: AI RETENTION COACH  [NEW — Agentic Layer]
  → Pass Top-5 risk drivers to LLM prompt chain:
      System: "You are an HR retention specialist..."
      User:   "Employee risk factors: [SHAP top-5 with values]
               Generate 3-5 specific, actionable retention recommendations."
  → LLM returns structured recommendations:
      [{action, priority, rationale, timeline, owner}]
  → Falls back to rule-based recommendations if LLM unavailable
     (inherited from explain_prediction.py.generate_recommendations())

Step 7: RESPONSE ASSEMBLY
  Return JSON:
  {
    "employee_id": "...",
    "prediction": "Yes" | "No",
    "attrition_probability": 0.7234,
    "risk_band": "High" | "Medium" | "Low",
    "risk_score_percent": 72,
    "shap_explanation": [
      {"feature": "OverTime_Yes", "impact": 0.18, "value": 1,
       "direction": "Increase Risk", "label": "Works Overtime"},
      ...
    ],
    "ai_recommendations": [
      {"action": "Reduce overtime hours",
       "priority": "High",
       "rationale": "Overtime is the #1 attrition driver for this employee",
       "timeline": "2 weeks",
       "owner": "Direct Manager"},
      ...
    ],
    "processing_time_ms": 234
  }

Step 8: PERSISTENCE
  → Store prediction in predictions table:
      (employee_id, risk_band, probability, predicted_at, features_snapshot)
  → Enables trend tracking & dashboard aggregations

─── BATCH PREDICTION WORKFLOW ───────────────────────────────────────

Step 1: CSV UPLOAD → validate columns match expected schema
Step 2: Parse to DataFrame
Step 3: _prepare_features() → batch feature engineering
Step 4: model.predict() + model.predict_proba() → arrays
Step 5: Map risk bands for all rows
Step 6: SHAP batch explanation (TreeExplainer for efficiency)
Step 7: Return enriched DataFrame as downloadable CSV + JSON summary
        {total, high_risk_count, medium_risk_count, low_risk_count,
         top_risk_employees[...], dept_breakdown{...}}

─── WHAT-IF SIMULATION WORKFLOW ────────────────────────────────────

Step 1: Load base employee record from DB
Step 2: Apply parameter overrides from UI sliders
Step 3: Run Step 3–4 of Single Prediction Workflow
Step 4: Return only {probability, risk_band, delta_from_base}
        (no SHAP/LLM call for speed — <100ms response)
```

**FastAPI Prediction Endpoints**:
```
POST /api/v1/predict/single
  Body: EmployeeInput (Pydantic model)
  Returns: PredictionResult with SHAP + AI recommendations

POST /api/v1/predict/batch
  Body: multipart/form-data (CSV file)
  Returns: {job_id} → poll /api/v1/predict/batch/{job_id}

GET  /api/v1/predict/batch/{job_id}
  Returns: {status, results[], summary}

POST /api/v1/predict/whatif
  Body: {base_employee_id, overrides: {...}}
  Returns: {probability, risk_band, delta}

GET  /api/v1/predict/history
  Returns: paginated prediction history for dashboard
```

---

## 6. End-to-End System Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              TALENTGUARD — END-TO-END SYSTEM WORKFLOW                       │
└─────────────────────────────────────────────────────────────────────────────┘

USER (HR Manager / Admin)
        │
        ▼
┌───────────────────┐
│   React Frontend  │  (Vercel CDN)
│  + TailwindCSS    │
│  + Recharts       │
│  + Axios          │
└─────────┬─────────┘
          │ HTTPS REST API calls
          │
          ▼
┌────────────────────────────────────────────────────────┐
│              FastAPI Backend  (Render / Railway)        │
│                                                        │
│  Routers:                                              │
│  ├── /api/v1/predict/*    (prediction endpoints)       │
│  ├── /api/v1/employees/*  (employee management)        │
│  ├── /api/v1/model/*      (model metrics & training)   │
│  ├── /api/v1/dashboard/*  (aggregated analytics)       │
│  └── /api/v1/agent/*      (AI retention coach)         │
│                                                        │
│  Core Services:                                        │
│  ├── PredictionService    → src/predict.py             │
│  ├── ExplainerService     → src/explain_prediction.py  │
│  ├── AgentService         → LLM chain (OpenAI/Gemini)  │
│  ├── ModelService         → src/train.py, evaluate.py  │
│  └── DashboardService     → aggregation queries        │
│                                                        │
│  Background Workers:                                   │
│  ├── BatchPredictionWorker (asyncio)                   │
│  └── ModelRetrainingWorker (asyncio BackgroundTasks)   │
└────────────┬────────────────────────┬──────────────────┘
             │                        │
             ▼                        ▼
┌────────────────────┐    ┌────────────────────────┐
│  PostgreSQL DB     │    │   ML Model Artifacts   │
│  (Supabase Free)   │    │   (deployed with app)  │
│                    │    │                        │
│  Tables:           │    │  models/               │
│  ├── employees     │    │  ├── best_model.pkl     │
│  ├── predictions   │    │  └── scaler.pkl         │
│  ├── model_metrics │    │                        │
│  └── audit_logs    │    │  Loaded at startup,    │
│                    │    │  kept in memory         │
└────────────────────┘    └────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│                  AGENTIC AI LAYER                       │
│                                                        │
│  Agents:                                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │  RetentionCoachAgent                            │  │
│  │  Input: SHAP top-5 risk factors + employee data │  │
│  │  Steps:                                         │  │
│  │  1. Analyze risk factors                        │  │
│  │  2. Map to HR intervention library              │  │
│  │  3. Generate personalized retention plan        │  │
│  │  4. Structure as actionable items               │  │
│  │  Output: [{action, priority, rationale,         │  │
│  │            timeline, estimated_impact}]         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  DepartmentInsightAgent                         │  │
│  │  Input: Dept aggregated risk data               │  │
│  │  Output: Natural language trend commentary      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  LLM Provider: Google Gemini 1.5 Flash (free tier)    │
│  Fallback: Rule-based recommendations (no LLM cost)   │
└────────────────────────────────────────────────────────┘

─── COMPLETE USER JOURNEY ───────────────────────────────────────────

1. HR Manager opens TalentGuard → Dashboard loads:
   GET /api/v1/dashboard/overview
   → {total_employees: 1470, high_risk: 87, medium_risk: 234, low_risk: 1149}
   → Risk distribution donut chart rendered
   → Top-10 highest risk employees table rendered

2. Manager clicks "Predict New Employee" → Employee Predictor page:
   → Fills 30-field form OR loads from CSV
   POST /api/v1/predict/single
   → Result card shows: Risk Band (High), 72% probability
   → SHAP chart: "Top reasons: Overtime (+18%), Low Income (+14%)..."
   → AI Retention Plan: "1. Reduce overtime... 2. Review compensation..."

3. Manager uses What-If Simulator:
   → Slider: "Remove Overtime" → instant re-prediction
   POST /api/v1/predict/whatif {overrides: {OverTime: "No"}}
   → Risk drops from 72% → 51% (delta: -21%)

4. Admin uploads department CSV:
   POST /api/v1/predict/batch (CSV file)
   → Async processing → status polling
   → Results: ranked table + downloadable report

5. Admin triggers model retraining (with new data):
   POST /api/v1/model/train
   → Background task runs training pipeline
   GET /api/v1/model/train/status/{job_id}
   → New metrics displayed when complete
```

---

## 7. Deployment Strategy

### 7.1 Architecture

```
Frontend (React/Vite)          Backend (FastAPI)           Database
┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│    Vercel           │    │  Render.com          │    │  Supabase        │
│    (Free Tier)      │───▶│  (Free Tier)         │───▶│  (Free Tier)     │
│                     │    │                     │    │  PostgreSQL      │
│  talentguard.vercel │    │  api.talentguard    │    │  500MB free      │
│  .app               │    │  .onrender.com      │    └──────────────────┘
└─────────────────────┘    └─────────────────────┘
```

### 7.2 Service Breakdown

| Layer | Service | Tier | Cost | Notes |
|-------|---------|------|------|-------|
| **Frontend** | Vercel | Free | $0 | Auto-deploy from GitHub, global CDN |
| **Backend** | Render.com | Free | $0 | FastAPI + ML models, 512MB RAM |
| **Database** | Supabase | Free | $0 | PostgreSQL, 500MB storage |
| **LLM** | Google Gemini API | Free | $0 | 15 RPM free tier for AI agents |
| **Model Storage** | Deployed with backend | — | $0 | `models/*.pkl` in repo or Render disk |

> [!IMPORTANT]
> **Render Free Tier Caveat**: Render free services spin down after 15 minutes of inactivity. First request after spindown takes ~30-60 seconds. For hackathon demo: keep the backend pinged or upgrade to Render Starter ($7/mo) for always-on. Alternative: **Railway** ($5 free credit/month) which doesn't spin down.

### 7.3 Deployment Steps

**Frontend (Vercel)**:
```bash
# 1. Connect GitHub repo to Vercel
# 2. Set build command: npm run build
# 3. Set output directory: dist
# 4. Set environment variable:
VITE_API_URL=https://talentguard-api.onrender.com

# Auto-deploys on every git push to main
```

**Backend (Render)**:
```bash
# 1. Connect GitHub repo to Render
# 2. Configure:
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT

# 3. Environment Variables:
DATABASE_URL=postgresql://...  (from Supabase)
GEMINI_API_KEY=...
MODEL_PATH=models/best_model.pkl
SCALER_PATH=models/scaler.pkl
CORS_ORIGINS=https://talentguard.vercel.app

# 4. Disk: mount /models for .pkl files (if not in repo)
```

**Database (Supabase)**:
```sql
-- Auto-provisioned PostgreSQL
-- Run migrations via Supabase SQL editor or Alembic
CREATE TABLE predictions (...);
CREATE TABLE model_metrics (...);
CREATE TABLE employees (...);
```

### 7.4 Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `VITE_API_URL` | Frontend | Backend API base URL |
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `GEMINI_API_KEY` | Backend | Google Gemini LLM API key |
| `CORS_ORIGINS` | Backend | Allowed frontend origins |
| `MODEL_PATH` | Backend | Path to best_model.pkl |
| `SCALER_PATH` | Backend | Path to scaler.pkl |
| `SECRET_KEY` | Backend | JWT signing key |

### 7.5 CI/CD Pipeline

```
GitHub Repository
├── main branch → auto-deploy to Render (backend) + Vercel (frontend)
├── PRs → preview deployments on Vercel
└── GitHub Actions (optional):
    → Run linting on PR
    → Run smoke tests post-deploy
```

---

## 8. Development Phases

> **Total time: 4 hours** · Each phase has a hard time budget

### Phase 1 — Foundation & ML Backend (60 min)

**Goal**: Working FastAPI backend with ML prediction endpoints

| Task | File | Est. Time |
|------|------|-----------|
| Init FastAPI project structure | `backend/` | 5 min |
| Copy & adapt `preprocessing.py`, `predict.py`, `evaluate.py` | `backend/ml/` | 10 min |
| Copy pre-trained `best_model.pkl` + `scaler.pkl` | `backend/models/` | 2 min |
| Create Pydantic `EmployeeInput` model (all 30 fields) | `backend/schemas.py` | 10 min |
| Build `/api/v1/predict/single` endpoint | `backend/routers/predict.py` | 10 min |
| Build `/api/v1/predict/whatif` endpoint | `backend/routers/predict.py` | 8 min |
| Build `/api/v1/model/metrics` + `/feature-importance` endpoints | `backend/routers/model.py` | 10 min |
| CORS setup + health check endpoint | `backend/main.py` | 5 min |

**Phase 1 Exit Criteria**: `POST /api/v1/predict/single` returns prediction + SHAP data

---

### Phase 2 — Agentic AI Layer (30 min)

**Goal**: AI Retention Coach working end-to-end

| Task | File | Est. Time |
|------|------|-----------|
| Integrate Google Gemini SDK | `backend/services/agent.py` | 5 min |
| Build `RetentionCoachAgent` with SHAP-informed prompts | `backend/services/agent.py` | 15 min |
| Build `DepartmentInsightAgent` for commentary | `backend/services/agent.py` | 5 min |
| Extend `/predict/single` response with AI recommendations | `backend/routers/predict.py` | 5 min |

**Phase 2 Exit Criteria**: Single prediction returns AI-generated retention recommendations

---

### Phase 3 — Database & Dashboard API (30 min)

**Goal**: Database connected, dashboard aggregation working

| Task | File | Est. Time |
|------|------|-----------|
| Setup Supabase + SQLAlchemy models | `backend/database.py` | 10 min |
| Create tables: employees, predictions, model_metrics | `backend/models/db.py` | 5 min |
| Store predictions on each call | `backend/routers/predict.py` | 5 min |
| Build `/api/v1/dashboard/overview` endpoint | `backend/routers/dashboard.py` | 10 min |

**Phase 3 Exit Criteria**: Dashboard API returns real aggregated data from DB

---

### Phase 4 — React Frontend (90 min)

**Goal**: Full polished UI connected to backend

| Task | Component | Est. Time |
|------|-----------|-----------|
| Init Vite + React + TailwindCSS project | `frontend/` | 5 min |
| Install dependencies: axios, recharts, react-router-dom, react-hook-form | — | 3 min |
| Create design system: colors, typography, component styles | `src/index.css` | 10 min |
| App layout: sidebar + header (from Hexa-MedPlus patterns) | `src/components/Layout.jsx` | 10 min |
| Dashboard page: KPI tiles + risk donut chart + top-risk table | `src/pages/Dashboard.jsx` | 20 min |
| Employee Predictor page: 30-field form + result card + SHAP chart | `src/pages/Predictor.jsx` | 20 min |
| What-If Simulator: sliders + live delta display | `src/pages/WhatIf.jsx` | 10 min |
| AI Retention Coach panel: recommendations display | `src/components/RetentionCoach.jsx` | 10 min |
| Model Performance page: metrics + feature importance bar chart | `src/pages/ModelPerformance.jsx` | 12 min |

**Phase 4 Exit Criteria**: All pages render with live data from backend

---

### Phase 5 — Batch Upload, Polish & Deploy (30 min)

**Goal**: Batch feature, final polish, deployed to Vercel + Render

| Task | Est. Time |
|------|-----------|
| Batch upload: CSV drag-drop + async polling + results table | 10 min |
| Mobile responsiveness check + minor UI fixes | 5 min |
| Environment variables + build config | 3 min |
| Deploy frontend to Vercel | 5 min |
| Deploy backend to Render | 5 min |
| Smoke test deployed URLs + demo walkthrough prep | 2 min |

**Phase 5 Exit Criteria**: Live deployment accessible at public URLs

---

## 9. Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend — Vercel CDN"
        UI["React + TailwindCSS\n(Vite Build)"]
        subgraph "Pages"
            DASH["Dashboard\n(KPI + Charts)"]
            PRED["Employee Predictor\n(Form + Results)"]
            BATCH["Batch Upload\n(CSV → Report)"]
            WHATIF["What-If Simulator\n(Interactive Sliders)"]
            COACH["AI Retention Coach\n(Recommendations)"]
            METRICS["Model Performance\n(Metrics + Feature Importance)"]
        end
        UI --> DASH & PRED & BATCH & WHATIF & COACH & METRICS
    end

    subgraph "Backend — Render.com"
        API["FastAPI App\nmain.py"]

        subgraph "Routers"
            R_PRED["/api/v1/predict/*"]
            R_DASH["/api/v1/dashboard/*"]
            R_MODEL["/api/v1/model/*"]
            R_AGENT["/api/v1/agent/*"]
        end

        subgraph "ML Core — from employee-attrition-prediction-main"
            PREPROC["preprocessing.py\n(Feature Engineering)"]
            INFER["predict.py\n(Inference Engine)"]
            SHAP_SVC["explain_prediction.py\n(SHAP Explainer)"]
            EVAL["evaluate.py\n(Metrics)"]
            FEAT_IMP["feature_importance.py\n(Importances)"]
        end

        subgraph "Agentic AI Layer"
            RETENTION["RetentionCoachAgent\n(SHAP → LLM → Plan)"]
            DEPT_AGENT["DepartmentInsightAgent\n(Trend Commentary)"]
        end

        subgraph "Model Artifacts"
            RF["best_model.pkl\n(Random Forest)"]
            SCALER["scaler.pkl\n(StandardScaler)"]
        end

        API --> R_PRED & R_DASH & R_MODEL & R_AGENT
        R_PRED --> PREPROC --> INFER --> SHAP_SVC
        SHAP_SVC --> RETENTION
        R_AGENT --> DEPT_AGENT
        INFER --> RF & SCALER
        R_MODEL --> EVAL & FEAT_IMP
    end

    subgraph "Data Layer"
        PG["Supabase PostgreSQL\n(Free Tier)"]
        subgraph "Tables"
            T_PRED["predictions\n(history + risk bands)"]
            T_EMP["employees\n(profiles)"]
            T_METRICS["model_metrics\n(training runs)"]
        end
        PG --> T_PRED & T_EMP & T_METRICS
    end

    subgraph "External AI"
        GEMINI["Google Gemini 1.5 Flash\n(Free API)"]
    end

    subgraph "Dataset Source"
        CSV["IBM HR Attrition Dataset\n1,470 employees · 35 features\nWA_Fn-UseC_-HR-Employee-Attrition.csv"]
    end

    UI -- "HTTPS REST" --> API
    R_DASH & R_PRED --> PG
    RETENTION & DEPT_AGENT --> GEMINI
    CSV -- "Training Pipeline\n(one-time / on-demand)" --> PREPROC

    style UI fill:#1e3a5f,stroke:#4a9eff,color:#fff
    style API fill:#1a3a1a,stroke:#4aff4a,color:#fff
    style PG fill:#3a1a3a,stroke:#ff4aff,color:#fff
    style GEMINI fill:#3a2a1a,stroke:#ffaa4a,color:#fff
    style CSV fill:#1a2a3a,stroke:#4aaeff,color:#fff
    style RF fill:#2a1a1a,stroke:#ff6666,color:#fff
    style SCALER fill:#2a1a1a,stroke:#ff6666,color:#fff
```

---

## Appendix: File Inventory — What We Build

```
talentguard/
├── frontend/                          [Phase 4]
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Predictor.jsx
│   │   │   ├── BatchUpload.jsx
│   │   │   ├── WhatIfSimulator.jsx
│   │   │   ├── RetentionCoach.jsx
│   │   │   └── ModelPerformance.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   ├── ShapChart.jsx
│   │   │   ├── KpiCard.jsx
│   │   │   ├── RiskTable.jsx
│   │   │   └── RecommendationCard.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                           [Phases 1–3]
│   ├── main.py                        (FastAPI app entry)
│   ├── routers/
│   │   ├── predict.py                 (single, batch, whatif)
│   │   ├── dashboard.py               (aggregated analytics)
│   │   ├── model.py                   (metrics, feature-importance, train)
│   │   └── agent.py                   (retention coach, dept insight)
│   ├── ml/                            (adapted from employee-attrition-prediction-main)
│   │   ├── preprocessing.py           ← adapted src/preprocessing.py
│   │   ├── predict.py                 ← adapted src/predict.py
│   │   ├── explain_prediction.py      ← adapted src/explain_prediction.py
│   │   ├── evaluate.py                ← adapted src/evaluate.py
│   │   ├── feature_importance.py      ← adapted src/feature_importance.py
│   │   ├── train.py                   ← adapted src/train.py
│   │   └── tune_models.py             ← adapted src/tune_models.py
│   ├── models/
│   │   ├── best_model.pkl             ← pre-trained, copied directly
│   │   └── scaler.pkl                 ← pre-trained, copied directly
│   ├── services/
│   │   ├── prediction_service.py
│   │   ├── agent_service.py           (Gemini integration)
│   │   └── dashboard_service.py
│   ├── database.py                    (SQLAlchemy + Supabase)
│   ├── schemas.py                     (Pydantic models)
│   ├── config.py                      (env vars)
│   └── requirements.txt
│
└── README.md
```

---

> [!NOTE]
> **Hackathon Score Maximizers**:
> 1. **Agentic AI** — RetentionCoachAgent with LLM-powered recommendations differentiates from basic ML projects
> 2. **Explainability** — SHAP waterfall charts show judges we understand model internals
> 3. **What-If Simulator** — Demonstrates practical HR value beyond "just prediction"
> 4. **Production deployment** — Live URLs on Vercel + Render, not localhost demos
> 5. **Beautiful UI** — Glassmorphism dark theme, animations, premium feel (from reference app patterns)
