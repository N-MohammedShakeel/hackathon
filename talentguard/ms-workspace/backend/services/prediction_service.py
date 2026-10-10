import os
import json
import joblib
import pandas as pd
import numpy as np
from config import MODEL_PATH, SCALER_PATH, FEATURE_COLUMNS_PATH, MODEL_METRICS_PATH, FEATURE_IMPORTANCE_PATH, WATCHLIST_PATH

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

class PredictionEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = []
        self.metrics = {}
        self.feature_importance = []
        self.watchlist = []
        self.load_artifacts()

    def load_artifacts(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Helper to get path relative to current module or config
        def get_path(path):
            if os.path.isabs(path):
                return path
            rel_path = os.path.join(base_dir, "..", path)
            if os.path.exists(rel_path):
                return rel_path
            return path

        model_p = get_path(MODEL_PATH)
        scaler_p = get_path(SCALER_PATH)
        cols_p = get_path(FEATURE_COLUMNS_PATH)
        metrics_p = get_path(MODEL_METRICS_PATH)
        fi_p = get_path(FEATURE_IMPORTANCE_PATH)
        wl_p = get_path(WATCHLIST_PATH)

        if os.path.exists(model_p):
            self.model = joblib.load(model_p)
        if os.path.exists(scaler_p):
            self.scaler = joblib.load(scaler_p)
        if os.path.exists(cols_p):
            with open(cols_p, 'r') as f:
                self.feature_columns = json.load(f)
        if os.path.exists(metrics_p):
            with open(metrics_p, 'r') as f:
                self.metrics = json.load(f)
        if os.path.exists(fi_p):
            with open(fi_p, 'r') as f:
                self.feature_importance = json.load(f)
        if os.path.exists(wl_p):
            with open(wl_p, 'r') as f:
                self.watchlist = json.load(f)

    def prepare_features(self, input_dict: dict) -> pd.DataFrame:
        df = pd.DataFrame([input_dict])
        
        # Categorical columns to dummy encode
        cat_cols = ['BusinessTravel', 'Department', 'EducationField', 'Gender', 'JobRole', 'MaritalStatus', 'OverTime']
        for col in cat_cols:
            if col not in df.columns:
                df[col] = ''

        df_dummies = pd.get_dummies(df, columns=cat_cols, drop_first=True)
        
        # Reindex to match training columns
        df_reindexed = df_dummies.reindex(columns=self.feature_columns, fill_value=0)
        return df_reindexed

    def predict_single(self, input_dict: dict) -> dict:
        if not self.model:
            self.load_artifacts()
            if not self.model:
                raise ValueError("Model artifacts not loaded properly.")

        X = self.prepare_features(input_dict)
        prob = float(self.model.predict_proba(X)[0][1])
        score_percent = int(round(prob * 100))

        if prob >= 0.7:
            risk_band = "High"
        elif prob >= 0.4:
            risk_band = "Medium"
        else:
            risk_band = "Low"

        # Calculate SHAP approximation / Feature Impact
        shap_factors = []
        if hasattr(self.model, 'feature_importances_'):
            feat_vals = X.iloc[0]
            importances = self.model.feature_importances_
            
            scored = []
            for idx, col in enumerate(self.feature_columns):
                val = float(feat_vals.iloc[idx])
                imp = float(importances[idx])
                # Direct impact direction based on value presence / weight
                impact = imp * (1.0 if val > 0 else 0.1)
                scored.append((col, val, imp, impact))
            
            scored.sort(key=lambda x: -abs(x[3]))
            top_factors = scored[:5]

            for col, val, imp, impact in top_factors:
                label = LABEL_MAP.get(col, col.replace('_', ' ').title())
                direction = "Increase Risk" if impact > 0.05 else "Neutral/Decrease"
                shap_factors.append({
                    "feature": col,
                    "label": label,
                    "direction": direction,
                    "impact": round(abs(impact), 4)
                })

        # Rule-based recommendations
        recommendations = []
        for factor in shap_factors[:3]:
            col = factor["feature"]
            if col in ACTIONS:
                recommendations.append({
                    "action": ACTIONS[col],
                    "priority": "High" if factor["impact"] > 0.1 else "Medium",
                    "rationale": f"Triggered by {factor['label']}",
                    "timeline": "Within 2 weeks" if factor["impact"] > 0.1 else "Within 30 days",
                    "owner": "Direct Manager / HR BP"
                })
        
        if not recommendations:
            recommendations.append({
                "action": "Schedule 1:1 stay interview to discuss career alignment and satisfaction",
                "priority": "Medium",
                "rationale": "General proactive retention strategy",
                "timeline": "Within 30 days",
                "owner": "Direct Manager"
            })

        return {
            "prediction": "Yes" if prob >= 0.5 else "No",
            "attrition_probability": round(prob, 4),
            "risk_score_percent": score_percent,
            "risk_band": risk_band,
            "shap_explanation": shap_factors,
            "ai_recommendations": recommendations
        }

    def predict_whatif(self, base_dict: dict, overrides: dict) -> dict:
        orig_res = self.predict_single(base_dict)
        orig_prob = orig_res["attrition_probability"]

        modified_dict = base_dict.copy()
        modified_dict.update(overrides)

        new_res = self.predict_single(modified_dict)
        new_prob = new_res["attrition_probability"]

        delta = round(new_prob - orig_prob, 4)

        return {
            "original_probability": orig_prob,
            "new_probability": new_prob,
            "delta": delta,
            "risk_band": new_res["risk_band"],
            "improved": delta < 0
        }

prediction_engine = PredictionEngine()
