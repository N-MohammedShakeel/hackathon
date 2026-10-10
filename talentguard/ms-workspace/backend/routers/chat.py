from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from services.chat_service import chat_service

router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []

class KeyConfig(BaseModel):
    api_key: str

@router.get("/status")
def get_chat_status():
    return chat_service.get_status()

@router.post("/set-key")
def set_gemini_key(cfg: KeyConfig):
    return chat_service.set_api_key(cfg.api_key)

@router.post("/message")
async def send_message(req: ChatMessage):
    response = chat_service.respond(req.message, req.conversation_history or [])
    return {"reply": response}
