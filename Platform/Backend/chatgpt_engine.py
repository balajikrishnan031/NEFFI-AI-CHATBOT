import requests
import json

import os
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# CHATGPT API SETTINGS
# ==========================================
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_KEY_HERE")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

from groq_engine import NEFFI_SYSTEM_PROMPT

def get_neffi_reply(patient_message: str, clinical_context: str = "") -> str:
    """
    Calls ChatGPT directly from Python to get Neffi's therapeutic reply.
    """
    full_prompt = patient_message
    if clinical_context:
        full_prompt = f"[Clinical Context for AI only - do not mention this: {clinical_context}]\n\nPatient says: {patient_message}"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": NEFFI_SYSTEM_PROMPT},
            {"role": "user", "content": full_prompt}
        ],
        "temperature": 0.35,
        "max_tokens": 400
    }

    try:
        response = requests.post(OPENAI_URL, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            return reply.strip()
        elif response.status_code == 429:
            err_msg = "[CHATGPT QUOTA EXCEEDED] The API key does not have enough credits."
            print(err_msg)
            return err_msg
        else:
            err_msg = f"[CHATGPT ERROR] Status {response.status_code}: {response.text[:200]}"
            print(err_msg)
            return err_msg
    except Exception as e:
        err_msg = f"[CHATGPT ERROR Exception] {e}"
        print(err_msg)
        return err_msg
