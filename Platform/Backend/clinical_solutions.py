# Neffi AI 96-State Tailored Clinical Solutions
# Strictly maps each clinical state to a specific therapeutic framework, rationale, and directed action.

CLINICAL_SOLUTIONS_MAP = {
    # DEPRESSION (1-20)
    1: {
        "state_name": "Major Depressive Episode",
        "therapy_framework": "CBT",
        "psychological_rationale": "Severe depressive depletion often manifests as an inability to act due to overwhelming negative thoughts. CBT focuses on breaking this cycle via minor behavioral activation.",
        "directed_action": "Write down exactly one tiny physical task you can complete in the next 5 minutes (e.g., wash one cup). Focus solely on doing that single action.",
        "suggested_options": ["Guide me through a tiny action 🌿", "Help me reframe this heaviness 💭", "Listen to me vent 🤝"]
    },
    2: {
        "state_name": "Persistent Depressive Disorder",
        "therapy_framework": "CBT",
        "psychological_rationale": "Chronically low moods over years lead to automated beliefs that things will never improve. CBT challenges this cognitive permanence.",
        "directed_action": "Recall one brief moment in the past week where you felt even slightly content or neutral. Jot down what you were doing at that exact moment.",
        "suggested_options": ["Let's find that neutral moment 💭", "Help me reframe these thoughts 🧠", "Listen to me vent 🤝"]
    },
    3: {
        "state_name": "Anhedonia",
        "therapy_framework": "ACT",
        "psychological_rationale": "Anhedonia makes hobby pursuit feel like a chore. ACT focuses on pursuing values regardless of whether you feel immediate pleasure.",
        "directed_action": "Identify one value that is important to you (e.g., creativity, kindness). Engage in a 2-minute activity representing that value, without expecting joy.",
        "suggested_options": ["Find my core values 🎯", "I want to share more 💭", "Suggest a relaxing song 🎵"]
    },
    4: {
        "state_name": "Hopelessness",
        "therapy_framework": "ACT",
        "psychological_rationale": "When the mind paints the future as permanently dark, ACT anchors you to the present moment where choice still exists.",
        "directed_action": "Focus on the physical space around you. Name three things you can physically touch right now to pull yourself back from the imagined future.",
        "suggested_options": ["Pull me back to the present 🌿", "Help me find one small reason 💭", "Tell me a comforting story 📖"]
    },
    5: {
        "state_name": "Psychomotor Retardation",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Depression physically slows down body movements and speech. Somatic interventions gently reactivate the nervous system.",
        "directed_action": "Slowly rotate your ankles, then wiggle your toes. Feel the physical sensation of blood flow returning to your extremities.",
        "suggested_options": ["Guide me in body reactivation 🌿", "What small step can I take? 💭", "Play me a calming song 🎵"]
    },
    6: {
        "state_name": "Cognitive Impairment (Depression)",
        "therapy_framework": "CBT",
        "psychological_rationale": "Brain fog and focus difficulties are core depressive symptoms. Simplifying cognitive load reduces frustration.",
        "directed_action": "Let's ignore complex decisions. Focus only on describing the object right in front of you—its color, texture, and shape.",
        "suggested_options": ["Let's focus on one object 🔍", "Give me a simple puzzle 🧩", "Play me a calming song 🎵"]
    },
    7: {
        "state_name": "Somatic Depression",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Depression frequently manifests as unexplained physical pain, chest pressure, or fatigue.",
        "directed_action": "Place a warm hand where you feel discomfort. Breathe into that spot, acknowledging that your body is holding emotional distress.",
        "suggested_options": ["Breathe into the discomfort 🌬️", "Help me reframe this feeling 💭", "Listen to me vent 🤝"]
    },
    8: {
        "state_name": "Atypical Depression",
        "therapy_framework": "CBT",
        "psychological_rationale": "Atypical depression causes highly reactive moods and heavy limbs (leaden paralysis).",
        "directed_action": "Perform a brief self-compassion check: place your hand over your heart and take three slow, deep breaths to soothe body tension.",
        "suggested_options": ["Let's breathe together 🌬️", "Help me reframe my thoughts 💭", "Listen to me vent 🤝"]
    },
    9: {
        "state_name": "Melancholic Depression",
        "therapy_framework": "CBT",
        "psychological_rationale": "Morning dread and complete lack of pleasure are key markers of melancholia.",
        "directed_action": "Commit to one small sensory change: wash your face with cold water or step near a window for natural light.",
        "suggested_options": ["Help me get through this morning ☀️", "Help me find one reason 💭", "Play me a song 🎵"]
    },
    10: {
        "state_name": "Agitated Depression",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Inner restlessness combined with low mood can feel overwhelming. Gentle movement releases built-up physical tension.",
        "directed_action": "Shake out your hands and arms vigorously for 10 seconds. Let the physical vibration release some of the accumulated tension.",
        "suggested_options": ["Shake out the tension 🌿", "Give me a distress skill 🧊", "Listen to me vent 🤝"]
    },
    11: {
        "state_name": "Seasonal Affective Disorder",
        "therapy_framework": "CBT",
        "psychological_rationale": "SAD corresponds to seasonal light shifts, causing lethargy and isolation.",
        "directed_action": "Ensure you are near daylight for at least 5 minutes today. Note how the light feels on your skin.",
        "suggested_options": ["Let's schedule light exposure ☀️", "Give me a positive thought 💭", "Tell me a comforting story 📖"]
    },
    12: {
        "state_name": "Postpartum Depression",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "New mothers experience intense guilt, hormonal shifts, and pressure to feel immediate bonding.",
        "directed_action": "Permit yourself to feel emotional fatigue. Remind yourself that exhaustion is a natural physical response, not a failure of love.",
        "suggested_options": ["Validate my struggle 🤝", "Help me be kinder to myself 💭", "Listen to me vent 🤝"]
    },
    13: {
        "state_name": "Grief-Related Depression",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Loss disrupts our sense of reality. Rogerian acceptance validates grief rather than attempting to 'fix' it.",
        "directed_action": "Write down one memory or feeling about your loss. Allow the emotion to exist without trying to minimize or explain it.",
        "suggested_options": ["Help me honor this grief 🖤", "I need someone to listen 🤝", "Tell me a comforting story 📖"]
    },
    14: {
        "state_name": "Existential Depression",
        "therapy_framework": "ACT",
        "psychological_rationale": "Existential sadness arises when normal daily goals feel empty and meaningless.",
        "directed_action": "Instead of seeking absolute meaning, focus on one small, kind act you can do for someone or yourself today.",
        "suggested_options": ["Find a tiny purpose today 🎯", "Help me find meaning 💭", "Tell me a comforting story 📖"]
    },
    15: {
        "state_name": "Masked Depression",
        "therapy_framework": "CBT",
        "psychological_rationale": "Hiding depression behind humor or smiles creates emotional isolation.",
        "directed_action": "Name one feeling you are hiding from others right now. Write it down privately to acknowledge its validity.",
        "suggested_options": ["Let's look behind the mask 💭", "Help me express this feeling 🤝", "Listen to me vent 🤝"]
    },
    16: {
        "state_name": "Treatment-Resistant Depression",
        "therapy_framework": "ACT",
        "psychological_rationale": "When treatments fail, patients feel broken. ACT focuses on cultivating life quality alongside symptoms.",
        "directed_action": "Acknowledge that your symptoms are present, but note one small interest or connection you still value despite them.",
        "suggested_options": ["Explore life despite symptoms 🎯", "What small step can I take? 💭", "Listen to me vent 🤝"]
    },
    17: {
        "state_name": "Self-Loathing",
        "therapy_framework": "CBT",
        "psychological_rationale": "Intense self-hatred is driven by an overactive inner critic. CBT models challenge this distorted voice.",
        "directed_action": "Write down one self-critical thought. Reframe it by writing what you would say to a close friend in the exact same situation.",
        "suggested_options": ["Challenge my inner critic 🧠", "Help me be kinder to myself 💭", "Play me a song 🎵"]
    },
    18: {
        "state_name": "Emotional Numbness",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Numbness is a protective defense mechanism against extreme emotional overload. Sensory input helps reconnect.",
        "directed_action": "Hold an ice cube in your hand or splash cold water on your face. Focus entirely on the physical intensity of the temperature.",
        "suggested_options": ["Try ice temperature shock 🧊", "Guide me through grounding 🌿", "Play me a calming song 🎵"]
    },
    19: {
        "state_name": "Suicidal Ideation (Passive)",
        "therapy_framework": "Crisis_SOS",
        "psychological_rationale": "Passive suicidal ideation reflects an intense desire to escape pain. Immediate safety protocol is required.",
        "directed_action": "Please contact a trusted person or reach out to AASRA at 9820466726 or call 104 immediately. You do not have to carry this alone.",
        "suggested_options": ["Get emergency help numbers 🚨", "Show me helpline contacts 🤝", "I need someone to listen 🤝"]
    },
    20: {
        "state_name": "Suicidal Ideation (Active)",
        "therapy_framework": "Crisis_SOS",
        "psychological_rationale": "Active suicidal ideation presents an immediate risk. Stop all therapy protocols and execute crisis response.",
        "directed_action": "Please call 9152987821 or contact emergency services at 104 immediately. Reach out to a family member or friend right now.",
        "suggested_options": ["Get emergency help numbers 🚨", "Show me helpline contacts 🤝", "I need someone to listen 🤝"]
    },

    # ANXIETY (21-35)
    21: {
        "state_name": "Generalized Anxiety Disorder",
        "therapy_framework": "CBT",
        "psychological_rationale": "GAD triggers persistent worry about future catastrophes. CBT separates thoughts from facts.",
        "directed_action": "Write down your primary worry. Ask yourself: Is this worry a 100% confirmed fact, or is it an estimation of the future?",
        "suggested_options": ["Analyze my worry 🧠", "Help me stop overthinking 💭", "Guide me through grounding 🌿"]
    },
    22: {
        "state_name": "Social Anxiety",
        "therapy_framework": "CBT",
        "psychological_rationale": "Social anxiety is driven by fear of negative evaluation. CBT challenges the belief that everyone is judging you.",
        "directed_action": "Focus your attention outward rather than inward. Observe three neutral details about your current physical environment.",
        "suggested_options": ["Focus my attention outward 🌿", "Help me reframe this thought 🧠", "Tell me a comforting story 📖"]
    },
    23: {
        "state_name": "Panic Attack",
        "therapy_framework": "Somatic",
        "psychological_rationale": "A panic attack triggers a massive somatic fight-or-flight response. Slow exhalations down-regulate the nervous system.",
        "directed_action": "Perform the 4-4-6 breathing technique: Inhale for 4 seconds, hold for 4 seconds, exhale slowly for 6 seconds. Repeat three times.",
        "suggested_options": ["Start breathing guide 🌬️", "Name five things I see 🌿", "Help me calm my body 🌬️"]
    },
    24: {
        "state_name": "Anticipatory Anxiety",
        "therapy_framework": "CBT",
        "psychological_rationale": "Fear of upcoming events causes severe worry. CBT focuses on preparing or finding a grounding point.",
        "directed_action": "Define one action you can take to prepare for the event, then intentionally redirect your focus to a present-moment task.",
        "suggested_options": ["Reframe my fear of the event 🧠", "Guide me through grounding 🌿", "Play me a calming song 🎵"]
    },
    25: {
        "state_name": "Health Anxiety",
        "therapy_framework": "CBT",
        "psychological_rationale": "Health anxiety leads to obsessive symptom checking and catastrophizing body signals.",
        "directed_action": "Close your browser and avoid symptom checking. Ground yourself by pressing your feet firmly into the floor.",
        "suggested_options": ["Help me stop checking symptoms 🧠", "Guide me through grounding 🌿", "I want to share more 💭"]
    },
    26: {
        "state_name": "Separation Anxiety",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Separation triggers intense panic and fear of loss. Validation stabilizes the panic.",
        "directed_action": "Place your hand on your chest. Remind yourself: 'It is natural to miss them, but I am safe and capable in this moment.'",
        "suggested_options": ["Validate my attachment fear 🤝", "Help me calm my body 🌬️", "Play me a song 🎵"]
    },
    27: {
        "state_name": "Performance Anxiety",
        "therapy_framework": "CBT",
        "psychological_rationale": "Performance anxiety triggers an intense fear of failing in public or under pressure.",
        "directed_action": "Take a slow deep breath, drop your shoulders, and loosen your jaw. Focus on the task, not the audience.",
        "suggested_options": ["Relax my physical tension 🌿", "Help me reframe this thought 🧠", "Tell me a story 📖"]
    },
    28: {
        "state_name": "Agoraphobia",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Fear of open or crowded spaces triggers hypervigilance. Anchoring safety locally is crucial.",
        "directed_action": "Find a solid vertical surface (like a wall or chair). Lean your back against it to feel physically supported.",
        "suggested_options": ["Find a physical anchor 🌿", "Guide me through grounding 🌿", "Play me a song 🎵"]
    },
    29: {
        "state_name": "Intrusive Thoughts",
        "therapy_framework": "CBT",
        "psychological_rationale": "Unwanted scary thoughts cause panic. CBT teaches that thoughts are just mental noise, not actions.",
        "directed_action": "Label the thought: 'This is an intrusive thought. It is just a brain signal, not a reflection of my character.'",
        "suggested_options": ["Label my intrusive thoughts 🧠", "Guide me through grounding 🌿", "Play me a calming song 🎵"]
    },
    30: {
        "state_name": "Rumination",
        "therapy_framework": "CBT",
        "psychological_rationale": "Rumination traps the mind in circular loops about past events. Intentional disruption breaks the loop.",
        "directed_action": "Instantly switch your activity: stand up, drink a cup of cold water, or walk to a different room right now.",
        "suggested_options": ["Disrupt my thinking loop 🧠", "Give me a puzzle 🧩", "Tell me a story 📖"]
    },
    31: {
        "state_name": "Hypervigilance",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Hypervigilance keeps the nervous system alert for threat. Progressive muscle relaxation signals safety.",
        "directed_action": "Tense your shoulders upward toward your ears for 5 seconds, then release them completely. Note the physical relaxation.",
        "suggested_options": ["Try progressive relaxation 🌿", "Play me a calming song 🎵", "I want to share more 💭"]
    },
    32: {
        "state_name": "Catastrophizing",
        "therapy_framework": "CBT",
        "psychological_rationale": "Catastrophizing jumps to the worst possible outcome. CBT weighs the actual probability.",
        "directed_action": "Identify the worst outcome. Then, write down the best outcome, and the most realistic, middle-ground outcome.",
        "suggested_options": ["Analyze the realistic outcome 🧠", "Help me stop overthinking 💭", "Play me a song 🎵"]
    },
    33: {
        "state_name": "Existential Anxiety",
        "therapy_framework": "ACT",
        "psychological_rationale": "Existential dread triggers fear of finitude and lack of control.",
        "directed_action": "Acknowledge that lack of control is a universal human reality. Focus on what you can control in this exact room.",
        "suggested_options": ["Focus on what I can control 🎯", "Help me find meaning 💭", "Play me a calming song 🎵"]
    },
    34: {
        "state_name": "Financial Anxiety",
        "therapy_framework": "CBT",
        "psychological_rationale": "Money stress triggers persistent survival alarm signals.",
        "directed_action": "Separate your worry into actionable tasks (like creating a simple budget plan) versus non-actionable catastrophic thoughts.",
        "suggested_options": ["Make a simple plan 🧠", "What small step can I take? 💭", "Tell me a story 📖"]
    },
    35: {
        "state_name": "Relationship Anxiety",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Fear of rejection triggers obsessive reassurance seeking.",
        "directed_action": "Validate the fear of losing connection, but pause for 3 minutes before messaging or seeking external reassurance.",
        "suggested_options": ["Help me sit with this urge 🤝", "Help me understand this feeling 💭", "Play me a calming song 🎵"]
    },

    # ATTRITION RISK (36-50)
    36: {
        "state_name": "Therapy Disengagement",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Disengagement happens when progress feels slow or therapy feels like an obligation.",
        "directed_action": "Vent openly about what is frustrating you about this process. No judgment, no rules.",
        "suggested_options": ["I want to vent my frustration 🤝", "Tell me a story 📖", "Help me understand this feeling 💭"]
    },
    37: {
        "state_name": "Session Dropout Risk",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Dropout risk peaks when sessions feel too demanding or uncomfortable.",
        "directed_action": "Acknowledge the urge to cancel. Give yourself permission to have a short, low-effort check-in instead.",
        "suggested_options": ["Let's do a short check-in 🤝", "I want to share more 💭", "Tell me a story 📖"]
    },
    38: {
        "state_name": "Low Motivation to Continue",
        "therapy_framework": "ACT",
        "psychological_rationale": "Low motivation is common. ACT prioritizes value-based action over waiting for the 'mood' to strike.",
        "directed_action": "Choose a 1-minute task related to your wellbeing. Perform it right now, even if you feel zero motivation.",
        "suggested_options": ["Commit to a 1-minute task 🎯", "What small step can I take? 💭", "Play me a song 🎵"]
    },
    39: {
        "state_name": "Therapeutic Alliance Rupture",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Rupture happens when the user feels misunderstood or judged by the system.",
        "directed_action": "Please tell me exactly where I went wrong or misunderstood you. I want to correct it and listen better.",
        "suggested_options": ["Tell me where you went wrong 🤝", "Let's reset the conversation 🧠", "I need to vent this out 🤝"]
    },
    40: {
        "state_name": "Skill Practice Avoidance",
        "therapy_framework": "CBT",
        "psychological_rationale": "Avoidance happens when exercises feel silly, clinical, or overly complex.",
        "directed_action": "Let's ditch the formal exercises. Just close your eyes and take one deep, natural breath. That is enough for now.",
        "suggested_options": ["Just one deep breath 🌬️", "I want to talk more 💭", "Play me a calming song 🎵"]
    },
    41: {
        "state_name": "Homework Non-Compliance",
        "therapy_framework": "CBT",
        "psychological_rationale": "Failing to complete therapeutic tasks triggers guilt and avoidance.",
        "directed_action": "Don't worry about incomplete tasks. Let's start fresh with a simple, zero-guilt, 30-second checking of your mood.",
        "suggested_options": ["Start fresh with zero guilt 🧠", "What small step can I take? 💭", "Tell me a story 📖"]
    },
    42: {
        "state_name": "Ambivalence About Treatment",
        "therapy_framework": "ACT",
        "psychological_rationale": "Ambivalence is normal. We balance the pros and cons of staying in the same emotional state.",
        "directed_action": "List one thing you want to change, and one thing you are afraid of losing if you do change.",
        "suggested_options": ["Analyze my ambivalence 🎯", "I want to share more 💭", "Tell me a story 📖"]
    },
    43: {
        "state_name": "Passive Resistance",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Passive responses (e.g. 'I don't know') signal exhaustion or emotional withdrawal.",
        "directed_action": "It is completely fine if you don't know what to say. We can just sit with that silence or listen to a calm song.",
        "suggested_options": ["Let's listen to a song 🎵", "I want to share more 💭", "Play me a calming song 🎵"]
    },
    44: {
        "state_name": "Information Overload Fatigue",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Too many techniques overwhelm cognitive capacity, triggering abandonment of care.",
        "directed_action": "Let's stop talking about mental health. Just close your eyes, drop your shoulders, and listen to the sounds in your room.",
        "suggested_options": ["Listen to the room sounds 🌿", "Play me a calming song 🎵", "I want to share more 💭"]
    },
    45: {
        "state_name": "Digital Therapy Burnout",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Staring at screens for support can feel sterile and draining.",
        "directed_action": "Look away from the screen. Focus on a distant physical object in your room for 15 seconds to rest your eyes.",
        "suggested_options": ["Rest my screen eyes 🌿", "Give me a simple puzzle 🧩", "Tell me a story 📖"]
    },
    46: {
        "state_name": "Stigma-Related Withdrawal",
        "therapy_framework": "CBT",
        "psychological_rationale": "Stigma causes patients to hide or stop therapy due to shame.",
        "directed_action": "Remind yourself: 'Seeking support is an act of courage and strength, not weakness.'",
        "suggested_options": ["Reframe the stigma 🧠", "I want to share more 💭", "Tell me a story 📖"]
    },
    47: {
        "state_name": "Logistical Barriers",
        "therapy_framework": "CBT",
        "psychological_rationale": "Scheduling conflicts or lack of time cause therapy dropout.",
        "directed_action": "Let's establish a micro-routine: allocate just 2 minutes at the end of your day for a simple check-in.",
        "suggested_options": ["Create a 2-minute routine 🧠", "What small step can I take? 💭", "Tell me a story 📖"]
    },
    48: {
        "state_name": "Loss of Hope in Treatment",
        "therapy_framework": "ACT",
        "psychological_rationale": "Hopelessness about healing causes complete disengagement from support.",
        "directed_action": "Instead of focusing on a full cure, let's focus on how to make the next 1 hour slightly more comfortable.",
        "suggested_options": ["Focus on the next hour 🎯", "I want to share more 💭", "Play me a calming song 🎵"]
    },
    49: {
        "state_name": "Context Dropout (Premature Termination)",
        "therapy_framework": "ACT",
        "psychological_rationale": "Stopping treatment as soon as mood improves often leads to rapid relapse.",
        "directed_action": "Identify one protective habit you practiced this week. Focus on maintaining that habit even when feeling good.",
        "suggested_options": ["Identify my protective habits 🎯", "I want to share more 💭", "Tell me a story 📖"]
    },
    50: {
        "state_name": "Re-Engagement Opportunity",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Patients returning after dropout need warmth, validation, and a zero-shame re-entry.",
        "directed_action": "Welcome back. There is no shame or explanation needed for your absence. I am glad you are here today.",
        "suggested_options": ["Let's start where I am 🤝", "Help me understand this feeling 💭", "Tell me a story 📖"]
    },

    # TRAUMA & STRESS (51-62)
    51: {
        "state_name": "Acute Stress Reaction",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Acute shock freezes the nervous system. Grounding pulls you out of hyperarousal.",
        "directed_action": "Feel the weight of your body pressing down onto your seat. Press your feet firmly into the floor to anchor yourself.",
        "suggested_options": ["Guide me through grounding 🌿", "I need someone to listen 🤝", "Play me a calming song 🎵"]
    },
    52: {
        "state_name": "PTSD Flashback",
        "therapy_framework": "Somatic",
        "psychological_rationale": "A flashback tricks the body into believing past trauma is happening right now.",
        "directed_action": "Look around and name 5 colors you can see in this room. Remind yourself: 'I am safe in this room right now.'",
        "suggested_options": ["Verify my safety now 🌿", "I need someone to listen 🤝", "Play me a calming song 🎵"]
    },
    53: {
        "state_name": "Complex Trauma",
        "therapy_framework": "ACT",
        "psychological_rationale": "Long-term trauma disrupts trust and emotional safety. Validation is primary.",
        "directed_action": "Acknowledge that your system is highly protective. Treat your current anxiety as a guard trying to keep you safe.",
        "suggested_options": ["Honor my protective system 🎯", "Help me understand this feeling 💭", "Play me a calming song 🎵"]
    },
    54: {
        "state_name": "Emotional Dysregulation",
        "therapy_framework": "DBT",
        "psychological_rationale": "Intense emotional flooding overwhelms normal coping. Distress tolerance is needed.",
        "directed_action": "Splash cold water on your face or hold something freezing. The temperature change immediately lowers heart rate.",
        "suggested_options": ["Get a distress tolerance skill 🧊", "I need to vent this out 🤝", "Play me a calming song 🎵"]
    },
    55: {
        "state_name": "Dissociation",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Dissociation detaches the mind from the body to escape intense stress.",
        "directed_action": "Hold a solid object (like a key or a stone). Focus entirely on its hardness, temperature, and texture.",
        "suggested_options": ["Sensory grounding drill 🌿", "I need someone to listen 🤝", "Play me a calming song 🎵"]
    },
    56: {
        "state_name": "Shame Response",
        "therapy_framework": "CBT",
        "psychological_rationale": "Shame tells you that you are fundamentally broken. Self-compassion challenges this.",
        "directed_action": "Close your eyes, take a breath, and say: 'I made a mistake, but I am still a good and valuable person.'",
        "suggested_options": ["Practice self-compassion 🧠", "Help me be kinder to myself 💭", "Tell me a story 📖"]
    },
    57: {
        "state_name": "Guilt Response",
        "therapy_framework": "CBT",
        "psychological_rationale": "Guilt focuses on specific actions. CBT separates responsibility from self-blame.",
        "directed_action": "Write down what happened. Draw a circle representing the situation and note what factors were actually in your control.",
        "suggested_options": ["Analyze my guilt 🧠", "Help me reframe this thought 🧠", "Tell me a story 📖"]
    },
    58: {
        "state_name": "Betrayal Trauma",
        "therapy_framework": "DBT",
        "psychological_rationale": "Betrayal by a trusted person shatters safety and triggers rage or numbness.",
        "directed_action": "Allow yourself to feel angry or hurt without judging yourself. Vent your feelings in writing, then delete it.",
        "suggested_options": ["Get a distress skill 🧊", "I need to vent this out 🤝", "I want to share more 💭"]
    },
    59: {
        "state_name": "Abandonment Fear",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Fear of being left triggers intense attachment panic.",
        "directed_action": "Remind yourself: 'Even if someone leaves, I am capable of holding myself and I will survive.'",
        "suggested_options": ["I need someone to listen 🤝", "Help me understand this feeling 💭", "Tell me a story 📖"]
    },
    60: {
        "state_name": "Rejection Sensitivity",
        "therapy_framework": "CBT",
        "psychological_rationale": "Minor criticisms are perceived as total rejection, causing intense pain.",
        "directed_action": "Pause. Ask yourself: Is this criticism a threat to my entire relationship or just one detail of my actions?",
        "suggested_options": ["Evaluate the criticism 🧠", "I want to share more 💭", "Tell me a story 📖"]
    },
    61: {
        "state_name": "Hyperarousal",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Hyperarousal keeps the body locked in high tension and ready to fight.",
        "directed_action": "Exhale very slowly, making your exhale twice as long as your inhale. This signals the nervous system to relax.",
        "suggested_options": ["Slow down my exhalations 🌬️", "Guide me through grounding 🌿", "Play me a calming song 🎵"]
    },
    62: {
        "state_name": "Avoidance Behavior",
        "therapy_framework": "CBT",
        "psychological_rationale": "Avoiding triggers temporarily reduces anxiety but increases it in the long term.",
        "directed_action": "Think of one tiny exposure step (like looking at a picture). Commit to doing only that step today.",
        "suggested_options": ["What small step can I take? 💭", "I want to share more 💭", "Tell me a story 📖"]
    },

    # INTERPERSONAL (63-74)
    63: {
        "state_name": "Loneliness",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Loneliness makes the world feel hostile and disconnected. Validation brings comfort.",
        "directed_action": "Accept the feeling of loneliness. Write down one simple message you could send to someone to say hello.",
        "suggested_options": ["I need someone to listen 🤝", "Tell me a story 📖", "Play me a song 🎵"]
    },
    64: {
        "state_name": "Social Withdrawal",
        "therapy_framework": "ACT",
        "psychological_rationale": "Withdrawing protects from social fatigue but worsens depression.",
        "directed_action": "Commit to one low-energy social interaction today (e.g. text one friend a neutral meme).",
        "suggested_options": ["Take one small social step 🎯", "Help me understand this feeling 💭", "Play me a calming song 🎵"]
    },
    65: {
        "state_name": "Conflict Avoidance",
        "therapy_framework": "CBT",
        "psychological_rationale": "Suppressing feelings to keep peace increases internal pressure and resentment.",
        "directed_action": "Write down one boundary you wish you had set in your last conflict. Practice saying it aloud in private.",
        "suggested_options": ["Practice setting a boundary 🧠", "I want to share more 💭", "Tell me a story 📖"]
    },
    66: {
        "state_name": "Codependency",
        "therapy_framework": "ACT",
        "psychological_rationale": "Codependency makes your peace of mind dependent entirely on another person.",
        "directed_action": "Define one action you want to take today purely for yourself, independent of anyone else's approval.",
        "suggested_options": ["Choose an action for myself 🎯", "I want to share more 💭", "Tell me a story 📖"]
    },
    67: {
        "state_name": "Attachment Anxiety",
        "therapy_framework": "CBT",
        "psychological_rationale": "Anxiety triggers obsessive checking and fear of abandonment.",
        "directed_action": "Put your phone down. Engage in a physical task for 10 minutes before checking your notifications again.",
        "suggested_options": ["Step away from the screen 🧠", "Help me understand this feeling 💭", "Play me a calming song 🎵"]
    },
    68: {
        "state_name": "Attachment Avoidance",
        "therapy_framework": "ACT",
        "psychological_rationale": "Avoidance pushes people away to prevent vulnerability and anticipated hurt.",
        "directed_action": "Acknowledge the urge to pull away. Commit to saying one honest, neutral sentence about your feelings to a close person.",
        "suggested_options": ["Express a tiny feeling 🎯", "I want to share more 💭", "Tell me a story 📖"]
    },
    69: {
        "state_name": "Boundary Difficulties",
        "therapy_framework": "CBT",
        "psychological_rationale": "Being a people-pleaser leads to chronic boundary fatigue and low self-esteem.",
        "directed_action": "Practice saying: 'I would love to help, but I don't have the capacity for this right now.'",
        "suggested_options": ["Practice saying no 🧠", "I want to share more 💭", "Tell me a story 📖"]
    },
    70: {
        "state_name": "Communication Breakdown",
        "therapy_framework": "CBT",
        "psychological_rationale": "Breakdown causes defensiveness and escalates neutral talks into fights.",
        "directed_action": "Use an 'I' statement instead of a 'You' statement: 'I feel overwhelmed when...' instead of 'You make me...'",
        "suggested_options": ["Formulate an 'I' statement 🧠", "I want to share more 💭", "Tell me a story 📖"]
    },
    71: {
        "state_name": "Family System Stress",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Toxic family environments trigger chronic low-level stress and lack of safety.",
        "directed_action": "Acknowledge that you cannot change family members. Focus on creating a safe mental boundary for yourself.",
        "suggested_options": ["I need someone to listen 🤝", "I need to vent this out 🤝", "Play me a calming song 🎵"]
    },
    72: {
        "state_name": "Workplace Conflict",
        "therapy_framework": "CBT",
        "psychological_rationale": "Toxic work relationships trigger intense survival alarm and performance panic.",
        "directed_action": "Separate your core identity from your job: remind yourself: 'My job is what I do, not who I am.'",
        "suggested_options": ["Separate job from identity 🧠", "Help me reframe this thought 🧠", "Tell me a story 📖"]
    },
    73: {
        "state_name": "Romantic Relationship Distress",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Heartbreak and relationship strain cause intense grief and emotional instability.",
        "directed_action": "Validate the pain of loss. Give yourself permission to feel sad and cry without trying to force positivity.",
        "suggested_options": ["I need someone to listen 🤝", "Help me understand this feeling 💭", "Tell me a story 📖"]
    },
    74: {
        "state_name": "Grief and Loss",
        "therapy_framework": "Rogerian",
        "psychological_rationale": "Grief is a natural response to losing someone. Rogerian empathy supports this transition.",
        "directed_action": "Focus on taking slow, gentle breaths. Give yourself permission to mourn at your own pace today.",
        "suggested_options": ["I need someone to listen 🤝", "Tell me a story 📖", "Play me a calming song 🎵"]
    },

    # POSITIVE STATES (75-88)
    75: {
        "state_name": "Positive Reframing",
        "therapy_framework": "Casual",
        "psychological_rationale": "Acknowledging positive learning steps builds resilience.",
        "directed_action": "Celebrate this insight. Share it or write it down to reinforce the connection.",
        "suggested_options": ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"]
    },
    76: {
        "state_name": "Gratitude",
        "therapy_framework": "Casual",
        "psychological_rationale": "Practicing gratitude trains the brain to notice positive aspects of life.",
        "directed_action": "Hold onto this warm feeling. What is one small detail you are grateful for right now?",
        "suggested_options": ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"]
    },
    77: {
        "state_name": "Progress Acknowledgment",
        "therapy_framework": "Casual",
        "psychological_rationale": "Recognizing growth reinforces self-efficacy.",
        "directed_action": "Acknowledge how far you have come compared to where you started. You did that work.",
        "suggested_options": ["Give me a puzzle 🧩", "Hear a joke 😄", "Tell me a story 📖"]
    },
    78: {
        "state_name": "Motivation",
        "therapy_framework": "Casual",
        "psychological_rationale": "Momentum is a valuable state to harness.",
        "directed_action": "Direct this energy into one small step toward a goal you value.",
        "suggested_options": ["Give me a puzzle 🧩", "Tell me a story 📖", "Hear a joke 😄"]
    },
    79: {
        "state_name": "Relief",
        "therapy_framework": "Casual",
        "psychological_rationale": "A sudden drop in tension allows the body to settle.",
        "directed_action": "Take a deep breath and let your shoulders drop. Feel the relief physically in your body.",
        "suggested_options": ["Hear a joke 😄", "Give me a puzzle 🧩", "Tell me a story 📖"]
    },
    80: {
        "state_name": "Hope",
        "therapy_framework": "Casual",
        "psychological_rationale": "Hope helps patients imagine positive futures, building resilience.",
        "directed_action": "Hold onto this positive outlook. What is one good thing you look forward to tomorrow?",
        "suggested_options": ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"]
    },
    81: {
        "state_name": "Mindfulness",
        "therapy_framework": "Casual",
        "psychological_rationale": "Being present reduces overthinking.",
        "directed_action": "Focus on the sensation of breathing right now. Notice the cool air entering and warm air leaving.",
        "suggested_options": ["Give me a puzzle 🧩", "Tell me a story 📖", "Hear a joke 😄"]
    },
    82: {
        "state_name": "Social Connection",
        "therapy_framework": "Casual",
        "psychological_rationale": "Feeling connected acts as a protective buffer against distress.",
        "directed_action": "Enjoy this feeling of connection. Reach out to someone to share a warm hello.",
        "suggested_options": ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"]
    },
    83: {
        "state_name": "Self-Compassion",
        "therapy_framework": "Casual",
        "psychological_rationale": "Being kind to yourself builds emotional stability.",
        "directed_action": "Remind yourself: 'I am doing the best I can, and that is enough.'",
        "suggested_options": ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"]
    },
    84: {
        "state_name": "Resilience",
        "therapy_framework": "Casual",
        "psychological_rationale": "Bouncing back reinforces inner strength.",
        "directed_action": "Acknowledge your capacity to weather difficult situations.",
        "suggested_options": ["Hear a joke 😄", "Tell me a story 📖", "Give me a puzzle 🧩"]
    },
    85: {
        "state_name": "Acceptance",
        "therapy_framework": "Casual",
        "psychological_rationale": "Acceptance stops the exhaust of fighting unchangeable realities.",
        "directed_action": "Sit with this peace. Letting go of the fight allows you to redirect energy.",
        "suggested_options": ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"]
    },
    86: {
        "state_name": "Empowerment",
        "therapy_framework": "Casual",
        "psychological_rationale": "Feeling in control of your choices builds agency.",
        "directed_action": "Take charge of one simple decision today that is purely yours.",
        "suggested_options": ["Give me a puzzle 🧩", "Hear a joke 😄", "Tell me a story 📖"]
    },
    87: {
        "state_name": "Insight/Breakthrough",
        "therapy_framework": "Casual",
        "psychological_rationale": "New self-awareness helps shift persistent behavioral patterns.",
        "directed_action": "Reflect on this insight. What small habit can you build based on this new knowledge?",
        "suggested_options": ["Tell me a story 📖", "Give me a puzzle 🧩", "Hear a joke 😄"]
    },
    88: {
        "state_name": "Post-Traumatic Growth",
        "therapy_framework": "Casual",
        "psychological_rationale": "Growth after trauma represents a deep transition of values.",
        "directed_action": "Acknowledge how your struggle has shaped a wiser, stronger version of yourself.",
        "suggested_options": ["Tell me a story 📖", "Hear a joke 😄", "Give me a puzzle 🧩"]
    },

    # PHYSICAL-MENTAL (89-96)
    89: {
        "state_name": "Sleep Disturbance",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Lying awake with a racing mind increases stress. Somatic grounding settles the brain.",
        "directed_action": "Keep your eyes closed. Focus on relaxing your body, starting from your forehead, down to your jaw, shoulders, and toes.",
        "suggested_options": ["Play me a calming song 🎵", "What small step can I take? 💭", "Tell me a story 📖"]
    },
    90: {
        "state_name": "Appetite Change",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Stress shuts down or spikes digestion. Slow, conscious eating restores balance.",
        "directed_action": "Commit to one small sensory bite: eat a piece of fruit slowly, focusing completely on its taste and texture.",
        "suggested_options": ["What small step can I take? 💭", "Play me a calming song 🎵", "Tell me a story 📖"]
    },
    91: {
        "state_name": "Fatigue/Burnout",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Burnout drains physical resources. Restoring energy requires sensory rest.",
        "directed_action": "Close your eyes, let go of all screens, and focus on slow breathing for 1 minute.",
        "suggested_options": ["Play me a calming song 🎵", "What small step can I take? 💭", "Tell me a story 📖"]
    },
    92: {
        "state_name": "Chronic Pain-Linked Depression",
        "therapy_framework": "ACT",
        "psychological_rationale": "Chronic physical pain triggers depression. ACT cultivates values alongside pain.",
        "directed_action": "Acknowledge the physical pain, but identify one activity you enjoy that you can still engage in.",
        "suggested_options": ["What small step can I take? 💭", "Help me accept this 💭", "Tell me a story 📖"]
    },
    93: {
        "state_name": "Substance Use Risk",
        "therapy_framework": "DBT",
        "psychological_rationale": "Using substances to cope with emotions can lead to dependency. Distress tolerance helps.",
        "directed_action": "Pause. If you feel the urge to use, set a timer for 10 minutes and engage in a different task (like a puzzle).",
        "suggested_options": ["I need someone to listen 🤝", "What small step can I take? 💭", "Play me a calming song 🎵"]
    },
    94: {
        "state_name": "Self-Harm Risk",
        "therapy_framework": "Crisis_SOS",
        "psychological_rationale": "Urges to self-harm indicate severe distress. Safety protocols must be activated immediately.",
        "directed_action": "Please contact a trusted person or call AASRA at 9820466726 immediately. Hold ice in your hands to resist the physical urge.",
        "suggested_options": ["Get emergency help numbers 🚨", "Guide me through grounding 🌿", "Play me a calming song 🎵"]
    },
    95: {
        "state_name": "Psychosomatic Symptoms",
        "therapy_framework": "Somatic",
        "psychological_rationale": "Stress and anxiety manifest directly as headaches, stomach pain, or muscle tension.",
        "directed_action": "Sit comfortably. Take a slow deep breath, placing your hand on your stomach. Note how it expands and contracts.",
        "suggested_options": ["Guide me through grounding 🌿", "Play me a calming song 🎵", "I want to share more 💭"]
    },
    96: {
        "state_name": "Suicidal Crisis (Immediate)",
        "therapy_framework": "Crisis_SOS",
        "psychological_rationale": "Immediate suicidal crisis requires emergency escalation. Stop all therapeutic exercises.",
        "directed_action": "Please contact 104 or call 9152987821 immediately. Do not stay alone right now; reach out to family or friends.",
        "suggested_options": ["Get emergency help numbers 🚨", "Show me helpline contacts 🤝", "I need someone to listen 🤝"]
    }
}
