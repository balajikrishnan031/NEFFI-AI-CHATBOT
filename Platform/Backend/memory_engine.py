# Install: pip install pinecone-client sentence-transformers

import os

from sentence_transformers import SentenceTransformer
import json

class NeffiMemory:
    def __init__(self):
        print("Loading Multilingual Memory Embedding Model...")
        self.encoder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2', local_files_only=True)
        self.db_path = "user_state.json"
        if not os.path.exists(self.db_path):
            with open(self.db_path, "w") as f:
                json.dump({}, f)
        print("Memory Engine Ready!")

    def _load_db(self):
        with open(self.db_path, "r") as f:
            return json.load(f)

    def _save_db(self, data):
        with open(self.db_path, "w") as f:
            json.dump(data, f, indent=4)

    def save_to_memory(self, patient_id: str, text: str, emotion: str):
        db = self._load_db()
        if patient_id not in db:
            db[patient_id] = {"facts": {}, "emotional_memory": [], "patterns": {}, "deep_patterns": {}}
        # Ensure keys exist even for legacy records
        db[patient_id].setdefault("facts", {})
        db[patient_id].setdefault("patterns", {})
        db[patient_id].setdefault("deep_patterns", {})
        db[patient_id].setdefault("emotional_memory", [])
        
        db[patient_id]["emotional_memory"].append({"text": text, "emotion": emotion})
        db[patient_id]["emotional_memory"] = db[patient_id]["emotional_memory"][-15:] # Store more for deeper analysis
        
        # Real-time semantic extraction (Fast)
        msg = text.lower()
        if "father" in msg or "dad" in msg or "appa" in msg:
            db[patient_id]["patterns"]["father_conflict"] = True
        if "sleep" in msg or "awake" in msg or "insomnia" in msg:
            db[patient_id]["patterns"]["sleep_issue"] = "recurring"
            
        self._save_db(db)
        print(f"[MEMORY SAVED] For {patient_id}: {text}")

        # Trigger Deep Background Extraction every 5 messages
        if len(db[patient_id]["emotional_memory"]) % 5 == 0:
            import threading
            threading.Thread(target=self.background_deep_extraction, args=(patient_id,)).start()

    def background_deep_extraction(self, patient_id: str):
        import requests
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or api_key == "YOUR_GROQ_API_KEY_HERE": return

        db = self._load_db()
        memories = [m["text"] for m in db[patient_id].get("emotional_memory", [])[-10:]]
        if len(memories) < 5: return

        prompt = f"Analyze these messages from a user. Extract a JSON of psychological patterns, triggers, and relationship dynamics. Include confidence (0.0 to 1.0) and evidence_count. Also provide a 'contextual_summary' string describing the user's emotional state natively. Example format: {{\"fear_of_abandonment\": {{\"confidence\": 0.81, \"evidence_count\": 3}}, \"contextual_summary\": \"User often seeks reassurance...\"}}. Return ONLY raw JSON.\nMessages: {memories}"
        
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {"model": "llama3-8b-8192", "messages": [{"role": "user", "content": prompt}], "temperature": 0.1, "response_format": {"type": "json_object"}}
        
        try:
            res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=8)
            if res.status_code == 200:
                content = res.json()["choices"][0]["message"]["content"].strip()
                db[patient_id]["deep_patterns"] = json.loads(content)
                self._save_db(db)
                print(f"[MEMORY DEEP EXTRACTION] Completed for {patient_id}")
        except Exception as e:
            print(f"[MEMORY DEEP EXTRACTION ERROR] {e}")

    def recall_past_memory(self, patient_id: str, current_message: str) -> str:
        db = self._load_db()
        if patient_id not in db or not db[patient_id].get("emotional_memory"):
            return ""
        
        # SOS keyword list - these messages should NOT be injected as raw text
        SOS_PHRASES = [
            "want to go to sleep and never wake", "never wake up", "better off without me",
            "everyone would be better off", "no way out", "want to disappear",
            "planning to die", "going to end it", "take my pills", "going to kill myself",
            "suicide plan", "don't want to exist", "wish i was dead", "tired of living"
        ]
        
        raw_memories = db[patient_id]["emotional_memory"][-2:]
        sanitized_memories = []
        for m in raw_memories:
            text = m["text"]
            # If past message was a crisis message, replace with a safe tag
            if any(phrase in text.lower() for phrase in SOS_PHRASES):
                sanitized_memories.append("[Previous session: User was in emotional distress — crisis support was provided]")
            else:
                sanitized_memories.append(text)

        deep_patterns = db[patient_id].get("deep_patterns", {})
        
        context_str = ""
        if "contextual_summary" in deep_patterns:
            context_str += f"[LONG-TERM MEMORY: {deep_patterns['contextual_summary']}] "
            
        if sanitized_memories:
            context_str += "[RECENT MESSAGES: " + " | ".join(sanitized_memories) + "] "
            
        return context_str

    def update_phq9_score(self, patient_id: str, score: int):
        db = self._load_db()
        if patient_id not in db:
            db[patient_id] = {"facts": {}, "emotional_memory": []}
        db[patient_id]["facts"]["last_phq9_score"] = score
        self._save_db(db)

# Initialize the engine
memory_engine = NeffiMemory()
