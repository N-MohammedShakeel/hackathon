from fastapi import APIRouter
from schemas import DashboardOverview
from services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverview)
def get_overview():
    return dashboard_service.get_overview()

@router.get("/watchlist")
def get_watchlist():
    return dashboard_service.get_watchlist()
