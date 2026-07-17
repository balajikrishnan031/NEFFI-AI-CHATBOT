import sys
sys.path.insert(0, 'e:/Neffi Ai/Platform/Backend')
from clinical_router import rule_based_route

tests = [
    ('Somatic', "My hands are trembling and my chest feels so tight I can't take a full breath. I feel like I'm going to pass out."),
    ('DBT', "My friend completely betrayed my trust today. I am so ridiculously furious I just want to smash my screen. Don't tell me to just 'breathe'."),
    ('ACT', "I got diagnosed with a chronic illness that has no cure. I'll be in physical pain for the rest of my life. I don't know how to accept this."),
    ('Rogerian', "I'm just so exhausted with everything today. I don't want to fix anything, I just need someone to hear me out because my mind is a mess."),
]

print("\n=== NEFFI QA ROUTER DIAGNOSTIC ===\n")
for name, msg in tests:
    result = rule_based_route(msg, 'sadness')
    print(f"[{name}]")
    print(f"  state    : {result['state_name']}")
    print(f"  category : {result['category']}")
    print(f"  is_sos   : {result['is_sos']}")
    print(f"  insight  : {result['clinical_insight']}")
    print()
