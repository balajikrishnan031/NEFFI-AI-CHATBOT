import requests
import json

GEMINI_KEY = "AIzaSyCSLDV7Kxp7WkjJfvxnA6CK7bJ9NVJRB4E"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}"

try:
    response = requests.post(
        GEMINI_URL,
        json={"contents": [{"parts": [{"text": "Hello"}]}]},
        timeout=10
    )
    if response.status_code == 200:
        print("Success! Gemini API Key is working.")
        print("Response:", response.json()["candidates"][0]["content"]["parts"][0]["text"])
    else:
        print("Failed! Status code:", response.status_code)
        print("Response:", response.text)
except Exception as e:
    print("Error:", str(e))
