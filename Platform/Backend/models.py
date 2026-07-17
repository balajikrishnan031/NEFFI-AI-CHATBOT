from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    medical_history = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship hooks
    chats = relationship("ChatHistory", back_populates="patient")
    clinical_states = relationship("ClinicalState", back_populates="patient")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    
    sender = Column(String) # 'User' or 'AI'
    message_text = Column(Text)
    
    # Track the empathetic story told by Claude (if sender is AI)
    ai_story_context = Column(Text, nullable=True)
    # Track options presented to the user (if sender is AI)
    presented_options = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="chats")

class ClinicalState(Base):
    """
    Patient tracking table strictly for the 96 depression/attrition classifications mapping.
    """
    __tablename__ = "clinical_states"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    chat_id = Column(Integer, ForeignKey("chat_history.id"), nullable=True)
    
    # 96 feeling categorizations (e.g., 'Smiling Depression', 'Treatment-Resistant')
    detected_condition = Column(String) 
    
    # The NLP extracted exact subjective emotion ("feeling hollow, tired")
    current_feeling = Column(Text) 
    
    # Attrition Risk level (High/Medium/Low)
    attrition_risk = Column(String)
    
    # Doctor alert marker based on severity
    requires_doctor_escalation = Column(Boolean, default=False)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="clinical_states")
