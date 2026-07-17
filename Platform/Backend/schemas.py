from pydantic import BaseModel
from datetime import datetime
from typing import List

# Registration Input
class PatientCreate(BaseModel):
    full_name: str
    phone_number: str

class PatientResponse(BaseModel):
    id: int
    full_name: str
    class Config:
        orm_mode = True

# Chat Webhook schemas (Frontend <-> FastAPI)
class WebChatInput(BaseModel):
    patient_id: int
    user_text: str

class WebChatResponse(BaseModel):
    ai_reply_text: str
    # Chatbot giving solutions vs direct text depending on context
    options: List[str] 
    requires_doctor: bool

# n8n Secure Strip Webhook schemas (FastAPI <-> n8n)
class SecureN8nPayload(BaseModel):
    session_id: int
    user_message: str
    detected_condition: str
    detected_feeling: str

class N8nLLMResponse(BaseModel):
    empathy_story_reply: str
    suggested_options: List[str]
    escalation_check_failed: bool
