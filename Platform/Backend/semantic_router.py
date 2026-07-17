import json
import numpy as np
from memory_engine import memory_engine
from groq_engine import GROQ_API_KEY, GROQ_URL
import requests

# Define the conversational goals and their semantic clusters
GOAL_CLUSTERS = {
    "Venting": [
        "i just need to let this out",
        "i am so frustrated right now",
        "i want to rant about my day",
        "everything is going wrong and i hate it",
        "i'm so annoyed",
        "i need to vent",
        "romba kaduppa irukku"
    ],
    "Advice/Solution": [
        "what should i do?",
        "how do i fix this?",
        "give me a solution",
        "i need help figuring this out",
        "can you give me advice on this?"
    ],
    "Validation": [
        "am i wrong for feeling this way?",
        "does this make sense?",
        "i feel like no one understands me",
        "i just want to know my feelings are valid",
        "is it normal to feel like this?"
    ],
    "Loneliness/Connection": [
        "i feel so alone",
        "no one is here for me",
        "i just want someone to talk to",
        "i feel isolated",
        "thaniya iruken"
    ],
    "Humor Masking": [
        "life eh comedy piece 😂",
        "seri vidu da 😂 yarukkum naan mukkiyam illa",
        "my life is a joke lol",
        "everything is falling apart but it's funny tbh"
    ],
    "Distraction/Humor": [
        "tell me a joke",
        "i need a distraction",
        "give me a puzzle",
        "make me laugh",
        "play a song"
    ],
    "Passive Distress": [
        "i can't take this anymore",
        "i feel so empty",
        "i am so burnt out",
        "i'm exhausted of trying",
        "nothing feels real anymore"
    ],
    "Factual": [
        "what is depression?",
        "how does cbt work?",
        "what are the symptoms of anxiety?",
        "define ptsd"
    ],
    "Active SOS": [
        "i want to die",
        "i'm going to end it",
        "i feel like killing myself",
        "blade in my hand",
        "suicide"
    ]
}

# Pre-compute cluster embeddings on startup
print("Pre-computing semantic clusters for Semantic Router V2...")
CLUSTER_EMBEDDINGS = {}
for goal, sentences in GOAL_CLUSTERS.items():
    embeddings = memory_engine.encoder.encode(sentences)
    cluster_center = np.mean(embeddings, axis=0)
    cluster_center = cluster_center / np.linalg.norm(cluster_center)
    CLUSTER_EMBEDDINGS[goal] = cluster_center
print("Semantic Router V2 Ready!")

# Tanglish to English Emotional Normalization Dictionary
TANGLISH_DICT = {
    "set aagala": "emotionally disturbed",
    "empty ahh": "emotionally numb",
    "kaduppa irukku": "frustrated",
    "manda kulambuthu": "mentally overwhelmed",
    "onnume puriyala": "confused distressed",
    "seri vidu": "giving up resigned",
    "tired ahh": "mentally exhausted",
    "off ahh": "emotionally numb",
    "veruppa": "hating everything",
    "valikithu": "hurting",
    "kastama": "sad struggling",
    "kashtam": "difficult struggling",
    "bayama": "anxious fearful",
    "thaniya": "lonely isolated"
}

def normalize_tanglish(text: str) -> str:
    """Replaces known Tanglish slang with English emotional equivalents for better semantic routing."""
    normalized = text.lower()
    for tanglish, english in TANGLISH_DICT.items():
        if tanglish in normalized:
            normalized = normalized.replace(tanglish, english)
    return normalized

def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def detect_goal_hybrid(message: str, past_context: str = "") -> dict:
    """
    Hybrid approach to detect the conversational goals using Context Awareness and Tanglish Normalization.
    """
    # Normalize Tanglish slang to emotional English
    normalized_message = normalize_tanglish(message)

    # Context Awareness: Embed both normalized message and history context
    combined_input = normalized_message
    if past_context:
        combined_input = f"{past_context}. {normalized_message}"

    msg_emb = memory_engine.encoder.encode([combined_input])[0]
    msg_emb = msg_emb / np.linalg.norm(msg_emb)

    scores = []
    for goal, cluster_center in CLUSTER_EMBEDDINGS.items():
        score = float(cosine_similarity(msg_emb, cluster_center))
        scores.append((goal, score))

    scores.sort(key=lambda x: x[1], reverse=True)
    top_3 = scores[:3]
    primary_goal, primary_score = top_3[0]

    print(f"[SEMANTIC ROUTER V2] Top Match: {primary_goal} ({primary_score:.3f})")

    # If the score is low, fallback to Groq Intent Clarifier
    if primary_score < 0.50 and GROQ_API_KEY != "YOUR_GROQ_API_KEY_HERE":
        print("[SEMANTIC ROUTER] Score below 0.50. Calling Groq Intent Clarifier...")
        prompt = f"Analyze the user message and history. Classify the primary conversational goal into one of these: Venting, Advice/Solution, Validation, Loneliness/Connection, Humor Masking, Distraction/Humor, Passive Distress, Factual, Active SOS. Reply ONLY with the category name. Message: '{message}' Context: '{past_context}'"
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {"model": "llama3-8b-8192", "messages": [{"role": "user", "content": prompt}], "temperature": 0.1, "max_tokens": 10}
        try:
            res = requests.post(GROQ_URL, headers=headers, json=payload, timeout=5)
            if res.status_code == 200:
                llm_goal = res.json()["choices"][0]["message"]["content"].strip()
                for g in GOAL_CLUSTERS.keys():
                    if g.lower() in llm_goal.lower():
                        primary_goal = g
                        top_3[0] = (g, 1.0) # Boost score
                        break
        except Exception as e:
            print(f"[GROQ FALLBACK ERROR] {e}")

    # Build Rich Scalar Response Mode
    mode_obj = {
        "top_3_goals": top_3,
        "primary_goal": primary_goal,
        "needs_validation": 0.9 if primary_goal in ["Venting", "Validation", "Humor Masking", "Passive Distress"] else 0.3,
        "needs_solution": 0.8 if primary_goal in ["Advice/Solution", "Factual"] else 0.1,
        "needs_humor": 0.9 if primary_goal == "Distraction/Humor" else 0.05,
        "emotional_intensity": 0.9 if primary_goal in ["Venting", "Passive Distress", "Active SOS"] else 0.4,
        "social_need": 0.9 if primary_goal == "Loneliness/Connection" else 0.5,
        "mental_energy": 0.2 if primary_goal in ["Passive Distress", "Venting"] else 0.7
    }

    return mode_obj
