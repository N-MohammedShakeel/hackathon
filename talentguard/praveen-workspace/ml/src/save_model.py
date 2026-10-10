import os
import joblib


def save_model(model, scaler, output_dir=None):
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")
    os.makedirs(output_dir, exist_ok=True)

    joblib.dump(model, os.path.join(output_dir, "best_model.pkl"))
    joblib.dump(scaler, os.path.join(output_dir, "scaler.pkl"))

    print(f"Model and scaler saved successfully to {output_dir}.")


    