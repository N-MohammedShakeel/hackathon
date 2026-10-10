# TalentGuard — Predictive HR Attrition & Agentic Retention Intelligence System
### Maverick Mini Hackathon · Problem Statement P1 Solution

---

## Executive Summary
**TalentGuard** is an end-to-end AI platform built for **TechNova Solutions** (a 12,000-person IT services firm losing 16% of staff per year) to predict employee resignations, explain root causes using SHAP analysis, and auto-generate manager retention outreach plans with an AI Agent.

---

## Project Repository Architecture

```
talentguard/
├── ms-workspace/                 ← MS (Full-Stack & Agentic AI Engineer)
│   ├── backend/                  ← FastAPI Python REST API & Gemini Integration
│   │   ├── main.py
│   │   ├── routers/              (predict, dashboard, model_info, agent)
│   │   ├── services/             (prediction_service, agent_service, dashboard_service)
│   │   ├── models/               (mounted ML model artifacts)
│   │   └── requirements.txt
│   └── frontend/                 ← React 18 + TailwindCSS + Recharts Application
│       ├── src/
│       │   ├── pages/            (Dashboard, WatchList, Predictor, WhatIf, ModelPerformance)
│       │   ├── components/       (Layout, RiskBadge, KpiCard, ShapChart, RetentionPlanModal)
│       │   └── services/api.js
│       └── package.json
├── praveen-workspace/            ← Praveen (ML & Data Science Engineer)
│   ├── ml/
│   │   ├── data/                 (WA_Fn-UseC_-HR-Employee-Attrition.csv)
│   │   ├── notebooks/            (01_EDA.ipynb, 02_Training.ipynb, 03_SHAP_Artifact.ipynb)
│   │   └── src/                  (preprocessing.py, train.py, evaluate.py)
│   └── artifacts/                (exported best_model.pkl, scaler.pkl, top50_watchlist.json)
└── shared/                       ← Integration Specifications
    ├── api_contract.md
    └── employee_fields.json
```

---

## Tech Stack
- **Frontend**: React 18, TailwindCSS, Recharts, Lucide Icons, Vite
- **Backend**: Python 3.14, FastAPI, Pydantic v2, Uvicorn
- **Machine Learning**: Scikit-Learn (Random Forest & Logistic Regression), SHAP, Joblib, Pandas, NumPy
- **Agentic AI**: Google Gemini 1.5 Flash (`google-generativeai`)
- **Deployment**: Vercel (Frontend) + Render (Backend)

---

## Running Locally

### 1. Backend Server (MS)
```bash
cd ms-workspace/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend API interactive docs: `http://localhost:8000/docs`

### 2. Frontend Web App (MS)
```bash
cd ms-workspace/frontend
npm install
npm run dev
```
Access UI at `http://localhost:5173`

---

## Key Features & Hackathon Score Maximizers
1. **Required T4 Output**: Ranked Top-50 watch list with top-3 SHAP risk factors & CSV export.
2. **+5 Bonus — Agent Touch**: AI Retention Coach auto-drafting manager outreach emails marked `PENDING_APPROVAL`.
3. **+5 Bonus — Free Public Deployment**: Configured for Vercel + Render deployment.
4. **Anti-Leakage Validation**: Explicitly handled dataset traps (dropped `EmployeeNumber`, `EmployeeCount`, `StandardHours`, `Over18`) and evaluated via ROC-AUC (~0.78-0.82) & Precision@50 rather than accuracy.
5. **Interactive What-If Simulator**: Live policy intervention modeling with instant ROI calculation.
