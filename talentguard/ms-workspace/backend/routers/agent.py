from fastapi import APIRouter, HTTPException
from schemas import RetentionPlanRequest, RetentionPlan
from services.agent_service import agent_service

router = APIRouter(prefix="/api/v1/agent", tags=["AI Agent"])

@router.post("/retention-plan", response_model=RetentionPlan)
def generate_retention_plan(req: RetentionPlanRequest):
    try:
        return agent_service.generate_retention_plan(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
