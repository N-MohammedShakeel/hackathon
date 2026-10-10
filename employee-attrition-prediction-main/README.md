# Employee Attrition Prediction

A machine learning pipeline that predicts whether an employee is likely to
leave a company, using IBM's HR Analytics Employee Attrition dataset. The
project covers exploratory data analysis, model training and tuning,
evaluation, feature importance, and per-employee explainability with SHAP.

## Overview

- **Task**: Binary classification — will an employee leave (`Attrition = Yes/No`)?
- **Data**: 1,470 employees, 35 features (demographics, compensation, job
  role, satisfaction scores, tenure, etc.), ~16% attrition rate (imbalanced).
- **Models compared**: Logistic Regression, Decision Tree, Random Forest,
  KNN, SVM — each hyperparameter-tuned with grid/randomized search.
- **Best model**: Random Forest (saved in `models/best_model.pkl`).
- **Explainability**: SHAP values used to explain individual predictions
  and generate plain-language HR recommendations.

## Repository Structure

```
hr-attrition-prediction/
├── data/
│   └── WA_Fn-UseC_-HR-Employee-Attrition.csv   # raw dataset
├── models/
│   ├── best_model.pkl                          # trained Random Forest
│   └── scaler.pkl                               # fitted StandardScaler
├── notebooks/
│   └── EDA.ipynb                                # exploratory data analysis
├── src/
│   ├── preprocessing.py     # cleaning, encoding, train/test split, scaling
│   ├── train.py              # trains baseline versions of all 5 models
│   ├── tune_models.py        # hyperparameter tuning for all 5 models
│   ├── evaluate.py           # accuracy / precision / recall / F1 / ROC-AUC
│   ├── feature_importance.py # plots top features from tree-based models
│   ├── explain_prediction.py # SHAP-based per-employee explanations
│   ├── predict.py            # inference on new, raw employee records
│   └── save_model.py         # persists the best model + scaler
├── main.py                   # end-to-end training pipeline entry point
├── requirements.txt
└── README.md
```

## Setup

```bash
git clone <your-repo-url>
cd hr-attrition-prediction
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

### Train the full pipeline from scratch

Runs preprocessing, hyperparameter tuning for all five models, evaluation,
feature importance, model saving, and a sample SHAP explanation.

```bash
python main.py
```

This regenerates `models/best_model.pkl` and `models/scaler.pkl`.

### Predict on new data

Using the already-trained model in `models/`:

```bash
# single record or list of records in a JSON file
python -m src.predict --input sample_employee.json

# or a CSV of raw employee rows
python -m src.predict --input new_employees.csv
```

Or from Python:

```python
from src.predict import load_artifacts, predict

model, scaler, feature_columns = load_artifacts()

employee = {
    "Age": 34, "BusinessTravel": "Travel_Rarely", "DailyRate": 1102,
    "Department": "Sales", "DistanceFromHome": 5, "Education": 3,
    "EducationField": "Marketing", "EnvironmentSatisfaction": 3,
    "Gender": "Male", "HourlyRate": 66, "JobInvolvement": 3, "JobLevel": 2,
    "JobRole": "Sales Executive", "JobSatisfaction": 4,
    "MaritalStatus": "Single", "MonthlyIncome": 5500, "MonthlyRate": 20000,
    "NumCompaniesWorked": 1, "OverTime": "Yes", "PercentSalaryHike": 12,
    "PerformanceRating": 3, "RelationshipSatisfaction": 3,
    "StockOptionLevel": 0, "TotalWorkingYears": 8,
    "TrainingTimesLastYear": 2, "WorkLifeBalance": 3, "YearsAtCompany": 5,
    "YearsInCurrentRole": 3, "YearsSinceLastPromotion": 1,
    "YearsWithCurrManager": 2,
}

result = predict(employee, model, feature_columns)
print(result)
# {'prediction': 'Yes', 'attrition_probability': 0.62, 'risk_band': 'Medium'}
```

### Explain a prediction (SHAP)

```python
from src.explain_prediction import PredictionExplainer
from src.predict import load_artifacts

model, _, feature_columns = load_artifacts()
explainer = PredictionExplainer(model)

explanation = explainer.explain(some_encoded_row_df)
recommendations = explainer.generate_recommendations(explanation)
```

### Explore the data

Open `notebooks/EDA.ipynb` for the full exploratory analysis — distributions,
correlations, and attrition patterns across departments, job roles, income,
and tenure.

## Model Evaluation

`main.py` prints a comparison table across Accuracy, Precision, Recall, F1,
and ROC-AUC for all five tuned models, sorted by ROC-AUC. The Random Forest
model was selected as the best performer and is the one persisted to
`models/best_model.pkl`.

## Tech Stack

- **Data / ML**: pandas, numpy, scikit-learn, joblib
- **Explainability**: SHAP
- **Visualization**: matplotlib, seaborn
- **App (optional)**: streamlit

## License

This project is provided as-is for educational and portfolio purposes. The
dataset is IBM's publicly available HR Analytics Employee Attrition dataset.
