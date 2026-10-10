from fastapi import APIRouter
from services.prediction_service import prediction_engine

router = APIRouter(prefix="/api/v1/model", tags=["Model Info"])

@router.get("/metrics")
def get_metrics():
    return prediction_engine.metrics

@router.get("/feature-importance")
def get_feature_importance():
    return prediction_engine.feature_importance
