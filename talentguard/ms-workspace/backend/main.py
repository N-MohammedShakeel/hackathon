from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS
from routers import predict, dashboard, model_info, agent, chat

app = FastAPI(
    title="TalentGuard HR Attrition & Retention Intelligence API",
    description="Maverick Mini Hackathon P1 Solution API featuring SHAP Explainability and Agentic Retention Coach",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during hackathon development / deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(predict.router)
app.include_router(dashboard.router)
app.include_router(model_info.router)
app.include_router(agent.router)
app.include_router(chat.router)

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "TalentGuard Backend",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
