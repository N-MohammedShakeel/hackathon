from src.preprocessing import preprocess_data
from src.feature_importance import plot_feature_importance

from src.tune_models import (
    tune_logistic,
    tune_decision_tree,
    tune_random_forest,
    tune_knn,
    tune_svm
)

from src.evaluate import evaluate_model, results

import pandas as pd

# ==========================
# Load and preprocess data
# ==========================

(
    X_train,
    X_test,
    X_train_scaled,
    X_test_scaled,
    y_train,
    y_test,
    scaler
) = preprocess_data("data/WA_Fn-UseC_-HR-Employee-Attrition.csv")

# ==========================
# Hyperparameter tuning
# ==========================

best_lr = tune_logistic(X_train_scaled, y_train)

best_dt = tune_decision_tree(X_train, y_train)

best_rf = tune_random_forest(X_train, y_train)

best_knn = tune_knn(X_train_scaled, y_train)

best_svm = tune_svm(X_train_scaled, y_train)

# ==========================
# Evaluate models
# ==========================

evaluate_model(
    "Logistic Regression",
    best_lr,
    X_test_scaled,
    y_test
)

evaluate_model(
    "Decision Tree",
    best_dt,
    X_test,
    y_test
)

evaluate_model(
    "Random Forest",
    best_rf,
    X_test,
    y_test
)

evaluate_model(
    "KNN",
    best_knn,
    X_test_scaled,
    y_test
)

evaluate_model(
    "SVM",
    best_svm,
    X_test_scaled,
    y_test
)

# ==========================
# Model Comparison
# ==========================

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="ROC_AUC",
    ascending=False
)

print("\nModel Comparison")
print(results_df)

# ==========================
# Important Features
# ==========================

plot_feature_importance(
    best_rf,
    X_train.columns
)

# ==========================
# save the best model and scaler
# ==========================

from src.save_model import save_model

save_model(
    best_rf,
    scaler
)

# ==========================
# explain a prediction
# ==========================


from src.explain_prediction import PredictionExplainer

explainer = PredictionExplainer(best_rf)

sample = X_test.iloc[[0]]
explanation = explainer.explain(sample)

print(explanation.head(10))