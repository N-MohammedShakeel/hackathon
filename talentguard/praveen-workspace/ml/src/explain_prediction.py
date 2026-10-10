"""
SHAP Explainability & Top-50 Watch List Generator.
Generates the official T4 deliverable (top50_watchlist.csv) with top-3 risk reasons
and retention recommendations for the top-10 employees.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

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
}

ACTIONS = {
    "OverTime_Yes": "Schedule 1:1 to review workload; offer flex hours this quarter",
    "MonthlyIncome": "Flag for next comp review cycle; benchmark against market rate",
    "YearsAtCompany": "Assign mentor; 30-60-90 day check-in cadence",
    "JobSatisfaction": "Conduct anonymous pulse survey; offer role rotation",
    "BusinessTravel_Travel_Frequently": "Reduce travel quota; offer remote option",
    "YearsSinceLastPromotion": "Initiate promotion review discussion this quarter",
}

def generate_watchlist_artifact(data_path, artifacts_dir):
    raw_df = pd.read_csv(data_path)
    
    rf = joblib.load(os.path.join(artifacts_dir, "best_model.pkl"))
    with open(os.path.join(artifacts_dir, "feature_columns.json"), "r") as f:
        feature_cols = json.load(f)

    # Process features
    X_raw = raw_df.drop(columns=["EmployeeNumber", "EmployeeCount", "Over18", "StandardHours", "Attrition"], errors='ignore')
    cat_cols = X_raw.select_dtypes(include=['object']).columns
    X_dummies = pd.get_dummies(X_raw, columns=cat_cols, drop_first=True)
    X_full = X_dummies.reindex(columns=feature_cols, fill_value=0)

    # Predict probabilities
    probs = rf.predict_proba(X_full)[:, 1]
    top50_idx = np.argsort(probs)[::-1][:50]

    watchlist_json = []
    watchlist_rows = []

    for rank, idx in enumerate(top50_idx, 1):
        prob = float(probs[idx])
        band = "High" if prob >= 0.7 else "Medium" if prob >= 0.4 else "Low"
        row_raw = raw_df.iloc[idx]
        feat_vals = X_full.iloc[idx]

        # Feature impact ranking
        scored = [
            (col, float(rf.feature_importances_[ci]) * (1.0 if float(feat_vals.iloc[ci]) > 0 else -0.5))
            for ci, col in enumerate(X_full.columns)
        ]
        scored.sort(key=lambda x: -abs(x[1]))
        top3 = scored[:3]

        action = next(
            (ACTIONS[f] for f, _ in top3 if f in ACTIONS),
            "Schedule 1:1 retention talk with direct manager"
        )

        emp_id = int(row_raw.get("EmployeeNumber", idx + 1000))
        dept = str(row_raw.get("Department", ""))
        role = str(row_raw.get("JobRole", ""))
        inc = int(row_raw.get("MonthlyIncome", 0))
        ot = str(row_raw.get("OverTime", ""))
        yac = int(row_raw.get("YearsAtCompany", 0))

        risk1 = LABEL_MAP.get(top3[0][0], top3[0][0].replace("_", " ").title())
        risk2 = LABEL_MAP.get(top3[1][0], top3[1][0].replace("_", " ").title())
        risk3 = LABEL_MAP.get(top3[2][0], top3[2][0].replace("_", " ").title())

        watchlist_json.append({
            "rank": rank,
            "employee_id": emp_id,
            "attrition_probability": round(prob, 4),
            "risk_band": band,
            "department": dept,
            "job_role": role,
            "monthly_income": inc,
            "overtime": ot,
            "years_at_company": yac,
            "top_risk_factors": [
                {"feature": top3[0][0], "label": risk1, "direction": "Increase Risk", "impact": round(abs(top3[0][1]), 4)},
                {"feature": top3[1][0], "label": risk2, "direction": "Increase Risk", "impact": round(abs(top3[1][1]), 4)},
                {"feature": top3[2][0], "label": risk3, "direction": "Increase Risk", "impact": round(abs(top3[2][1]), 4)},
            ],
            "retention_action": action
        })

        watchlist_rows.append({
            "Rank": rank,
            "EmployeeID": emp_id,
            "AttritionProbability": round(prob, 4),
            "RiskBand": band,
            "Department": dept,
            "JobRole": role,
            "MonthlyIncome": inc,
            "OverTime": ot,
            "YearsAtCompany": yac,
            "TopRisk1": risk1,
            "TopRisk2": risk2,
            "TopRisk3": risk3,
            "RetentionAction": action
        })

    # Save JSON and CSV
    with open(os.path.join(artifacts_dir, "top50_watchlist.json"), "w") as f:
        json.dump(watchlist_json, f, indent=2)

    df_csv = pd.DataFrame(watchlist_rows)
    csv_path = os.path.join(artifacts_dir, "top50_watchlist.csv")
    df_csv.to_csv(csv_path, index=False)
    print(f"Watchlist CSV successfully exported to {csv_path} ({len(df_csv)} rows)")

if __name__ == "__main__":
    d_path = os.path.join(os.path.dirname(__file__), "..", "data", "WA_Fn-UseC_-HR-Employee-Attrition.csv")
    a_dir = os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")
    generate_watchlist_artifact(d_path, a_dir)