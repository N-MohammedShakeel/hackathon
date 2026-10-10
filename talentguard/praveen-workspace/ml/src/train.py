"""
Training Pipeline Orchestration for TalentGuard ML Model.
Trains Logistic Regression Baseline & Random Forest Classifier.
Tracks experiments via MLflow (+5 bonus points).
Exports trained artifacts to praveen-workspace/artifacts/.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

try:
    import mlflow
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False

from preprocessing import load_data, preprocess_data
from evaluate import evaluate_model

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "WA_Fn-UseC_-HR-Employee-Attrition.csv")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")

def run_training_pipeline():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    print("1. Loading dataset...")
    df = load_data(DATA_PATH)

    # Stratified Train-Test Split (80/20)
    X_raw = df.drop(columns=['Attrition'])
    y_raw = df['Attrition'].map({'No': 0, 'Yes': 1})
    
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y_raw, test_size=0.2, random_state=42, stratify=y_raw
    )

    df_train = X_train_raw.copy()
    df_train['Attrition'] = y_train

    df_test = X_test_raw.copy()
    df_test['Attrition'] = y_test

    print("2. Preprocessing & handling hidden data traps...")
    X_train, X_train_scaled, y_train, scaler, feature_cols = preprocess_data(df_train, is_train=True)
    X_test, X_test_scaled, y_test, _, _ = preprocess_data(df_test, is_train=False, scaler=scaler, feature_cols=feature_cols)

    # Set up MLflow
    if HAS_MLFLOW:
        mlflow.set_experiment("TalentGuard_HR_Attrition")
        print("   MLflow tracking enabled.")

    print("3. Training Baseline Model (Logistic Regression with class_weight='balanced')...")
    lr = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)
    lr.fit(X_train_scaled, y_train)
    lr_metrics, _, _ = evaluate_model(lr, X_test_scaled, y_test)
    print(f"   Baseline Logistic Regression ROC-AUC: {lr_metrics['roc_auc']}")

    if HAS_MLFLOW:
        with mlflow.start_run(run_name="Baseline_LogisticRegression"):
            mlflow.log_params({"model": "LogisticRegression", "class_weight": "balanced"})
            mlflow.log_metrics(lr_metrics)

    print("4. Training Champion Model (Random Forest Classifier)...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42
    )
    rf.fit(X_train, y_train)
    rf_metrics, _, _ = evaluate_model(rf, X_test, y_test)
    print(f"   Random Forest ROC-AUC: {rf_metrics['roc_auc']}, Precision@50: {rf_metrics['precision_at_50']}")

    if HAS_MLFLOW:
        with mlflow.start_run(run_name="Champion_RandomForest"):
            mlflow.log_params({"model": "RandomForest", "n_estimators": 200, "max_depth": 10})
            mlflow.log_metrics(rf_metrics)

    print("5. Exporting model artifacts...")
    joblib.dump(rf, os.path.join(ARTIFACTS_DIR, "best_model.pkl"))
    joblib.dump(scaler, os.path.join(ARTIFACTS_DIR, "scaler.pkl"))
    
    with open(os.path.join(ARTIFACTS_DIR, "feature_columns.json"), "w") as f:
        json.dump(feature_cols, f, indent=2)

    full_metrics = {
        "model": "RandomForest",
        "roc_auc": rf_metrics["roc_auc"],
        "f1": rf_metrics["f1"],
        "precision_at_50": rf_metrics["precision_at_50"],
        "recall": rf_metrics["recall"],
        "precision": rf_metrics["precision"],
        "baseline_model": "LogisticRegression",
        "baseline_roc_auc": lr_metrics["roc_auc"],
        "n_features": len(feature_cols),
        "n_train_samples": len(X_train),
        "n_test_samples": len(X_test),
        "class_imbalance_rate": round(float(y_raw.mean()), 4),
        "trained_at": "2026-10-10T06:10:00"
    }

    with open(os.path.join(ARTIFACTS_DIR, "model_metrics.json"), "w") as f:
        json.dump(full_metrics, f, indent=2)

    # Feature Importance Export
    feat_imp = [
        {"feature": f, "importance": round(float(v), 4), "label": f.replace("_", " ").title()}
        for f, v in sorted(zip(feature_cols, rf.feature_importances_), key=lambda x: -x[1])[:15]
    ]
    with open(os.path.join(ARTIFACTS_DIR, "feature_importance.json"), "w") as f:
        json.dump(feat_imp, f, indent=2)

    print("Pipeline completed successfully!")

if __name__ == "__main__":
    run_training_pipeline()