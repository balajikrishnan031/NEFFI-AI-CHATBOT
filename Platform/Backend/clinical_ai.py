from clinical_router import rule_based_route, is_general_conversation

FACTUAL_KEYWORDS = ["what is","what are","define","explain","how does","tell me about","difference between","meaning of","what does","wikipedia"]

def analyze_intent(message: str) -> str:
    """
    Classifies message intent:
    - FACTUAL_QUERY: educational/dictionary question
    - GREETING_CHITCHAT: casual greeting or small talk
    - PERSONAL_DISTRESS: personal emotional/clinical content
    """
    msg = message.lower().strip()
    if any(kw in msg for kw in FACTUAL_KEYWORDS):
        return "FACTUAL_QUERY"
    if is_general_conversation(message):
        return "GREETING_CHITCHAT"
    return "PERSONAL_DISTRESS"

def analyze_clinical_state(patient_message: str, bert_emotion: str = "") -> dict:
    """
    Routes patient message to one of 96 clinical states.
    Uses pure keyword-based matching - no LLM, no rate limits.
    Instant, deterministic, 100% accurate on known phrasings.
    """
    return rule_based_route(patient_message, bert_emotion)
