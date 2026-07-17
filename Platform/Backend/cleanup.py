import os

BASE = r"e:\Neffi Ai\Platform\Backend"

to_delete = [
    "quick_validate_router.py",
    "comprehensive_stress_test_pro.py",
    "comprehensive_stress_test.py",
    "compare_metrics.py",
    "evaluate_chat_metrics.py",
    "evaluate_metrics.py",
    "test_live_chat.py",
    "check_n8n_db.py",
    "fix_db.py",
    "fix_patient_alert_webhook.py",
    "gemini_engine.py",
    "migrate_v3.py",
    "reset_db.py",
    "clinical_data.db",
    "ai_orchestrator.py",
    r"n8n_workflows\neffi_choice_A_premium.json",
    r"n8n_workflows\neffi_choice_B_free.json",
    r"n8n_workflows\neffi_gemini_flow.json",
    r"n8n_workflows\inactive_nudge_flow.json",
]

for f in to_delete:
    path = os.path.join(BASE, f)
    if os.path.exists(path):
        os.remove(path)
        print(f"✅ Deleted: {f}")
    else:
        print(f"⚠️  Not found: {f}")

print("\n--- Remaining Backend Files ---")
for f in sorted(os.listdir(BASE)):
    print(f"  {f}")
