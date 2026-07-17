"""Run this once to sync groq_engine.py system prompt → n8n flow JSON"""
import json, re, os

# Get absolute path to the directory containing this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Read system prompt from groq_engine.py
with open(os.path.join(BASE_DIR, 'groq_engine.py'), encoding='utf-8') as f:
    src = f.read()
match = re.search(r'NEFFI_SYSTEM_PROMPT = """(.*?)"""', src, re.DOTALL)
system_prompt = match.group(1)

# Load n8n flow
n8n_file_path = os.path.join(BASE_DIR, 'n8n_workflows', 'neffi_groq_flow.json')
with open(n8n_file_path, encoding='utf-8') as f:
    flow = json.load(f)

# Update system prompt node
for node in flow['nodes']:
    if node['name'] == 'Groq Llama-3 API':
        # Safely construct the exact string representation for n8n jsonBody
        escaped_prompt = system_prompt.replace('\n', '\\n').replace('"', '\\"')
        
        json_body_str = (
            "={\n"
            '  "model": "llama-3.1-8b-instant",\n'
            '  "messages": [\n'
            '    {\n'
            '      "role": "system",\n'
            f'      "content": "{escaped_prompt}"\n'
            '    },\n'
            '    {\n'
            '      "role": "user",\n'
            '      "content": "[Context: {{ $json.body.context }}]\\n\\nPatient says: {{ $json.body.message }}"\n'
            '    }\n'
            '  ],\n'
            '  "temperature": 0.45,\n'
            '  "max_tokens": 260\n'
            '}'
        )
        node['parameters']['jsonBody'] = json_body_str
        break

with open(n8n_file_path, 'w', encoding='utf-8') as f:
    json.dump(flow, f, indent=2, ensure_ascii=False)

print("✅ n8n flow synced!")
print("   → System prompt: updated")
print("   → Temperature: 0.45")
print("   → Max tokens: 260")
print("\nNext: Re-import neffi_groq_flow.json into n8n and activate.")
