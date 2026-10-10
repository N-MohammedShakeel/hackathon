import joblib


def save_model(model, scaler):

    joblib.dump(
        model,
        "models/best_model.pkl"
    )

    joblib.dump(
        scaler,
        "models/scaler.pkl"
    )

    print("Model saved successfully.")


    