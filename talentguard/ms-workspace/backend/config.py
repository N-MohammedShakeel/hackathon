import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
MODEL_PATH = os.getenv("MODEL_PATH", "models/best_model.pkl")
SCALER_PATH = os.getenv("SCALER_PATH", "models/scaler.pkl")
FEATURE_COLUMNS_PATH = os.getenv("FEATURE_COLUMNS_PATH", "models/feature_columns.json")
MODEL_METRICS_PATH = os.getenv("MODEL_METRICS_PATH", "models/model_metrics.json")
FEATURE_IMPORTANCE_PATH = os.getenv("FEATURE_IMPORTANCE_PATH", "models/feature_importance.json")
WATCHLIST_PATH = os.getenv("WATCHLIST_PATH", "models/top50_watchlist.json")
