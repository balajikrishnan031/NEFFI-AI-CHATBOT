import os
os.environ["HF_HUB_OFFLINE"] = "1"
import traceback
from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from sqlalchemy.orm import Session
from datetime import datetime
import requests

from clinical_db import get_db, get_or_create_patient, calculate_mhq_delta, update_mhq_score, Patient, ChatMessage, MoodCheckIn, ChatSession
from clinical_ai import analyze_clinical_state, analyze_intent
from memory_engine import memory_engine

from groq_engine import get_neffi_reply as get_groq_reply, evaluate_safety, NEFFI_SYSTEM_PROMPT
from chatgpt_engine import get_neffi_reply as get_chatgpt_reply

app = FastAPI(title="Neffi Clinical AI Brain")

# --- ROOT ENDPOINT TO FIX 404 LOGS ---
@app.get("/")
def root_status():
    return {"status": "Neffi Clinical AI Backend is Running 🚀", "version": "1.0"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------
# 1. BERT - Emotion Detector
# ----------------------------------------------------------
print("Loading BERT Emotion Model...")
emotion_classifier = pipeline(
    "text-classification",
    model="bhadresh-savani/bert-base-uncased-emotion",
    top_k=1,
    device="cpu"
)
print("BERT Ready!")

# ----------------------------------------------------------
# WEBHOOKS
# ----------------------------------------------------------
N8N_CHAT_WEBHOOK = "http://localhost:5678/webhook/neffi-chat"
N8N_ALERT_WEBHOOK = "http://localhost:5678/webhook/patient-alert"
N8N_APPOINTMENT_WEBHOOK = "http://localhost:5678/webhook/neffi-appointment"

class ChatRequest(BaseModel):
    patient_id: str
    message: str
    session_id: str
    emotional_context: str = ""  # Last emotional message for Story/Music/Joke context

class PatientLoginRequest(BaseModel):
    patient_id: str
    name: str
    phone: str = ""
    email: str = ""
    age: int = 0
    dob: str = ""
    gender: str = ""
    place: str = ""
    language: str = "English"
    focus_tags: list = []

class SessionUpsertRequest(BaseModel):
    session_id: str
    title: str

class AppointmentRequest(BaseModel):
    patient_id: str
    phone: str = ""
    email: str = ""
    name: str = ""

class MoodCheckInRequest(BaseModel):
    patient_id: str
    emoji_score: int
    sentiment_label: str

class AssignTherapistRequest(BaseModel):
    patient_id: str
    doctor_name: str

# ----------------------------------------------------------
# BACKGROUND: Send SOS Alert to n8n
# ----------------------------------------------------------
def trigger_sos_alert(patient_id: str, message: str, clinical_state: str):
    payload = {
        "patient_id": patient_id,
        "alert_type": "SOS_CRISIS",
        "clinical_state": clinical_state,
        "trigger_message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    # Local file fallback logging for medical auditing and fail-safety compliance
    try:
        log_path = os.path.join(os.path.dirname(__file__), "emergency_alerts.log")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"[{payload['timestamp']}] PATIENT: {patient_id} | STATE: {clinical_state} | MESSAGE: {message}\n")
        print(f"[EMERGENCY FALLBACK LOGGED] Patient: {patient_id}")
    except Exception as log_err:
        print(f"[EMERGENCY LOG WRITER FAILED] {log_err}")

    try:
        requests.post(N8N_ALERT_WEBHOOK, json=payload, timeout=5)
        print(f"[SOS ALERT SENT] Patient: {patient_id} | State: {clinical_state}")
    except Exception as e:
        print(f"[SOS ALERT FAILED] {e}")

# ----------------------------------------------------------
# PATIENT LOGIN & PROFILE PERSISTENCE
# ----------------------------------------------------------
@app.post("/api/patient/login")
async def patient_login(req: PatientLoginRequest, db: Session = Depends(get_db)):
    try:
        # Get or create patient profile
        patient = get_or_create_patient(db, req.patient_id)
        
        # Update full registration details
        patient.name = req.name
        patient.phone = req.phone
        patient.email = req.email
        patient.age = req.age
        patient.dob = req.dob
        patient.gender = req.gender
        patient.place = req.place
        patient.language = req.language
        
        # Store focus tags as comma-separated string
        patient.focus_tags = ",".join(req.focus_tags) if req.focus_tags else ""
        
        db.commit()
        db.refresh(patient)
        return {
            "status": "success",
            "patient_id": patient.patient_id,
            "name": patient.name
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------------------------------------
# CHAT SESSIONS PERSISTENCE
# ----------------------------------------------------------
@app.get("/api/patient/{patient_id}/sessions")
async def get_patient_sessions(patient_id: str, db: Session = Depends(get_db)):
    try:
        sessions = db.query(ChatSession).filter(ChatSession.patient_id == patient_id).order_by(ChatSession.created_at.desc()).all()
        result = []
        for s in sessions:
            # Query all messages in this session
            msgs = db.query(ChatMessage).filter(ChatMessage.session_id == s.session_id).order_by(ChatMessage.timestamp.asc()).all()
            messages_list = []
            for m in msgs:
                time_str = m.timestamp.strftime("%I:%M %p")
                messages_list.append({
                    "id": f"msg-u-{m.id}",
                    "sender": "user",
                    "text": m.message,
                    "time": time_str
                })
                messages_list.append({
                    "id": f"msg-n-{m.id}",
                    "sender": "neffi",
                    "text": m.ai_reply,
                    "time": time_str
                })
            
            # Format date representation e.g. "Jul 18"
            date_str = s.created_at.strftime("%b %d")
            result.append({
                "id": s.session_id,
                "title": s.title,
                "date": date_str,
                "messages": messages_list
            })
            
        return {"status": "success", "sessions": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patient/{patient_id}/session")
async def upsert_patient_session(patient_id: str, req: SessionUpsertRequest, db: Session = Depends(get_db)):
    try:
        session = db.query(ChatSession).filter(ChatSession.session_id == req.session_id).first()
        if not session:
            session = ChatSession(
                session_id=req.session_id,
                patient_id=patient_id,
                title=req.title
            )
            db.add(session)
        else:
            session.title = req.title
            
        db.commit()
        return {"status": "success", "session_id": req.session_id}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/patient/{patient_id}/session/{session_id}")
async def delete_patient_session(patient_id: str, session_id: str, db: Session = Depends(get_db)):
    try:
        # Delete messages in session
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        # Delete session itself
        db.query(ChatSession).filter(ChatSession.session_id == session_id).delete()
        db.commit()
        return {"status": "success", "message": "Session deleted successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------------------------------------
# MAIN CHAT ENDPOINT
# ----------------------------------------------------------
@app.post("/api/chat")
async def process_chat(req: ChatRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        # STEP 1: Get or create patient profile
        patient = get_or_create_patient(db, req.patient_id)
        
        user_text = req.message.lower().strip()
        
        # ── QA TEST OVERRIDE: CLEAR MEMORY ──────────────────────────────────────
        # Allows the tester to start a fresh chat without old context bleeding in
        if user_text in ["clear", "reset", "restart"]:
            db.query(ChatMessage).filter(ChatMessage.patient_id == req.patient_id).delete()
            db.commit()
            return {
                "reply": "🧠 Memory cleared successfully! We can start a fresh conversation now.",
                "options": [],
                "bert_emotion": "neutral",
                "clinical_state": "Neutral",
                "clinical_category": "General",
                "clinical_severity": 1,
                "clinical_insight": "Memory Reset",
                "mhq_before": patient.mhq_score,
                "mhq_after": patient.mhq_score,
                "mhq_delta": 0,
                "depression_level": patient.depression_level
            }

        greetings = ["hi", "hii", "hello", "hey", "good morning", "good evening", "hi neffi", "hello neffi"]
        is_greeting = user_text in greetings or len(user_text) < 4

        if is_greeting:
            clinical = {}
            user_intent = "GENERAL_CONVERSATION"
            bert_emotion = "neutral"
            clinical_state = "Neutral"
            clinical_category = "Positive State"
            clinical_severity = 1
            is_sos = False
            clinical_insight = "Greeting detected"
            mhq_before = patient.mhq_score
            mhq_delta = 0.0
            new_mhq = mhq_before
            requires_appointment = False
        else:
            # STEP 2: Intent Classification
            user_intent = analyze_intent(req.message)
            
            # STEP 3: BERT Emotion
            bert_result = emotion_classifier(req.message)
            if isinstance(bert_result[0], list):
                bert_emotion = bert_result[0][0]["label"]
            else:
                bert_emotion = bert_result[0]["label"]

            # STEP 4: Rule Based Router (Clinical AI)
            clinical = analyze_clinical_state(req.message, bert_emotion)
            clinical_state = clinical.get("state_name", "Unknown")
            clinical_category = clinical.get("category", "Unknown")
            clinical_severity = clinical.get("severity", 5)
            is_sos = clinical.get("is_sos", False)

            # STEP 5: Keyword Insight
            clinical_insight = clinical.get("clinical_insight", "")

            # STEP 6: MHQ Delta Calculation (Only for distress)
            mhq_before = patient.mhq_score
            if user_intent == "PERSONAL_DISTRESS":
                mhq_delta = calculate_mhq_delta(clinical_category, clinical_state)
                new_mhq = update_mhq_score(db, patient, mhq_delta)
            else:
                mhq_delta = 0.0
                new_mhq = mhq_before
                
            requires_appointment = is_sos or (user_intent == "PERSONAL_DISTRESS" and (clinical_severity >= 8 or new_mhq < 20))
        # NOTE: is_sos must ONLY come from the current message's router keywords.
        # MHQ score must NOT override is_sos to avoid false positives on non-crisis messages.

        # Memory recall
        past_context = memory_engine.recall_past_memory(req.patient_id, req.message)

        # 3. The Ultimate 11-Mode Rule Dictionary (Dynamic Rule Injection)
        dynamic_rules = {
            # --- CLINICAL MODES ---
            "CBT": (
                "Rule 1: Deep Validation: Empathize deeply with the user's exact problem, feeling their pain like a human friend.\n"
                "Rule 2: Psychological Explanation: Give a brief, literal psychological explanation of why their mind/body is reacting this way (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Deep Solution: Provide exactly ONE deeply detailed, tailored cognitive action. Start with a bullet point ( - ) focusing on a real-world grounding technique. No visualization exercises.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),
            "Double_Standard_CBT": (
                "Rule 1: Deep Validation: Empathize deeply with the user's exact problem, feeling their pain like a human friend.\n"
                "Rule 2: Psychological Explanation: Give a brief, literal psychological explanation of why we judge ourselves harsher than friends (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Deep Solution: Provide exactly ONE deeply detailed, tailored action. Start with a bullet point ( - ) focusing on a real-world grounding technique. No visualization exercises.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),
            "Somatic": (
                "Rule 1: Deep Validation: Empathize deeply with their physical symptoms (e.g., tightness, trembling), feeling their pain like a human friend.\n"
                "Rule 2: Psychological Explanation: Give a brief, literal psychological explanation of their body's nervous system reaction (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Deep Solution: Provide exactly ONE deeply detailed grounding exercise (like 5-4-3-2-1). Start with a bullet point ( - ) focusing on a real-world physical action. No visualization exercises.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),
            "DBT": (
                "Rule 1: Deep Validation: Empathize deeply with the intensity of their emotion without judging, feeling their pain like a human friend.\n"
                "Rule 2: Psychological Explanation: Give a brief, literal psychological explanation of their emotional flood (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Deep Solution: Provide exactly ONE deeply detailed physical distress tolerance skill (e.g., holding ice). Start with a bullet point ( - ) focusing on a real-world physical grounding technique. No visualization exercises.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),
            "ACT": (
                "Rule 1: Deep Validation: Empathize deeply with the reality of their unchangeable pain, feeling it like a human friend.\n"
                "Rule 2: Psychological Explanation: Give a brief, literal psychological explanation of why fighting reality causes more suffering (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Deep Solution: Provide exactly ONE deeply detailed perspective shift. Start with a bullet point ( - ) focusing on a real-world physical grounding technique. No visualization exercises.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),
            "Rogerian": (
                "Rule 1: Deep Validation: Empathize deeply with the feeling behind their exact words, like a close human friend listening.\n"
                "Rule 2: Psychological Explanation: Give a brief, literal psychological explanation of the emotional weight of their burden (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Deep Solution: Provide exactly ONE gentle, tailored question to help them reflect. Start with a bullet point ( - ) focusing on a grounded reflection. No visualization exercises.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),
            "CaCBT": (
                "Rule 1: Deep Validation: Empathize deeply with the cultural or family pressure they face, validating their heavy burden like a human friend.\n"
                "Rule 2: Psychological Explanation: Give a brief, literal psychological explanation of the stress of societal expectations (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Deep Solution: Provide exactly ONE deeply detailed, culturally-sensitive boundary shift. Start with a bullet point ( - ) focusing on a real-world physical grounding technique. No visualization exercises.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),

            # --- SOS MODE ---
            "Crisis_SOS": "CRITICAL RULE: STOP ALL THERAPY. DO NOT give exercises, metaphors, or stories. Only output deep empathy and IMMEDIATELY provide emergency helplines: 'Please call AASRA at 9820466726 or the National Emergency Number 104'.",

            # --- ENTERTAINMENT & GENERAL MODES (Situation-Specific) ---
            "Comfort_Storytelling": (
                "Rule 1: Deep Validation: Empathize warmly with their need for comfort or their emotional state, like a caring human friend.\n"
                "Rule 2: Therapeutic Metaphor (Cognitive Defusion): Tell EXACTLY ONE simple therapeutic metaphor (like 'leaves on a stream' or 'clouds passing') that perfectly matches their current feelings. STRICTLY limit yourself to ONE metaphor. Do NOT stack multiple poetic imagery. NEVER repeat a past metaphor.\n"
                "Rule 3: Deep Solution: Provide exactly ONE gentle reflection or cognitive reframing based on the metaphor. Start with a bullet point ( - ).\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            ),
            "Storytelling": (
                f"The user's message: '{req.message}'. "
                "If the user is asking to continue the story (e.g. they clicked 'Continue the story' or asked what happens next), seamlessly provide the DETAILED SECOND HALF and conclude it beautifully. For the option, output: |||OPTION||| That was a nice story ❤️\n"
                "Otherwise, tell ONLY THE DETAILED FIRST HALF of a highly unique, reality-based human story related to their situation. Stop at a cliffhanger or midway point. "
                "CRITICAL RULES: It MUST sound like a real story told by a close human friend. Make it detailed and immersive. "
                "If providing the first half, output EXACTLY: |||OPTION||| Continue the story 📖"
            ),
            "Humor": (
                f"The user's message: '{req.message}'. "
                "If the user is asking for the punchline (e.g. they clicked 'Tell me the punchline!' or asked for the punchline), reveal the punchline of the joke in a hilarious, laughing tone. For the option, output: |||OPTION||| Tell me another joke 😂\n"
                "If the user is responding to the joke setup (e.g. trying to guess it, laughing, or saying 'what?'), comment on their reaction and reveal the punchline in a funny, warm friend tone. For the option, output: |||OPTION||| Tell me another joke 😂\n"
                "Otherwise, tell ONLY the detailed setup of ONE completely fresh, natural, human-like joke. Do NOT output the punchline yet. "
                "CRITICAL RULES: DO NOT therapize the user. It MUST sound like two close friends joking naturally. "
                "For the option, output EXACTLY: |||OPTION||| Tell me the punchline! 😆"
            ),
            "Music": (
                f"The user's message: '{req.message}'. "
                "If the user has NOT specified a music genre/type (like lofi, classical, nature, ambient, piano), gently ask them what type of calming music they prefer right now. DO NOT trigger the player yet. For the option, output: |||OPTION||| Lofi or Nature sounds 🌿\n"
                "If the user HAS specified a genre or is answering your question about the genre, suggest EXACTLY ONE highly relaxing song matching their choice. "
                "CRITICAL RULES: The song MUST be deeply relaxing for the mind. ABSOLUTELY NO heavy bass sounds, no fast beats, no party songs. DO NOT therapize. "
                "Write the song name, composer, and 2 lines of the most comforting lyrics. Explain naturally like a friend why this specific calm song matches their feelings.\n"
                "ONLY IF YOU ARE SUGGESTING A SPECIFIC SONG, you MUST include this exact text on a new line at the very end: [TRIGGER_MUSIC_PLAYER]"
            ),
            "Puzzle": (
                f"The user's message: '{req.message}'. "
                "If the user is asking to show the solution/answer (e.g. they clicked 'Show me the solution' or asked to reveal it), reveal the detailed explanation and solution of the previous puzzle clearly. For the option, output: |||OPTION||| Give me another puzzle 🧩\n"
                "If the user is guessing the answer to the current riddle, evaluate their guess (tell them if they are correct, close, or incorrect) with a playful, friendly counselor tone. Encourage them to try again or ask for the solution. For the option, output: |||OPTION||| Show me the solution 🗝️\n"
                "Otherwise, present ONE highly unique, immersive riddle or puzzle. Do NOT explain or reveal the solution in this message. Keep it a mystery so they can think about it. "
                "CRITICAL RULES: DO NOT therapize the user. For the option, output EXACTLY: |||OPTION||| Show me the solution 🗝️"
            ),
            "Casual": "Give a warm, short, friendly greeting. Ask how their day is going. Keep it strictly under 3 sentences. DO NOT therapize.",
            "Factual": "Provide a direct, factual answer clearly and warmly. STRICTLY DO NOT therapize the user. DO NOT validate their feelings. DO NOT mention their emotional context. Just answer the question.",
            "Dynamic_Counselor": (
                "Rule 1: Deep Validation: Empathize deeply with the user's specific mental health struggle, feeling their pain like a human friend.\n"
                "Rule 2: Clinical Assessment & Explanation: In your reflection block, dynamically select the optimal clinical framework (CBT, DBT, ACT, somatic, Rogerian, etc.) suited for this specific mental health issue. In your main response, give a brief, literal explanation of the psychological pattern (strictly NO metaphors or analogies). NEVER repeat a past explanation.\n"
                "Rule 3: Tailored Grounding: Provide exactly ONE deeply detailed, custom action. Start with a bullet point ( - ) focusing on a real-world physical grounding or cognitive task. No abstract visualizations.\n"
                "Rule 4: Limit: Keep it to 2-3 natural human paragraphs."
            )
        }

        # 4. Map the router's clinical category to the predicted method
        predicted_method = "Rogerian"  # default
        suggested_options = []

        if is_greeting:
            predicted_method = "Casual"
            suggested_options = ["I need to vent", "Hear a joke 😄", "Give me a puzzle 🧩"]
        elif is_sos:
            predicted_method = "Crisis_SOS"
            suggested_options = []
        elif clinical_category == "General":
            predicted_method = "Factual"
            suggested_options = ["I need to vent", "Hear a joke 😄", "Give me a puzzle 🧩"]
        elif clinical_category == "Depression":
            predicted_method = "Dynamic_Counselor"
            suggested_options = ["Help me reframe this thought 💭", "Tell me a story 📖", "Play me a song 🎵"]
        elif clinical_category == "Anxiety":
            predicted_method = "Dynamic_Counselor"
            suggested_options = ["Guide me through grounding 🌿", "Play me a calming song 🎵", "Tell me a story 📖"]
        elif clinical_category == "Trauma & Stress":
            predicted_method = "Dynamic_Counselor"
            suggested_options = ["Give me a distress skill 🧊", "I need to vent this out", "Play me a calming song 🎵"]
        elif clinical_category in ["Interpersonal", "Attrition Risk"]:
            predicted_method = "Dynamic_Counselor"
            suggested_options = ["I want to share more", "Help me understand this feeling", "Tell me a story 📖"]
        elif clinical_category == "Physical-Mental":
            predicted_method = "Dynamic_Counselor"
            suggested_options = ["What small step can I take?", "I want to talk more", "Play me a song 🎵"]
        elif clinical_category == "Positive State":
            predicted_method = "Casual"
            suggested_options = ["Give me a puzzle 🧩", "Hear a joke 😄", "Tell me a story 📖"]

        # ── Per-State Options Override ─────────────────────────────────────────
        # Fine-grained options matched to the EXACT clinical state, not just category
        STATE_OPTIONS_MAP = {
            # DEPRESSION (1-20)
            1:  ["Help me reframe this thought 💭", "I want to share more", "Play me a song 🎵"],           # Major Depressive Episode
            2:  ["Help me reframe this thought 💭", "Tell me a story 📖", "Play me a song 🎵"],             # Persistent Depressive
            3:  ["Tell me a story 📖", "Help me reframe this thought 💭", "Play me a song 🎵"],             # Anhedonia
            4:  ["Help me find one small reason 💭", "Tell me a story 📖", "Play me a song 🎵"],            # Hopelessness
            5:  ["Play me a calming song 🎵", "What small step can I take?", "Tell me a story 📖"],         # Psychomotor Retardation
            6:  ["Play me a calming song 🎵", "Help me reframe this thought 💭", "Tell me a story 📖"],     # Cognitive Impairment
            7:  ["Guide me through grounding 🌿", "Play me a calming song 🎵", "Tell me a story 📖"],       # Somatic Depression
            8:  ["Help me reframe this thought 💭", "Tell me a story 📖", "Play me a song 🎵"],             # Atypical Depression
            9:  ["Play me a calming song 🎵", "Help me get through this morning 💭", "Tell me a story 📖"], # Melancholic
            10: ["Give me a distress skill 🧊", "I need to vent this out", "Play me a calming song 🎵"],    # Agitated Depression
            11: ["Play me a calming song 🎵", "Tell me a story 📖", "Help me reframe this thought 💭"],     # Seasonal
            12: ["I want to share more", "Help me understand this feeling", "Play me a calming song 🎵"],   # Postpartum
            13: ["I need someone to listen 🤝", "Tell me a story 📖", "Play me a calming song 🎵"],        # Grief-Related
            14: ["Help me find meaning 💭", "Tell me a story 📖", "What small step can I take?"],          # Existential Depression
            15: ["I want to share more", "Help me understand this feeling", "Tell me a story 📖"],          # Masked Depression
            16: ["Tell me a story 📖", "I want to share more", "Play me a song 🎵"],                       # Treatment-Resistant
            17: ["Help me be kinder to myself 💭", "Tell me a story 📖", "Play me a song 🎵"],             # Self-Loathing
            18: ["Play me a song 🎵", "Tell me a story 📖", "Guide me through grounding 🌿"],              # Emotional Numbness
            19: ["I need someone to listen 🤝", "I want to share more", "Play me a calming song 🎵"],      # Suicidal Passive

            # ANXIETY (21-35)
            21: ["Help me stop worrying 💭", "Guide me through grounding 🌿", "Play me a calming song 🎵"], # GAD
            22: ["Help me reframe this thought 💭", "Tell me a story 📖", "Play me a calming song 🎵"],     # Social Anxiety
            23: ["Guide me through grounding 🌿", "Help me calm my body 🌬️", "Play me a calming song 🎵"], # Panic Attack
            24: ["Help me reframe this thought 💭", "Play me a calming song 🎵", "Guide me through grounding 🌿"], # Anticipatory
            25: ["Help me reframe this thought 💭", "I want to share more", "Play me a calming song 🎵"],   # Health Anxiety
            26: ["I want to share more", "Help me understand this feeling", "Play me a calming song 🎵"],   # Separation Anxiety
            27: ["Help me reframe this thought 💭", "Play me a calming song 🎵", "Tell me a story 📖"],     # Performance Anxiety
            28: ["Guide me through grounding 🌿", "Play me a calming song 🎵", "I want to share more"],    # Agoraphobia
            29: ["Help me stop these thoughts 💭", "Guide me through grounding 🌿", "Play me a calming song 🎵"], # Intrusive Thoughts
            30: ["Help me stop overthinking 💭", "Tell me a story 📖", "Play me a calming song 🎵"],        # Rumination
            31: ["Guide me through grounding 🌿", "Play me a calming song 🎵", "I want to share more"],    # Hypervigilance
            32: ["Help me reframe this thought 💭", "Tell me a story 📖", "Play me a calming song 🎵"],     # Catastrophizing
            33: ["Tell me a story 📖", "Help me find meaning 💭", "Play me a calming song 🎵"],            # Existential Anxiety
            34: ["What small step can I take?", "I want to share more", "Tell me a story 📖"],             # Financial Anxiety
            35: ["I want to share more", "Help me understand this feeling", "Play me a calming song 🎵"],   # Relationship Anxiety

            # ATTRITION RISK (36-50)
            36: ["I want to share more", "Tell me a story 📖", "Help me understand this feeling"],          # Therapy Disengagement
            37: ["I want to share more", "Help me understand this feeling", "Tell me a story 📖"],          # Session Dropout
            38: ["What small step can I take?", "I want to share more", "Tell me a story 📖"],             # Low Motivation
            39: ["I want to share more", "Help me understand this feeling", "I need to vent this out"],     # Alliance Rupture
            40: ["What small step can I take?", "I want to share more", "Play me a calming song 🎵"],      # Skill Avoidance
            41: ["What small step can I take?", "I want to share more", "Tell me a story 📖"],             # Homework Non-Compliance
            42: ["I want to share more", "Help me understand this feeling", "Tell me a story 📖"],          # Ambivalence
            43: ["I want to share more", "Help me understand this feeling", "Play me a calming song 🎵"],   # Passive Resistance
            44: ["Play me a calming song 🎵", "Tell me a story 📖", "I want to share more"],              # Info Overload
            45: ["I want to share more", "Tell me a story 📖", "Give me a puzzle 🧩"],                    # Digital Burnout
            49: ["What small step can I take?", "I want to share more", "Tell me a story 📖"],             # Premature Termination

            # TRAUMA & STRESS (51-62)
            51: ["I need someone to listen 🤝", "Guide me through grounding 🌿", "Play me a calming song 🎵"], # Acute Stress
            52: ["Guide me through grounding 🌿", "I need someone to listen 🤝", "Play me a calming song 🎵"], # PTSD Flashback
            53: ["I need someone to listen 🤝", "Help me understand this feeling", "Play me a calming song 🎵"], # Complex Trauma
            54: ["Give me a distress skill 🧊", "I need to vent this out", "Play me a calming song 🎵"],    # Emotional Dysregulation
            55: ["Guide me through grounding 🌿", "I need someone to listen 🤝", "Play me a calming song 🎵"], # Dissociation
            56: ["I want to share more", "Help me be kinder to myself 💭", "Tell me a story 📖"],          # Shame
            57: ["I want to share more", "Help me reframe this thought 💭", "Tell me a story 📖"],          # Guilt
            58: ["Give me a distress skill 🧊", "I need to vent this out", "I want to share more"],        # Betrayal Trauma
            59: ["I need someone to listen 🤝", "Help me understand this feeling", "Tell me a story 📖"],  # Abandonment Fear
            60: ["Help me reframe this thought 💭", "I want to share more", "Tell me a story 📖"],         # Rejection Sensitivity
            61: ["Give me a distress skill 🧊", "Guide me through grounding 🌿", "Play me a calming song 🎵"], # Hyperarousal
            62: ["What small step can I take?", "I want to share more", "Tell me a story 📖"],             # Avoidance

            # INTERPERSONAL (63-74)
            63: ["I need someone to listen 🤝", "Tell me a story 📖", "Play me a song 🎵"],               # Loneliness
            64: ["I need someone to listen 🤝", "Help me understand this feeling", "Play me a calming song 🎵"], # Social Withdrawal
            65: ["Help me understand this feeling", "I want to share more", "Tell me a story 📖"],         # Conflict Avoidance
            66: ["Help me understand this feeling", "I want to share more", "Tell me a story 📖"],         # Codependency
            67: ["I need someone to listen 🤝", "Help me understand this feeling", "Play me a calming song 🎵"], # Attachment Anxiety
            68: ["Help me understand this feeling", "I want to share more", "Tell me a story 📖"],         # Attachment Avoidance
            69: ["Help me reframe this thought 💭", "I want to share more", "Tell me a story 📖"],         # Boundary Difficulties
            70: ["I want to share more", "Help me understand this feeling", "Tell me a story 📖"],         # Communication Breakdown
            71: ["I need someone to listen 🤝", "I need to vent this out", "Play me a calming song 🎵"],   # Family Stress
            72: ["I need to vent this out", "Help me reframe this thought 💭", "Tell me a story 📖"],      # Workplace Conflict
            73: ["I need someone to listen 🤝", "Help me understand this feeling", "Tell me a story 📖"],  # Romantic Distress
            74: ["I need someone to listen 🤝", "Tell me a story 📖", "Play me a calming song 🎵"],        # Grief and Loss

            # POSITIVE STATES (75-88)
            75: ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"],                          # Positive Reframing
            76: ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"],                          # Gratitude
            77: ["Give me a puzzle 🧩", "Hear a joke 😄", "Tell me a story 📖"],                          # Progress
            78: ["Give me a puzzle 🧩", "Tell me a story 📖", "Hear a joke 😄"],                          # Motivation
            79: ["Hear a joke 😄", "Give me a puzzle 🧩", "Tell me a story 📖"],                          # Relief
            80: ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"],                          # Hope
            81: ["Give me a puzzle 🧩", "Tell me a story 📖", "Hear a joke 😄"],                          # Mindfulness
            82: ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"],                          # Social Connection
            83: ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"],                          # Self-Compassion
            84: ["Hear a joke 😄", "Tell me a story 📖", "Give me a puzzle 🧩"],                          # Resilience
            85: ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"],                          # Acceptance
            86: ["Give me a puzzle 🧩", "Hear a joke 😄", "Tell me a story 📖"],                          # Empowerment
            87: ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"],                          # Insight
            88: ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"],                          # PTG

            # PHYSICAL-MENTAL (89-96)
            89: ["Play me a calming song 🎵", "What small step can I take?", "Tell me a story 📖"],        # Sleep Disturbance
            90: ["What small step can I take?", "Play me a calming song 🎵", "Tell me a story 📖"],        # Appetite Change
            91: ["Play me a calming song 🎵", "What small step can I take?", "Tell me a story 📖"],        # Fatigue/Burnout
            92: ["What small step can I take?", "Help me accept this 💭", "Tell me a story 📖"],           # Chronic Pain
            93: ["I need someone to listen 🤝", "What small step can I take?", "Play me a calming song 🎵"], # Substance Risk
            94: ["I need someone to listen 🤝", "Guide me through grounding 🌿", "Play me a calming song 🎵"], # Self-Harm Risk
            95: ["Guide me through grounding 🌿", "Play me a calming song 🎵", "I want to share more"],    # Psychosomatic
        }

        # Apply state-level override if the exact state has a custom options set
        state_num = clinical.get("state_number", 0)
        if state_num in STATE_OPTIONS_MAP and not is_sos:
            suggested_options = STATE_OPTIONS_MAP[state_num]

        # Get last message from DB for stateful context tracking
        last_msg = db.query(ChatMessage).filter(ChatMessage.patient_id == req.patient_id).order_by(ChatMessage.timestamp.desc()).first()

        # Stateful Entertainment Routing
        in_active_puzzle = last_msg and last_msg.ai_reply and "Show me the solution" in last_msg.ai_reply
        in_active_joke = last_msg and last_msg.ai_reply and "Tell me the punchline" in last_msg.ai_reply
        in_active_story = last_msg and last_msg.ai_reply and "Continue the story" in last_msg.ai_reply
        in_active_music = last_msg and last_msg.ai_reply and ("type of calming music" in last_msg.ai_reply.lower() or "music do you prefer" in last_msg.ai_reply.lower() or "music you prefer" in last_msg.ai_reply.lower())

        # Determine if the user is explicitly switching context
        is_context_switch = any(k in user_text for k in [
            "vent", "talk", "panic", "die", "kill myself", "suicide", "cut myself", "self-harm", 
            "help", "sad", "depressed", "anxious", "stress", "worried", "overthinking", "grounding", "distress skill"
        ])

        # Override for explicit entertainment requests
        msg_clean = req.message.strip()
        msg_lower = msg_clean.lower()

        # 1. Joke / Humor Override
        is_joke_request = any(k in msg_lower for k in [
            "tell me a joke", "give me a joke", "hear a joke", 
            "tell me another joke", "give me another joke", "another joke",
            "punchline", "tell me the punchline", "make me laugh", "something funny",
            "fun fact", "give me a fun fact"
        ]) or (
            "joke" in msg_lower and not any(ex in msg_lower for ex in ["life is a joke", "life's a joke", "not a joke", "no joke", "is this a joke", "bad joke"])
        )
        
        # 2. Music Override
        is_music_request = any(k in msg_lower for k in [
            "play me a song", "play a calming song", "suggest a song", "play a song", 
            "music", "melody", "lofi", "classical", "nature sounds", "ambient", "soundscape", "calming song", "another song"
        ])
        
        # 3. Puzzle Override
        is_puzzle_request = any(k in msg_lower for k in [
            "puzzle", "solution", "answer", "riddle", "solve a puzzle", 
            "give me a puzzle", "give me another puzzle", "another puzzle", 
            "show me the solution", "show me the answer", "previous puzzle", "previous riddle"
        ])
        
        # 4. Story Override
        is_story_request = any(k in msg_lower for k in [
            "tell me a story", "comforting story", "comfort me", "aaru-thal", 
            "continue the story", "another story", "tell me another story", "comforting story"
        ]) or (
            "story" in msg_lower and not any(ex in msg_lower for ex in ["long story", "end of the story", "true story"])
        )

        if not is_context_switch:
            if in_active_puzzle:
                predicted_method = "Puzzle"
                suggested_options = ["Give me another puzzle 🧩", "Tell me a story 📖", "I need to talk"]
            elif in_active_joke:
                predicted_method = "Humor"
                suggested_options = ["Tell me another joke 😄", "Tell me a story 📖", "I need to talk"]
            elif in_active_story:
                predicted_method = "Storytelling"
                suggested_options = ["Continue the story 📖", "Give me a joke 😄", "I need to talk"]
            elif in_active_music:
                predicted_method = "Music"
                suggested_options = ["Lofi or Nature sounds 🌿", "I want to talk more", "Give me a joke 😄"]

        if is_joke_request:
            predicted_method = "Humor"
            suggested_options = ["Tell me another joke 😄", "Tell me a story 📖", "I need to talk"]
        elif is_music_request:
            predicted_method = "Music"
            suggested_options = ["Lofi or Nature sounds 🌿", "I want to talk more", "Give me a joke 😄"]
        elif is_puzzle_request:
            predicted_method = "Puzzle"
            suggested_options = ["Give me another puzzle 🧩", "Tell me a story 📖", "I need to talk"]
        elif is_story_request:
            if any(k in msg_lower for k in ["comforting story", "comfort me", "aaru-thal"]):
                predicted_method = "Comfort_Storytelling"
                suggested_options = ["Tell me another story 📖", "Help me reframe this thought 💭", "Play me a song 🎵"]
            elif any(k in msg_lower for k in ["nice story", "good story", "loved the story", "liked the story", "thanks for the story", "thank you for the story"]):
                predicted_method = "Casual"
                suggested_options = ["Give me a puzzle 🧩", "Hear a joke 😄", "I need to talk"]
            else:
                predicted_method = "Storytelling"
                suggested_options = ["Continue the story 📖", "Give me a joke 😄", "I need to talk"]
        elif any(k in msg_clean.lower() for k in ["i don't understand", "confused", "don't know what to do", "can't decide", "puriyala", "theriyala", "kuzhappama", "confusion", "what should i do"]):
            predicted_method = "Comfort_Storytelling"
            suggested_options = ["Tell me another story 📖", "Help me reframe this thought 💭", "Play me a song 🎵"]
        elif any(k in msg_clean for k in ["I want to vent", "I need to vent", "I need to talk", "I want to talk more", "I want to share more"]):
            predicted_method = "Rogerian"
            suggested_options = ["Tell me more", "Play me a song 🎵", "Tell me a story 📖"]
        elif any(k in msg_clean for k in ["Help me reframe", "Help me reframe this thought", "Reframe this"]):
            predicted_method = "CBT"
            suggested_options = ["I feel a bit better", "Tell me a story 📖", "Play me a song 🎵"]
        elif any(k in msg_clean for k in ["Guide me through grounding", "Help me calm my body", "Ground me"]):
            predicted_method = "Somatic"
            suggested_options = ["I feel calmer now", "Play me a calming song 🎵", "Tell me a story 📖"]
        elif any(k in msg_clean for k in ["Give me a distress skill", "Distress skill"]):
            predicted_method = "DBT"
            suggested_options = ["Give me another skill", "I need to vent this out", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["What small step can I take", "Small step", "Help me take a step"]):
            predicted_method = "ACT"
            suggested_options = ["I want to talk more", "Tell me a story 📖", "Play me a song 🎵"]
        elif any(k in msg_clean for k in ["Help me understand this feeling", "Understand this feeling"]):
            predicted_method = "Rogerian"
            suggested_options = ["I want to share more", "Tell me a story 📖", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["I feel a bit better", "I feel calmer", "Feeling better", "I feel better"]):
            predicted_method = "Casual"
            suggested_options = ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"]
        elif any(k in msg_clean for k in ["Play me a calming song", "Calming song"]):
            predicted_method = "Music"
            suggested_options = ["Give me another song 🎵", "Tell me a story 📖", "I feel calmer now"]
        elif any(k in msg_clean for k in ["I need to vent this out", "I need to vent"]):
            predicted_method = "Rogerian"
            suggested_options = ["Tell me more", "Help me understand this feeling", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["I need someone to listen"]):
            predicted_method = "Rogerian"
            suggested_options = ["I want to share more", "Help me understand this feeling", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["Help me be kinder to myself"]):
            predicted_method = "Double_Standard_CBT"
            suggested_options = ["I feel a bit better", "Tell me a story 📖", "Play me a song 🎵"]
        elif any(k in msg_clean for k in ["Help me find meaning"]):
            predicted_method = "ACT"
            suggested_options = ["What small step can I take?", "Tell me a story 📖", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["Help me accept this"]):
            predicted_method = "ACT"
            suggested_options = ["What small step can I take?", "I want to share more", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["Help me stop worrying"]):
            predicted_method = "CBT"
            suggested_options = ["Guide me through grounding 🌿", "Play me a calming song 🎵", "Tell me a story 📖"]
        elif any(k in msg_clean for k in ["Help me stop overthinking", "Help me stop these thoughts"]):
            predicted_method = "CBT"
            suggested_options = ["Guide me through grounding 🌿", "I feel a bit better", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["Help me calm my body"]):
            predicted_method = "Somatic"
            suggested_options = ["I feel calmer now", "Play me a calming song 🎵", "Tell me a story 📖"]
        elif any(k in msg_clean for k in ["Help me get through this morning"]):
            predicted_method = "CBT"
            suggested_options = ["Help me reframe this thought 💭", "Play me a calming song 🎵", "Tell me a story 📖"]
        elif any(k in msg_clean for k in ["Help me find one small reason"]):
            predicted_method = "CBT"
            suggested_options = ["I feel a bit better", "Tell me a story 📖", "Play me a calming song 🎵"]
        elif any(k in msg_clean for k in ["Give me another skill"]):
            predicted_method = "DBT"
            suggested_options = ["I feel calmer now", "I want to share more", "Play me a calming song 🎵"]

        # ── Double Standard CBT Detection ─────────────────────────────────────
        # Detect when user gives good advice to friends but can't apply it to themselves
        msg_lower_ds = req.message.lower()
        DOUBLE_STANDARD_TRIGGERS = [
            # English patterns
            "i tell my friend", "i told my friend", "i give advice to", "i give my friend",
            "when my friend", "when i advise", "i advise my friend", "i can advise",
            "give advice but", "advice to others but", "tell others but",
            "help my friend but", "support my friend but", "comfort my friend but",
            "can't do it myself", "can't apply it", "cannot do it for myself",
            "easy to say to others", "easy to tell others",
            # Tanglish patterns
            "friend ku advice", "friend ku solluvean", "friend kashtam",
            "en friend ku", "naan solluven", "advice pannuven", "advice panren",
            "overcome panna mudila", "overcome pannala", "enakku vara",
            "enaku varumbodhu", "enaku vandha", "enaku same",
            "naan pannala", "naan pannave mudiyala", "naan overcome",
        ]
        if any(trigger in msg_lower_ds for trigger in DOUBLE_STANDARD_TRIGGERS) and not is_sos:
            predicted_method = "Double_Standard_CBT"
            suggested_options = ["I want to talk more", "Tell me a story 📖", "Play me a song 🎵"]

        # ── SOMATIC OVERRIDE (CRITICAL FIX) ───────────────────────────────────
        # If the user text contains panic keywords, ALWAYS prioritize physical calming first.
        somatic_keywords = ["heart is beating", "sick to my stomach", "can't breathe", "trembling", "panic", "shaking", "racing heart", "fast heart", "breathing heavily"]
        if any(keyword in msg_lower_ds for keyword in somatic_keywords) and not is_sos:
            predicted_method = "Somatic"
            suggested_options = ["Continue grounding exercise 🌿", "Tell me a story 📖", "Play me a calming song 🎵"]

        # Select the exact rule to inject into the LLM
        rule_to_send = dynamic_rules.get(predicted_method, dynamic_rules["Rogerian"])
        intervention_type = rule_to_send

        # Database log cleansing for casual & entertainment modes
        if predicted_method in ["Humor", "Puzzle", "Music", "Storytelling", "Comfort_Storytelling", "Casual", "Factual"]:
            clinical_state = "General Conversation"
            clinical_category = "General"
            clinical_severity = 1
            mhq_delta = 0.0
            new_mhq = mhq_before
            requires_appointment = False
            # Update the database model to revert any MHQ changes made earlier in the request
            patient.mhq_score = mhq_before
            db.commit()

        # STEP 7: Context String
        crisis_flag = ""
        if is_sos:
            crisis_flag = (
                "🚨 CRISIS_ALERT — MANDATORY PROTOCOL: "
                "The patient has expressed active self-harm or suicidal intent. "
                "DO NOT give lifestyle advice, metaphors, or techniques. "
                "You MUST output exactly this message: 'I hear how much pain you are in. Your life is valuable. Please call 9152987821 or 104 immediately for emergency support. We are here to help you stay safe.' "
                "Nothing else. No battery metaphors. No tips. Crisis protocol ONLY. | "
            )

        # If the user just clicked an option button (like "Help me reframe this"),
        # we need to ensure the LLM knows what they are referring to using the emotional_context.
        original_context_injection = ""
        if req.emotional_context and req.message != req.emotional_context:
            if predicted_method not in ["Humor", "Factual", "Puzzle", "Music", "Casual"]:
                original_context_injection = f"The user is requesting the REQUIRED INTERVENTION for their original situation: '{req.emotional_context}'. | "

        option_instruction = (
            "CRITICAL SYSTEM INSTRUCTION - DYNAMIC OPTION GENERATION: "
            "You MUST absolutely provide a single short phrase (under 8 words) at the very end of your response for a button that the user can click to continue with your specific exercise or solution. "
            "If you fail to include this, the system will crash. "
            "Format it EXACTLY like this on a new line: |||OPTION||| [Your specific option text here]. "
            "Example: |||OPTION||| Continue the breathing exercise | "
        )

        anti_repetition_rule = (
            "CRITICAL ANTI-ANCHORING RULE: DO NOT repeat metaphors or analogies you have already used in this conversation. "
            "Invent a completely new visual image or metaphor every single time to ensure the conversation feels fresh and progressive. | "
        )

        medical_rule = (
            "MEDICAL RULE: If the user asks for medical advice, pill recommendations, or diagnoses, "
            "explicitly state: 'I am an AI, not a doctor. I cannot prescribe medication or diagnose. Please consult a healthcare professional.' | "
        )

        context_str = (
            crisis_flag +
            f"[PAST CONTEXT: {past_context}] | "
            f"Clinical State: {clinical_state} | "
            f"Category: {clinical_category} | "
            f"Severity Level: {'High' if clinical_severity >= 8 else 'Medium' if clinical_severity >= 5 else 'Low'} | "
            f"BERT Emotion: {bert_emotion} | "
            f"MHQ Trend: {patient.mhq_trend} | "
            f"REQUIRED INTERVENTION: {intervention_type} | "
            f"Clinical Insight: {clinical_insight} | "
            f"{original_context_injection}"
            f"{medical_rule}"
            f"{anti_repetition_rule}"
            f"{option_instruction}"
            "⚠️ STRICT ISOLATION: The REQUIRED INTERVENTION above applies ONLY to the [CURRENT USER MESSAGE] below. "
            "Past context is background ONLY. Do NOT carry over any crisis or SOS behavior from past messages "
            "unless the current message itself explicitly triggers it. | "
            f"[CURRENT USER MESSAGE]: {req.message}"
        )

        print(f"\n--- NEFFI AI PROCESSING ({patient.name}) ---")
        print(f"Message: {req.message}")
        print(f"Context Sent to AI: {context_str}")
        
        # Memory Save
        memory_engine.save_to_memory(req.patient_id, req.message, bert_emotion)

        print(f"\n🔍 DIAGNOSTIC: is_sos={is_sos} | predicted_method={predicted_method} | category={clinical_category} | state={clinical_state}")
        print(f"🔍 DIAGNOSTIC: intervention_type starts with = {str(intervention_type)[:80]}")

        ai_reply = ""
        print("[LLM ROUTER] Using Groq as primary engine (Free Deployment Mode)...")
        try:
            ai_reply = get_groq_reply(req.message, context_str)
        except Exception as e:
            print(f"[LLM ROUTER] Groq failed. Error: {e}")

        if not ai_reply or "ERROR" in ai_reply:
            print("[LLM ROUTER] Groq failed. Trying ChatGPT fallback...")
            ai_reply = get_chatgpt_reply(req.message, context_str)

        if not ai_reply or "ERROR" in ai_reply:
            ai_reply = "[SYSTEM] All AI engines failed to respond. I am here for you, let's take a deep breath."

        # Strip background reflection tags before safety evaluation or options extraction
        import re
        ai_reply = re.sub(r"<reflection>.*?</reflection>", "", ai_reply, flags=re.DOTALL).strip()

        # Safety Check
        is_safe = evaluate_safety(ai_reply)
        if not is_safe:
            ai_reply = "I'm sorry, but I can't provide that specific kind of advice. If you're feeling overwhelmed, please reach out to a professional or helpline immediately."

        # Backend Post-Processing: Force strip all asterisks to prevent UI bleeding
        ai_reply = ai_reply.replace("**", "").replace("*", "")

        # HYBRID OPTION GENERATION (Method A + Method B)
        # Extract dynamic option from LLM if present
        if "|||OPTION|||" in ai_reply:
            parts = ai_reply.split("|||OPTION|||")
            ai_reply = parts[0].strip()
            dynamic_option_text = parts[1].strip()
            
            # Keep Method B as Option 1. Fallback to Method A's entertainment options for 2 & 3.
            fallback_entertainment = ["Hear a joke 😄", "Play me a song 🎵"]
            if len(suggested_options) >= 3:
                fallback_entertainment = [suggested_options[1], suggested_options[2]]
            
            # Ensure the dynamic option looks somewhat like a button if it's too long
            if len(dynamic_option_text) > 50:
                dynamic_option_text = dynamic_option_text[:47] + "..."
                
            suggested_options = [dynamic_option_text] + fallback_entertainment

        # Ensure session exists in the database
        session_exists = db.query(ChatSession).filter(ChatSession.session_id == req.session_id).first()
        if not session_exists:
            new_sess = ChatSession(
                session_id=req.session_id,
                patient_id=patient.patient_id,
                title=req.message[:26] + ("..." if len(req.message) > 26 else "")
            )
            db.add(new_sess)
            db.commit()

        # DB Save
        chat_msg = ChatMessage(
            patient_id=patient.patient_id,
            session_id=req.session_id,
            message=req.message,
            ai_reply=ai_reply,
            bert_emotion=bert_emotion,
            clinical_state=clinical_state,
            clinical_category=clinical_category,
            mhq_before=mhq_before,
            mhq_after=new_mhq,
            mhq_delta=mhq_delta,
            is_sos=is_sos
        )
        db.add(chat_msg)
        db.commit()

        if is_sos:
            background_tasks.add_task(trigger_sos_alert, req.patient_id, req.message, clinical_state)

        return {
            "reply": ai_reply,
            "options": suggested_options,
            "bert_emotion": bert_emotion,
            "clinical_state": clinical_state,
            "clinical_category": clinical_category,
            "clinical_severity": clinical_severity,
            "clinical_insight": clinical_insight,
            "mhq_before": mhq_before,
            "mhq_after": new_mhq,
            "mhq_delta": mhq_delta,
            "depression_level": patient.depression_level,
            "is_sos": is_sos,
            "sos_hotline": "9152987821" if is_sos else None,
            "requires_appointment": requires_appointment
        }
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise e

# ----------------------------------------------------------
# APPOINTMENT BOOKING AUTOMATION
# ----------------------------------------------------------
@app.post("/api/book_appointment")
async def book_appointment(req: AppointmentRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()
    
    payload = {
        "patient_id": req.patient_id,
        "name": req.name or (patient.name if patient else "Patient"),
        "phone": req.phone or req.patient_id,
        "email": req.email or "",
        "booking_source": "Neffi_App"
    }
    
    try:
        response = requests.post(N8N_APPOINTMENT_WEBHOOK, json=payload, timeout=10)
        if response.status_code == 200:
            return {"status": "success", "message": "Appointment request sent to n8n successfully!"}
        else:
            return {"status": "error", "message": f"n8n returned status {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ----------------------------------------------------------
# ADMIN API ENDPOINTS
# ----------------------------------------------------------

def _get_risk(mhq: float, is_sos: bool) -> tuple:
    """Convert MHQ score to risk label and color."""
    if is_sos or mhq < 20:
        return "Critical", "text-red-600"
    elif mhq < 40:
        return "High", "text-orange-500"
    elif mhq < 60:
        return "Medium", "text-yellow-500"
    else:
        return "Low", "text-green-600"

@app.get("/api/admin/patients")
async def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    roster = []
    for p in patients:
        last_log = db.query(ChatMessage).filter(ChatMessage.patient_id == p.patient_id).order_by(ChatMessage.timestamp.desc()).first()
        recent_msgs = db.query(ChatMessage).filter(ChatMessage.patient_id == p.patient_id).order_by(ChatMessage.timestamp.desc()).limit(5).all()
        recent_msgs.reverse()
        logs_list = [m.message for m in recent_msgs] if recent_msgs else ["No recent logs"]

        msg_count = db.query(ChatMessage).filter(ChatMessage.patient_id == p.patient_id).count()
        sos_count = db.query(ChatMessage).filter(ChatMessage.patient_id == p.patient_id, ChatMessage.is_sos == True).count()
        category = last_log.clinical_category if last_log else "General"
        last_seen = str(last_log.timestamp)[:16] if last_log else "Never"
        emotion = last_log.bert_emotion if last_log else "neutral"
        last_message = last_log.message[:80] + "..." if last_log and len(last_log.message) > 80 else (last_log.message if last_log else "No messages yet")
        risk, color = _get_risk(p.mhq_score or 70, sos_count > 0)

        roster.append({
            "id": p.patient_id,
            "name": p.name or "Anonymous",
            "mhq": round(p.mhq_score or 70, 1),
            "score": round(p.mhq_score or 70, 1),
            "trend": p.mhq_trend or "Stable",
            "depression_level": p.depression_level or "Minimal",
            "attrition": round(p.attrition_probability or 0, 1),
            "category": category,
            "condition": category,
            "risk": risk,
            "color": color,
            "last_seen": last_seen,
            "emotion": emotion,
            "msg_count": msg_count,
            "sos_count": sos_count,
            "last_message": last_message,
            "assigned_doctor": getattr(p, "assigned_doctor", "Unassigned") or "Unassigned",
            "recent_logs": logs_list,
            "logs": logs_list
        })
    return {"patients": roster}

@app.get("/api/admin/inactive-patients")
async def get_inactive_patients(db: Session = Depends(get_db)):
    """Patients who haven't sent a message in the last 7 days."""
    from datetime import timedelta, datetime
    cutoff = datetime.utcnow() - timedelta(days=7)
    patients = db.query(Patient).all()
    inactive = []
    for p in patients:
        last_log = db.query(ChatMessage).filter(ChatMessage.patient_id == p.patient_id).order_by(ChatMessage.timestamp.desc()).first()
        if not last_log or last_log.timestamp < cutoff:
            last_seen = str(last_log.timestamp)[:16] if last_log else "Never"
            inactive.append({
                "id": p.patient_id,
                "name": p.name or "Anonymous",
                "last_seen": last_seen,
                "mhq": round(p.mhq_score or 70, 1),
                "depression_level": p.depression_level or "Minimal"
            })
    return {"patients": inactive}

@app.get("/api/admin/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    """Real-time aggregated clinical statistics."""
    total_patients = db.query(Patient).count()
    total_messages = db.query(ChatMessage).count()
    sos_events = db.query(ChatMessage).filter(ChatMessage.is_sos == True).count()

    # MHQ distribution
    patients = db.query(Patient).all()
    mhq_scores = [p.mhq_score or 70 for p in patients]
    avg_mhq = round(sum(mhq_scores) / len(mhq_scores), 1) if mhq_scores else 70

    critical_count = sum(1 for s in mhq_scores if s < 20)
    high_count = sum(1 for s in mhq_scores if 20 <= s < 40)
    medium_count = sum(1 for s in mhq_scores if 40 <= s < 60)
    low_count = sum(1 for s in mhq_scores if s >= 60)

    # Category distribution from last messages
    category_counts = {}
    for p in patients:
        last_log = db.query(ChatMessage).filter(ChatMessage.patient_id == p.patient_id).order_by(ChatMessage.timestamp.desc()).first()
        if last_log:
            cat = last_log.clinical_category or "General"
            category_counts[cat] = category_counts.get(cat, 0) + 1

    return {
        "total_patients": total_patients,
        "total_messages": total_messages,
        "sos_events": sos_events,
        "avg_mhq": avg_mhq,
        "risk_distribution": {
            "Critical": critical_count,
            "High": high_count,
            "Medium": medium_count,
            "Low": low_count
        },
        "category_distribution": category_counts
    }

@app.get("/api/admin/patients/{patient_id}/chat")
async def get_patient_chat(patient_id: str, db: Session = Depends(get_db)):
    chats = db.query(ChatMessage).filter(ChatMessage.patient_id == patient_id).order_by(ChatMessage.timestamp.asc()).all()
    history = []
    for c in chats:
        history.append({"sender": "User", "message": c.message, "timestamp": str(c.timestamp)[:16], "emotion": c.bert_emotion})
        history.append({"sender": "Neffi", "message": c.ai_reply, "timestamp": str(c.timestamp)[:16], "clinical_state": c.clinical_state})
    return {"history": history}

# ----------------------------------------------------------
# MISSING FRONTEND-SUPPORT ENDPOINTS
# ----------------------------------------------------------

@app.post("/api/patient/check-in")
async def mood_check_in(req: MoodCheckInRequest, db: Session = Depends(get_db)):
    try:
        # Log mood checkin
        checkin = MoodCheckIn(
            patient_id=req.patient_id,
            emoji_score=req.emoji_score,
            sentiment_label=req.sentiment_label
        )
        db.add(checkin)
        db.commit()

        # Adjust MHQ slightly based on mood
        delta = 0.0
        if req.emoji_score == 5:
            delta = 2.0
        elif req.emoji_score == 4:
            delta = 1.0
        elif req.emoji_score == 2:
            delta = -1.0
        elif req.emoji_score == 1:
            delta = -2.0

        patient = get_or_create_patient(db, req.patient_id)
        update_mhq_score(db, patient, delta)

        return {"status": "success", "message": "Mood checked in successfully", "new_mhq": patient.mhq_score}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/assign-therapist")
async def assign_therapist(req: AssignTherapistRequest, db: Session = Depends(get_db)):
    try:
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_id).first()
        if not patient:
            patient = Patient(patient_id=req.patient_id)
            db.add(patient)
        patient.assigned_doctor = req.doctor_name
        db.commit()
        db.refresh(patient)
        return {"status": "success", "message": f"Successfully assigned {req.doctor_name} to {req.patient_id}"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/patient/{patient_id}/report")
async def get_patient_report(patient_id: str, db: Session = Depends(get_db)):
    try:
        patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        messages = db.query(ChatMessage).filter(ChatMessage.patient_id == patient_id).order_by(ChatMessage.timestamp.asc()).all()

        emotions = set()
        clinical_states = set()
        clinical_categories = set()
        for m in messages:
            if m.bert_emotion:
                emotions.add(m.bert_emotion)
            if m.clinical_state:
                clinical_states.add(m.clinical_state)
            if m.clinical_category:
                clinical_categories.add(m.clinical_category)

        emotions_str = ", ".join(emotions) if emotions else "None detected"
        states_str = ", ".join(clinical_states) if clinical_states else "None detected"
        categories_str = ", ".join(clinical_categories) if clinical_categories else "None detected"

        total_msgs = len(messages)
        if total_msgs == 0:
            abstract = "No chat transcripts available yet. The patient has registered but has not interacted with Neffi Clinical AI."
        else:
            abstract = (
                f"Patient has engaged in {total_msgs} exchanges with Neffi Clinical AI.\n"
                f"Primary clinical categories flagged: {categories_str}.\n"
                f"Specific clinical states detected: {states_str}.\n"
                f"Prevalent emotional states: {emotions_str}.\n\n"
                f"Clinical Summary and Progression Analysis:\n"
                f"Key Interactions:\n"
            )
            for m in messages[-5:]:
                abstract += f"- [{m.timestamp.strftime('%Y-%m-%d %H:%M') if m.timestamp else 'N/A'}] ({m.clinical_category or 'General'}): \"{m.message[:60]}...\" -> Response: {m.clinical_state or 'neutral'}\n"

        return {
            "name": patient.name or "Anonymous",
            "patient_id": patient.patient_id,
            "current_mhq": round(patient.mhq_score or 70.0, 1),
            "depression_level": patient.depression_level or "Moderate",
            "assigned_doctor": patient.assigned_doctor or "Unassigned",
            "clinical_abstract": abstract
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting Neffi Backend Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
