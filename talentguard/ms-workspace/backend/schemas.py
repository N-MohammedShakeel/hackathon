from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class RiskBand(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class EmployeeInput(BaseModel):
    Age: int = Field(..., ge=18, le=65, example=34)
    BusinessTravel: str = Field(..., example="Travel_Rarely")
    DailyRate: int = Field(..., ge=100, le=1500, example=800)
    Department: str = Field(..., example="Sales")
    DistanceFromHome: int = Field(..., ge=1, le=30, example=5)
    Education: int = Field(..., ge=1, le=5, example=3)
    EducationField: str = Field(..., example="Life Sciences")
    EnvironmentSatisfaction: int = Field(..., ge=1, le=4, example=3)
    Gender: str = Field(..., example="Male")
    HourlyRate: int = Field(..., ge=30, le=100, example=65)
    JobInvolvement: int = Field(..., ge=1, le=4, example=3)
    JobLevel: int = Field(..., ge=1, le=5, example=2)
    JobRole: str = Field(..., example="Sales Executive")
    JobSatisfaction: int = Field(..., ge=1, le=4, example=3)
    MaritalStatus: str = Field(..., example="Single")
    MonthlyIncome: int = Field(..., ge=1000, le=20000, example=5000)
    MonthlyRate: int = Field(..., ge=2000, le=27000, example=15000)
    NumCompaniesWorked: int = Field(..., ge=0, le=9, example=1)
    OverTime: str = Field(..., example="Yes")
    PercentSalaryHike: int = Field(..., ge=11, le=25, example=12)
    PerformanceRating: int = Field(..., ge=3, le=4, example=3)
    RelationshipSatisfaction: int = Field(..., ge=1, le=4, example=3)
    StockOptionLevel: int = Field(..., ge=0, le=3, example=0)
    TotalWorkingYears: int = Field(..., ge=0, le=40, example=8)
    TrainingTimesLastYear: int = Field(..., ge=0, le=6, example=2)
    WorkLifeBalance: int = Field(..., ge=1, le=4, example=3)
    YearsAtCompany: int = Field(..., ge=0, le=40, example=5)
    YearsInCurrentRole: int = Field(..., ge=0, le=18, example=3)
    YearsSinceLastPromotion: int = Field(..., ge=0, le=15, example=1)
    YearsWithCurrManager: int = Field(..., ge=0, le=17, example=2)


class ShapFactor(BaseModel):
    feature: str
    label: str
    direction: str
    impact: float


class RetentionAction(BaseModel):
    action: str
    priority: str
    rationale: str
    timeline: str
    owner: str


class PredictionResult(BaseModel):
    prediction: str
    attrition_probability: float
    risk_score_percent: int
    risk_band: RiskBand
    shap_explanation: List[ShapFactor]
    ai_recommendations: Optional[List[RetentionAction]] = None
    processing_time_ms: Optional[int] = None


class WhatIfRequest(BaseModel):
    base_employee: EmployeeInput
    overrides: dict


class WhatIfResult(BaseModel):
    original_probability: float
    new_probability: float
    delta: float
    risk_band: RiskBand
    improved: bool


class WatchListItem(BaseModel):
    rank: int
    employee_id: int
    attrition_probability: float
    risk_band: str
    department: str
    job_role: str
    monthly_income: int
    overtime: str
    years_at_company: int
    top_risk_factors: List[ShapFactor]
    retention_action: str


class DashboardOverview(BaseModel):
    total_employees: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    attrition_rate: float
    top_10_at_risk: List[WatchListItem]
    dept_breakdown: dict
    jobrole_breakdown: dict


class RetentionPlanRequest(BaseModel):
    employee_id: Optional[int] = None
    probability: float
    risk_band: str
    department: Optional[str] = None
    job_role: Optional[str] = None
    monthly_income: Optional[int] = None
    overtime: Optional[str] = None
    years_at_company: Optional[int] = None
    shap_factors: List[ShapFactor]


class RetentionPlan(BaseModel):
    employee_id: Optional[int]
    risk_summary: str
    actions: List[RetentionAction]
    email_draft: str
    email_status: str = "PENDING_APPROVAL"
