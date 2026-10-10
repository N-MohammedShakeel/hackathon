"""
Evaluation module for TalentGuard HR Attrition Models.
Focuses on capacity-tied operating point (Precision@50) and ROC-AUC / F1,
explicitly avoiding the "Accuracy Trap" (all-No accuracy baseline = 84%).
"""

import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score, classification_report

def evaluate_model(model, X_test, y_test, is_scaled=False, scaler=None):
    if is_scaled and scaler is not None:
        X_eval = scaler.transform(X_test)
    else:
        X_eval = X_test

    y_prob = model.predict_proba(X_eval)[:, 1]
    y_pred = model.predict(X_eval)

    roc_auc = roc_auc_score(y_test, y_prob)
    f1 = f1_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)

    # Precision at Top-50 cutoff (capacity tied for HR)
    top50_indices = np.argsort(y_prob)[::-1][:min(50, len(y_prob))]
    prec_at_50 = float(y_test.iloc[top50_indices].mean())

    metrics = {
        "roc_auc": round(float(roc_auc), 4),
        "f1": round(float(f1), 4),
        "precision_at_50": round(float(prec_at_50), 4),
        "recall": round(float(rec), 4),
        "precision": round(float(prec), 4),
    }

    return metrics, y_prob, y_pred