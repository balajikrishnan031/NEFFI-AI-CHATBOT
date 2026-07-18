# Neffi Clinical Database Engine
# Install: pip install sqlalchemy

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

# ----------------------------------------------------------
# DATABASE MODELS
# ----------------------------------------------------------

class Patient(Base):
    """Core patient profile with live MHQ depression score"""
    __tablename__ = "patients"
    patient_id = Column(String, primary_key=True, index=True)
    name = Column(String, default="Anonymous")
    email = Column(String, default="")
    phone = Column(String, default="")
    age = Column(Integer, default=0)
    dob = Column(String, default="")
    gender = Column(String, default="")
    place = Column(String, default="")
    language = Column(String, default="English")
    focus_tags = Column(String, default="")  # comma-separated focus tags
    mhq_score = Column(Float, default=50.0)  # 0-100: lower = more depressed
    depression_level = Column(String, default="Moderate")  # Low / Moderate / High / Critical
    assigned_doctor = Column(String, default="Unassigned")
    mhq_trend = Column(String, default="Stable")
    attrition_probability = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    """Chat sessions for a patient"""
    __tablename__ = "chat_sessions"
    session_id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    title = Column(String, default="New Chat Session")
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    """Every chat message stored permanently with emotion + clinical state"""
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, index=True)
    session_id = Column(String, index=True, default="session-1")
    message = Column(Text)
    ai_reply = Column(Text)
    # BERT 6 basic emotions
    bert_emotion = Column(String)
    # Gemini 96 clinical states
    clinical_state = Column(String)
    clinical_category = Column(String)  # e.g. "Depression", "Attrition Risk", "Anxiety"
    # Live MHQ change per message
    mhq_before = Column(Float)
    mhq_after = Column(Float)
    mhq_delta = Column(Float)  # +ve = improving, -ve = worsening
    is_sos = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MoodCheckIn(Base):
    """Daily mood check-in from emoji selector"""
    __tablename__ = "mood_checkins"
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, index=True)
    emoji_score = Column(Integer)  # 1-5
    sentiment_label = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# ----------------------------------------------------------
# DATABASE SETUP
# ----------------------------------------------------------

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Let's use the exact absolute path to prevent CWD bugs
db_path = os.path.join(BASE_DIR, "neffi_clinical.db")
engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_or_create_patient(db, patient_id: str):
    """Get existing patient or create a new one with defaults"""
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        patient = Patient(patient_id=patient_id)
        db.add(patient)
        db.commit()
        db.refresh(patient)
    return patient

def calculate_mhq_delta(clinical_category: str, clinical_state: str) -> float:
    """
    Calculates how much to change the MHQ score based on the detected clinical state.
    Negative clinical states lower MHQ (worsen), positive states raise it.
    """
    WORSENING_STATES = {
        "Suicidal Ideation": -15,
        "Severe Depression": -10,
        "Hopelessness": -8,
        "Grief": -6,
        "Panic Attack": -6,
        "Trauma Response": -7,
        "Self-Harm Risk": -12,
        "Social Withdrawal": -4,
        "Anhedonia": -5,
        "Burnout": -4,
        "Anxiety": -3,
        "Loneliness": -3,
        "Attrition Risk": -4,
        "Helplessness": -5,
        "Frustration": -2,
        "Sadness": -2,
    }
    IMPROVING_STATES = {
        "Positive Reframing": +5,
        "Gratitude": +4,
        "Progress Acknowledgment": +4,
        "Motivation": +3,
        "Relief": +3,
        "Hope": +4,
        "Mindfulness": +3,
        "Social Connection": +3,
        "Self-Compassion": +3,
        "Resilience": +4,
    }
    for key, delta in WORSENING_STATES.items():
        if key.lower() in clinical_state.lower() or key.lower() in clinical_category.lower():
            return delta
    for key, delta in IMPROVING_STATES.items():
        if key.lower() in clinical_state.lower() or key.lower() in clinical_category.lower():
            return delta
    return -1.0  # default: slight worsening for any negative expression

def update_mhq_score(db, patient: Patient, delta: float) -> float:
    """Update patient MHQ score and depression level classification"""
    new_score = max(0.0, min(100.0, patient.mhq_score + delta))
    patient.mhq_score = new_score
    patient.last_active_at = datetime.utcnow()

    if new_score < 20:
        patient.depression_level = "Critical"
    elif new_score < 40:
        patient.depression_level = "High"
    elif new_score < 60:
        patient.depression_level = "Moderate"
    else:
        patient.depression_level = "Low"

    db.commit()
    db.refresh(patient)
    return new_score
