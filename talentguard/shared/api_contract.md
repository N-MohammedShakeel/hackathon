# TalentGuard API Contract & Integration Specifications

## Overview
This document specifies the exact contract between Praveen's ML training artifacts (`praveen-workspace/artifacts/`) and MS's FastAPI backend (`ms-workspace/backend/models/`).

---

## 1. Artifact Export Requirements (Praveen → MS)

Praveen's ML pipeline must export the following 6 artifacts to `praveen-workspace/artifacts/`:

1. `best_model.pkl`: Trained `RandomForestClassifier` object (joblib).
2. `scaler.pkl`: Fitted `StandardScaler` object (joblib).
3. `feature_columns.json`: List of string column names in exact order expected by `best_model.pkl`.
4. `model_metrics.json`: Validation metrics JSON.
5. `feature_importance.json`: Top 15 feature importances JSON.
6. `top50_watchlist.json`: Ranked Top-50 watch list JSON.

---

## 2. JSON Artifact Schemas

### `model_metrics.json`
```json
{
  "model": "RandomForest",
  "roc_auc": 0.823,
  "f1": 0.581,
  "precision_at_50": 0.44,
  "recall": 0.612,
  "precision": 0.428,
  "baseline_model": "LogisticRegression",
  "baseline_roc_auc": 0.802,
  "n_features": 44,
  "n_train_samples": 1176,
  "n_test_samples": 294,
  "class_imbalance_rate": 0.1612,
  "trained_at": "2026-10-10T06:10:00"
}
```

### `top50_watchlist.json`
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
    "retention_action": "Schedule 1:1 to review workload; offer flex hours this quarter"
  }
]
```

---

## 3. Backend Endpoints (Exposed by MS)

| Method | Endpoint | Description |
| shadow | -------- | ----------- |
| `GET` | `/api/v1/health` | Health check endpoint |
| `POST` | `/api/v1/predict/single` | Predict single employee risk + SHAP explanation |
| `POST` | `/api/v1/predict/whatif` | Simulate HR intervention overrides |
| `GET` | `/api/v1/dashboard/overview` | Executive KPI dashboard & top 10 queue |
| `GET` | `/api/v1/dashboard/watchlist` | Full Top-50 watch list |
| `GET` | `/api/v1/model/metrics` | Serving `model_metrics.json` |
| `GET` | `/api/v1/model/feature-importance` | Serving `feature_importance.json` |
| `POST` | `/api/v1/agent/retention-plan` | AI Retention Coach plan & `PENDING_APPROVAL` email |
