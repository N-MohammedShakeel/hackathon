"""
predict.py

Loads the trained model (and scaler, kept for parity with the training
pipeline) and generates attrition predictions for new, raw employee
records — i.e. records shaped like rows in the original CSV, before
any encoding or scaling.

Usage (as a library):

    from src.predict import load_artifacts, predict

    model, scaler, feature_columns = load_artifacts()
    result = predict(raw_employee_dict, model, feature_columns)

Usage (as a script):

    python -m src.predict --input sample_employee.json
"""

import argparse
import json
import os

import joblib
import pandas as pd

MODEL_PATH = os.path.join("models", "best_model.pkl")
SCALER_PATH = os.path.join("models", "scaler.pkl")

# Columns dropped during preprocessing (see src/preprocessing.py)
DROP_COLUMNS = ["EmployeeCount", "Over18", "StandardHours", "EmployeeNumber"]


def _find_file(filename):
    search_dirs = [
        os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"),
        os.path.join(os.path.dirname(__file__), "..", "artifacts"),
        os.path.join(os.path.dirname(__file__), "..", "..", "ms-workspace", "backend", "models"),
        os.path.join(os.getcwd(), "models"),
        os.path.join(os.getcwd(), "artifacts"),
        os.getcwd()
    ]
    for d in search_dirs:
        p = os.path.join(d, filename)
        if os.path.exists(p):
            return p
    return filename


def load_artifacts(model_path: str = None, scaler_path: str = None):
    """Load the trained model and scaler, and recover the exact
    feature column order the model was trained on."""
    m_path = model_path if (model_path and os.path.exists(model_path)) else _find_file("best_model.pkl")
    s_path = scaler_path if (scaler_path and os.path.exists(scaler_path)) else _find_file("scaler.pkl")

    model = joblib.load(m_path)
    scaler = joblib.load(s_path)

    feature_columns = list(model.feature_names_in_)

    return model, scaler, feature_columns


def _prepare_features(raw_df: pd.DataFrame, feature_columns: list) -> pd.DataFrame:
    """Replicate the encoding step from preprocessing.py on new data,
    then align columns to what the model expects."""

    df = raw_df.copy()

    df.drop(columns=[c for c in DROP_COLUMNS if c in df.columns], inplace=True)

    if "Attrition" in df.columns:
        df.drop(columns=["Attrition"], inplace=True)

    categorical = df.select_dtypes(include="object").columns
    df = pd.get_dummies(df, columns=categorical, drop_first=True)

    # Add any missing dummy columns as 0, drop unexpected ones, and
    # enforce the exact column order the model was trained on.
    df = df.reindex(columns=feature_columns, fill_value=0)

    return df


def predict(raw_record: dict, model=None, feature_columns=None) -> dict:
    """Predict attrition risk for a single raw employee record
    (a dict shaped like one row of the original CSV).

    Returns a dict with the predicted label, the probability of
    attrition, and a plain-English risk band.
    """

    if model is None or feature_columns is None:
        model, _, feature_columns = load_artifacts()

    raw_df = pd.DataFrame([raw_record])
    X = _prepare_features(raw_df, feature_columns)

    prediction = int(model.predict(X)[0])
    probability = float(model.predict_proba(X)[0, 1])

    if probability >= 0.7:
        risk = "High"
    elif probability >= 0.4:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "prediction": "Yes" if prediction == 1 else "No",
        "attrition_probability": round(probability, 4),
        "risk_band": risk,
    }


def predict_batch(raw_df: pd.DataFrame, model=None, feature_columns=None) -> pd.DataFrame:
    """Predict attrition risk for a DataFrame of raw employee records."""

    if model is None or feature_columns is None:
        model, _, feature_columns = load_artifacts()

    X = _prepare_features(raw_df, feature_columns)

    predictions = model.predict(X)
    probabilities = model.predict_proba(X)[:, 1]

    output = raw_df.copy()
    output["Attrition_Prediction"] = ["Yes" if p == 1 else "No" for p in predictions]
    output["Attrition_Probability"] = probabilities.round(4)

    return output


def main():
    parser = argparse.ArgumentParser(
        description="Predict employee attrition risk from a JSON or CSV file of raw records."
    )
    parser.add_argument(
        "--input", required=True, help="Path to a JSON file (single record or list) or CSV file."
    )
    args = parser.parse_args()

    model, _, feature_columns = load_artifacts()

    if args.input.lower().endswith(".csv"):
        raw_df = pd.read_csv(args.input)
        result = predict_batch(raw_df, model, feature_columns)
        print(result.to_string(index=False))
    else:
        with open(args.input) as f:
            data = json.load(f)

        records = data if isinstance(data, list) else [data]

        for record in records:
            result = predict(record, model, feature_columns)
            print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
