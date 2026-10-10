import pandas as pd
import numpy as np
import joblib
import json
import os
import shutil
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score

base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(base_dir, "praveen-workspace", "ml", "data", "WA_Fn-UseC_-HR-Employee-Attrition.csv")
if not os.path.exists(dataset_path):
    dataset_path = os.path.join(base_dir, "..", "dataset", "WA_Fn-UseC_-HR-Employee-Attrition.csv")

print("Loading dataset...")
df = pd.read_csv(dataset_path)
raw_df = df.copy()  # keep for employee details

df.drop(columns=["EmployeeNumber", "EmployeeCount", "Over18", "StandardHours"], inplace=True)
df["Attrition"] = df["Attrition"].map({"No": 0, "Yes": 1})

X = df.drop("Attrition", axis=1)
y = df["Attrition"]
categorical = X.select_dtypes(include="object").columns
X = pd.get_dummies(X, columns=categorical, drop_first=True)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

print("Training Logistic Regression baseline...")
lr = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
lr.fit(X_train_sc, y_train)
lr_auc = roc_auc_score(y_test, lr.predict_proba(X_test_sc)[:, 1])
print(f"  LR ROC-AUC: {lr_auc:.4f}")

print("Training Random Forest...")
rf = RandomForestClassifier(
    n_estimators=200, max_depth=10, min_samples_split=5,
    min_samples_leaf=2, random_state=42, class_weight="balanced"
)
rf.fit(X_train, y_train)

y_prob = rf.predict_proba(X_test)[:, 1]
y_pred = rf.predict(X_test)
roc = roc_auc_score(y_test, y_prob)
f1 = f1_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
top50_idx = np.argsort(y_prob)[::-1][:50]
prec_50 = float(y_test.iloc[top50_idx].mean())
print(f"  RF ROC-AUC: {roc:.4f}, F1: {f1:.4f}, Prec@50: {prec_50:.4f}")

# Feature importance top 15
feat_imp = [
    {"feature": f, "importance": round(float(v), 4), "label": f.replace("_", " ").title()}
    for f, v in sorted(zip(X_train.columns, rf.feature_importances_), key=lambda x: -x[1])[:15]
]

# Save to backend/models
models_dir = os.path.join(base_dir, "ms-workspace", "backend", "models")
os.makedirs(models_dir, exist_ok=True)

joblib.dump(rf, os.path.join(models_dir, "best_model.pkl"))
joblib.dump(scaler, os.path.join(models_dir, "scaler.pkl"))

with open(os.path.join(models_dir, "feature_columns.json"), "w") as f:
    json.dump(list(X_train.columns), f)

metrics = {
    "model": "RandomForest",
    "roc_auc": round(roc, 4),
    "f1": round(f1, 4),
    "precision_at_50": round(prec_50, 4),
    "recall": round(rec, 4),
    "precision": round(prec, 4),
    "baseline_model": "LogisticRegression",
    "baseline_roc_auc": round(lr_auc, 4),
    "n_features": len(X_train.columns),
    "n_train_samples": len(X_train),
    "n_test_samples": len(X_test),
    "class_imbalance_rate": round(float(y.mean()), 4),
    "trained_at": "2026-10-10T06:10:00"
}
with open(os.path.join(models_dir, "model_metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)

with open(os.path.join(models_dir, "feature_importance.json"), "w") as f:
    json.dump(feat_imp, f, indent=2)

# --- Generate Top-50 watch list on full dataset ---
print("Generating Top-50 watch list...")
X_full_raw = raw_df.drop(columns=["EmployeeNumber", "EmployeeCount", "Over18", "StandardHours", "Attrition"])
categorical_full = X_full_raw.select_dtypes(include="object").columns
X_full = pd.get_dummies(X_full_raw, columns=categorical_full, drop_first=True)
X_full = X_full.reindex(columns=list(X_train.columns), fill_value=0)

probs_full = rf.predict_proba(X_full)[:, 1]
top50_idx_full = np.argsort(probs_full)[::-1][:50]

LABEL_MAP = {
    "OverTime_Yes": "Works Overtime",
    "MonthlyIncome": "Low Monthly Income",
    "YearsAtCompany": "Short Company Tenure",
    "JobSatisfaction": "Low Job Satisfaction",
    "DistanceFromHome": "Far From Home",
    "TotalWorkingYears": "Limited Work Experience",
    "YearsSinceLastPromotion": "No Recent Promotion",
    "MaritalStatus_Single": "Single (Higher Risk Profile)",
    "BusinessTravel_Travel_Frequently": "Frequent Travel",
    "WorkLifeBalance": "Poor Work-Life Balance",
    "EnvironmentSatisfaction": "Low Environment Satisfaction",
    "Age": "Young Age",
    "StockOptionLevel": "No Stock Options",
    "JobLevel": "Entry Level Role",
    "NumCompaniesWorked": "Job Hopper",
}

ACTIONS = {
    "OverTime_Yes": "Schedule 1:1 to review workload; offer flex hours this quarter",
    "MonthlyIncome": "Flag for next comp review cycle; benchmark against market rate",
    "YearsAtCompany": "Assign mentor; 30-60-90 day check-in cadence",
    "JobSatisfaction": "Conduct anonymous pulse survey; offer role rotation",
    "BusinessTravel_Travel_Frequently": "Reduce travel quota; offer remote option",
    "YearsSinceLastPromotion": "Initiate promotion review discussion this quarter",
    "DistanceFromHome": "Offer hybrid work arrangement",
    "MaritalStatus_Single": "Enhance social engagement and team bonding activities",
    "WorkLifeBalance": "Review workload distribution; offer flexible scheduling",
}

watchlist = []
for rank, idx in enumerate(top50_idx_full, 1):
    prob = float(probs_full[idx])
    band = "High" if prob >= 0.7 else "Medium" if prob >= 0.4 else "Low"
    feat_vals = X_full.iloc[idx]

    # Score features by importance * value for ranking risk factors
    scored = [
        (col, float(rf.feature_importances_[ci]) * (1.0 if float(feat_vals.iloc[ci]) > 0 else -0.5))
        for ci, col in enumerate(X_full.columns)
    ]
    scored.sort(key=lambda x: -abs(x[1]))
    top3 = scored[:3]

    row_raw = raw_df.iloc[idx]
    action = next(
        (ACTIONS[f] for f, _ in top3 if f in ACTIONS),
        "Schedule retention conversation with direct manager"
    )

    watchlist.append({
        "rank": rank,
        "employee_id": int(row_raw.get("EmployeeNumber", idx + 1000)),
        "attrition_probability": round(prob, 4),
        "risk_band": band,
        "department": str(row_raw.get("Department", "")),
        "job_role": str(row_raw.get("JobRole", "")),
        "monthly_income": int(row_raw.get("MonthlyIncome", 0)),
        "overtime": str(row_raw.get("OverTime", "")),
        "years_at_company": int(row_raw.get("YearsAtCompany", 0)),
        "top_risk_factors": [
            {
                "feature": f,
                "label": LABEL_MAP.get(f, f.replace("_", " ").title()),
                "direction": "Increase Risk" if v > 0 else "Decrease Risk",
                "impact": round(abs(v), 4)
            }
            for f, v in top3
        ],
        "retention_action": action
    })

with open(os.path.join(models_dir, "top50_watchlist.json"), "w") as f:
    json.dump(watchlist, f, indent=2)

# Copy to praveen artifacts too
prav_dir = os.path.join(base_dir, "praveen-workspace", "artifacts")
os.makedirs(prav_dir, exist_ok=True)
for fn in ["best_model.pkl", "scaler.pkl", "feature_columns.json", "model_metrics.json",
           "feature_importance.json", "top50_watchlist.json"]:
    shutil.copy(os.path.join(models_dir, fn), os.path.join(prav_dir, fn))

print("\nALL ARTIFACTS GENERATED SUCCESSFULLY")
top = watchlist[0]
print(f"Top risk employee: {top['department']} - {top['job_role']}, {top['attrition_probability']*100:.1f}% risk")
print(f"Watch list: {len(watchlist)} employees ({sum(1 for w in watchlist if w['risk_band']=='High')} High, {sum(1 for w in watchlist if w['risk_band']=='Medium')} Medium)")
print(f"Feature importance top-3: {[f['feature'] for f in feat_imp[:3]]}")
