import time
from fastapi import APIRouter, HTTPException
from schemas import EmployeeInput, PredictionResult, WhatIfRequest, WhatIfResult
from services.prediction_service import prediction_engine

router = APIRouter(prefix="/api/v1/predict", tags=["Predictions"])

@router.post("/single", response_model=PredictionResult)
def predict_single(input_data: EmployeeInput):
    t0 = time.time()
    try:
        res = prediction_engine.predict_single(input_data.model_dump())
        res["processing_time_ms"] = int((time.time() - t0) * 1000)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/whatif", response_model=WhatIfResult)
def predict_whatif(req: WhatIfRequest):
    try:
        res = prediction_engine.predict_whatif(req.base_employee.model_dump(), req.overrides)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
