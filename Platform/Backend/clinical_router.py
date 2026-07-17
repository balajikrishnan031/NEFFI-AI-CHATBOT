"""
Neffi Rule-Based Clinical Router v3
Strict general detection + flexible English keyword matching
Extended keyword patches loaded from extended_keywords.py
"""
try:
    from extended_keywords import EXTENDED_KEYWORDS
except ImportError:
    EXTENDED_KEYWORDS = {}


# ── Only EXPLICITLY general messages ────────────────────────────────────────
PURE_GREETINGS    = ["hello","hi there","hey there","good morning","good evening","good night","how are you","how r u","what's up","wassup"]
NEFFI_QUESTIONS   = ["who are you","what are you","what is neffi","introduce yourself","your name"]
ENTERTAINMENT     = [
    "tell me a joke", "give me a joke", "hear a joke", "another joke", 
    "tell me another joke", "give me another joke", "punchline", "tell me the punchline", 
    "something funny", "entertain me", "make me laugh", "fun fact",
    "give me a puzzle", "another puzzle", "give me another puzzle", 
    "show me the solution", "show me the answer", "solve a puzzle", "solve a riddle",
    "suggest music", "play me a song", "play a song", "calming song", 
    "another song", "lofi or nature sounds", "lofi sounds", "nature sounds",
    "tell me a story", "comforting story", "another story", "continue the story", 
    "tell me another story"
]
EDUCATIONAL       = ["what is depression","what is anxiety","what is therapy","what is cbt","what is dbt","what is ptsd","what is ocd","what is mental health","how does therapy work","explain depression","explain anxiety"]
THANKS_SHORT      = ["thank you","thanks so much","you helped","great session","you're amazing"]

def is_general_conversation(msg: str) -> bool:
    """
    STRICT whitelist-only. Only returns True for EXPLICITLY casual messages.
    Any clinical or emotional content → False.
    """
    msg_lower = msg.lower().strip()
    words     = msg_lower.split()

    # Pure greeting (≤4 words AND contains a greeting)
    if len(words) <= 4 and any(g in msg_lower for g in PURE_GREETINGS):
        return True
    # Questions about Neffi itself
    if any(q in msg_lower for q in NEFFI_QUESTIONS):
        return True
    # Entertainment requests
    if any(e in msg_lower for e in ENTERTAINMENT):
        return True
    # Educational questions (no personal distress)
    if any(e in msg_lower for e in EDUCATIONAL):
        return True
    # Very short thank-you (≤6 words)
    if len(words) <= 6 and any(t in msg_lower for t in THANKS_SHORT):
        return True

    return False   # Everything else → clinical routing


# ── 96 clinical state rules ──────────────────────────────────────────────────
# Keywords are SHORT and flexible so partial phrase matches work.
# Multiple short phrases > one long exact phrase.
CLINICAL_STATE_RULES = [

    # DEPRESSION (1-20) ────────────────────────────────────────────────────────
    (1,  "Major Depressive Episode",         "Depression",     ["can't get out of bed","no energy left","life feels like a waste","nothing matters","every day is the same hard","hate my life","completely drained","getting up impossible","exhausted with everything","so exhausted with everything","just need someone to hear me","just need someone to listen","my mind is a mess","mind is a mess","don't want to fix anything","too exhausted to explain"]),
    (2,  "Persistent Depressive Disorder",   "Depression",     ["sad for months","sad for years","two years","always been sad","chronically low","long time feeling sad","never really happy","months of sadness"]),
    (3,  "Anhedonia",                         "Depression",     ["used to enjoy","used to love","lost interest in","nothing gives me pleasure","nothing gives me","pleasure anymore","can't feel pleasure","hobbies don't","nothing excites","used to like but now","don't enjoy anything anymore"]),
    (4,  "Hopelessness",                      "Depression",     ["no hope","no future","nothing will change","no point trying","things won't get better","life won't improve","nothing to look forward","no hope left"]),
    (5,  "Psychomotor Retardation",           "Depression",     ["moving slowly","body feels heavy","everything takes effort","slow motion","hard to move","slow to respond","speech slow","body heavy"]),
    (6,  "Cognitive Impairment (Depression)", "Depression",     ["can't focus","can't concentrate","can't remember","brain fog","poor memory","forget things easily","trouble thinking","mind is blank","forgetting"]),
    (7,  "Somatic Depression",                "Depression",     ["stomach pain","headaches for months","body aches","doctor found nothing wrong","physical pain and sad","no physical cause","pain no cause"]),
    (8,  "Atypical Depression",               "Depression",     ["feel better when","mood lifts with","oversleeping","weight gain","reactive mood","temporary happiness","sleep too much","eating more"]),
    (9,  "Melancholic Depression",            "Depression",     ["mornings are the worst","wake up hopeless","morning is hardest","no reaction to good news","worst in the morning","early morning"]),
    (10, "Agitated Depression",               "Depression",     ["can't sit still","restless and sad","pacing","inner tension","restless","agitated","unbearable tension","can't stop moving"]),
    (11, "Seasonal Affective Disorder",       "Depression",     ["rainy season","depressed in winter","seasonal mood","only in certain seasons","weather affects mood","mood crashes in rain","follows the weather"]),
    (12, "Postpartum Depression",             "Depression",     ["after my baby","baby was born","can't bond","new mother","postpartum","baby blues","don't feel like a mother","disconnected from baby"]),
    (13, "Grief-Related Depression",          "Depression",     ["grief consuming everything","grief is consuming","still can't function after loss","mourning","bereavement","grief-related","depression from grief"]),
    (14, "Existential Depression",            "Depression",     ["what's the point","why am i alive","life has no meaning","pointless existence","constant emptiness","what is life for","no purpose","why exist"]),
    (15, "Masked Depression",                 "Depression",     ["fake smile","pretend to be happy","hide my sadness","nobody knows i'm sad","laugh outside","mask my feelings","completely broken","broken inside","completely broken inside","broken inside but laughing"]),
    (16, "Treatment-Resistant Depression",    "Depression",     ["tried three therapists","tried therapy","tried medication","years of treatment","nothing has worked","multiple therapists","antidepressants didn't work","treatment isn't working"]),
    (17, "Self-Loathing",                     "Depression",     ["hate myself","i'm worthless","nobody likes me","i'm a failure","loathe myself","useless person","can't stand myself"]),
    (18, "Emotional Numbness",                "Depression",     ["feel nothing","feel absolutely nothing","no emotions","can't cry","emotionally empty","like a robot","no feelings","disconnected from feelings","numb"]),
    (19, "Suicidal Ideation (Passive)",       "Depression",     ["wish i was dead","better off dead","wouldn't mind dying","wish i could disappear","don't want to exist","tired of living","passive death wish","wouldn't mind if accident","better off without me","better off if i wasn't here","everyone would be better off","sleep and never wake","never wake up","no way out for me","there is no way out","don't want to be here anymore","want to disappear forever","can't take the pain anymore","just want it to stop"]),
    (20, "Suicidal Ideation (Active)",        "Depression",     ["going to take my pills","take the pills","entire bottle","bottle right now","planning to die","going to end it","suicide plan","decided to end my life","sleeping pills tonight","made up my mind to die","going to kill myself","end my life tonight","have a plan to die"]),

    # ANXIETY (21-35) ──────────────────────────────────────────────────────────
    (21, "Generalized Anxiety Disorder",      "Anxiety",        ["constantly worried about everything","anxious all the time","can't stop worrying about everything","worry for no reason","generalized fear","always anxious","worried about everything"]),
    (22, "Social Anxiety",                    "Anxiety",        ["terrified to talk to people","scared to talk","fear of being judged","scared of judgment","they'll judge me","what people think","talking to people scares me","social situations scary","buying groceries overwhelming"]),
    (23, "Panic Attack",                      "Anxiety",        ["heart started racing","couldn't breathe","heart pounding","thought i was having a heart attack","chest tightened","gasping","sudden inability to breathe","panic attack","shaking suddenly","hands are trembling","hands trembling","chest feels so tight","can't take a full breath","feel like i'm going to pass out","going to pass out","chest is tight","can't breathe properly","shortness of breath","feel faint","dizzy and breathless"]),
    (24, "Anticipatory Anxiety",              "Anxiety",        ["presentation tomorrow","dreading","exam tomorrow","scared about upcoming","upcoming event fear","nervous about future event","struggling to breathe before event"]),
    (25, "Health Anxiety",                    "Anxiety",        ["googled my symptoms","convinced i have a disease","brain tumor","doctor said fine but i don't believe","fear of illness","hypochondria","scared i'm sick"]),
    (26, "Separation Anxiety",                "Anxiety",        ["partner went away","partner went to another city","can't stop worrying about their safety","worrying about their safety","feel lost without them","fear of separation","partner safety","worried when partner leaves"]),
    (27, "Performance Anxiety",               "Anxiety",        ["mind went blank on stage","hands were shaking","couldn't speak on stage","stage fright","blank during exam","perform under pressure","interview anxiety","freeze on stage"]),
    (28, "Agoraphobia",                       "Anxiety",        ["scared of crowded","can't escape","staying home to avoid","stuck inside","fear of open spaces","trapped outside","crowds feel impossible"]),
    (29, "Intrusive Thoughts",                "Anxiety",        ["horrible unwanted thoughts","thoughts about hurting","can't stop the bad thoughts","intrusive images","disturbing thoughts keep coming","thoughts i don't want"]),
    (30, "Rumination",                        "Anxiety",        ["keep replaying","overthinking the past","can't stop analyzing","circular thinking","replay old events","overthink past mistakes","stuck analyzing","replaying an argument"]),
    (31, "Hypervigilance",                    "Anxiety",        ["always on high alert","slightest sound makes me jump","can never relax","startled easily","scanning for danger","on edge all the time","jumpy","constantly alert"]),
    (32, "Catastrophizing",                   "Anxiety",        ["entire career is ruined","one mistake ruins everything","life is over","worst case scenario","convinced everything will go wrong","catastrophe","jumping to worst conclusion"]),
    (33, "Existential Anxiety",               "Anxiety",        ["how vast the universe","how meaningless we are","overwhelmed by existence","existential panic","anxious about life meaning","scared of death size","panic about existence"]),
    (34, "Financial Anxiety",                 "Anxiety",        ["loan emi","can't pay bills","debt stress","financial stress","money problems","worried about money","monthly rent","can't afford bills","salary stress","loan repayment"]),
    (35, "Relationship Anxiety",              "Anxiety",        ["partner didn't reply","convinced they'll leave me","clingy in relationship","need reassurance","fear partner will leave","attachment insecurity","scared partner leaving"]),

    # ATTRITION RISK (36-50) ───────────────────────────────────────────────────
    (36, "Therapy Disengagement",             "Attrition Risk", ["tried everything in therapy","nothing works in therapy","done with therapy","therapy is useless","complete waste of time","quit therapy","therapy isn't working"]),
    (37, "Session Dropout Risk",              "Attrition Risk", ["don't want to go to session","looking for excuse to cancel","thinking of skipping","avoid the session","cancel therapy","don't want to attend"]),
    (38, "Low Motivation to Continue",        "Attrition Risk", ["no motivation to try","no motivation to actually try","understand but can't apply","know what to do but won't","can't practice it","understand what you say but can't"]),
    (39, "Therapeutic Alliance Rupture",      "Attrition Risk", ["you don't understand me","talking to you is useless","you never get it","no point talking to you","therapist doesn't help","pointless and frustrating"]),
    (40, "Skill Practice Avoidance",          "Attrition Risk", ["breathing exercises don't work","techniques don't suit","exercises you gave me","skills don't work for me","can't do the breathing"]),
    (41, "Homework Non-Compliance",           "Attrition Risk", ["didn't do the journal","haven't done homework","forgot to practice","didn't open the notebook","didn't complete the task","journal last week but didn't","asked me to journal","didn't even open"]),
    (42, "Ambivalence About Treatment",       "Attrition Risk", ["not sure if i need therapy","not sure if i even need","maybe i should stop","wondering if this helps","unsure about continuing therapy","do i even need this","maybe stop coming","not sure if i need this"]),
    (43, "Passive Resistance",                "Attrition Risk", ["yeah okay sure","i guess so","doesn't matter","whatever you say","not really","i don't know","okay sure"]),
    (44, "Information Overload Fatigue",      "Attrition Risk", ["too much information","brain is full","can't process all of it","too many techniques","information overload","so many concepts"]),
    (45, "Digital Therapy Burnout",           "Attrition Risk", ["staring at a screen for therapy","staring at a screen for virtual","online format is draining","virtual therapy exhausting","screen fatigue therapy","online therapy tired","screen for therapy is draining"]),
    (46, "Stigma-Related Withdrawal",         "Attrition Risk", ["find out i'm in therapy","find out about my therapy","people will judge me for therapy","scared about therapy being found out","embarrassed about therapy","therapy is taboo","hide that i'm in therapy","weak for being in therapy"]),
    (47, "Logistical Barriers",               "Attrition Risk", ["work shift changed","can't make time for sessions","schedule doesn't allow","transport problem","timing issue","cannot attend"]),
    (48, "Loss of Hope in Treatment",         "Attrition Risk", ["treatment won't fix me","nothing can fix me","given up on getting better","treatment hopeless","therapy won't change anything"]),
    (49, "Premature Termination Risk",        "Attrition Risk", ["feeling better so stop therapy","feeling much better so","stop therapy for now","think i'm okay now so stopping","i'll stop therapy for now","feeling okay so quitting","feeling good so stopping therapy"]),
    (50, "Re-Engagement Opportunity",         "Attrition Risk", ["thinking of restarting","come back to sessions","returning to therapy","can i come back","resume sessions","stopped and want to start again"]),

    # TRAUMA & STRESS (51-62) ──────────────────────────────────────────────────
    (51, "Acute Stress Reaction",             "Trauma & Stress",["just witnessed","yesterday's accident","hands won't stop shaking","can't form words","recent traumatic","fresh shock","just happened to me"]),
    (52, "PTSD Flashback",                    "Trauma & Stress",["takes me right back","body freezes","flashback","reliving","happening again","memory floods back","triggered by sound","car screech takes me back"]),
    (53, "Complex Trauma",                    "Trauma & Stress",["abused throughout my childhood","abused throughout childhood","whole body carries that trauma","whole body carries trauma","can't trust anyone","childhood abuse","long-term abuse","history of abuse"]),
    (54, "Emotional Dysregulation",           "Trauma & Stress",["explode over the smallest things","explode over smallest","lose complete control of my emotions","lose complete control of emotions","emotions out of control","overreact","lose control","feel terrible after outburst"]),
    (55, "Dissociation",                      "Trauma & Stress",["watching myself from outside","not in my body","out of body","unreal feeling","feel detached","not really here","like i'm floating","zoning out"]),
    (56, "Shame Response",                    "Trauma & Stress",["absolutely shameful","i'm a disgusting person","deeply ashamed","shame about","feel shameful","ashamed of what i did"]),
    (57, "Guilt Response",                    "Trauma & Stress",["it's my fault","i caused all this","blame myself","i should have","my mistake caused","guilt is destroying me","caused this pain"]),
    (58, "Betrayal Trauma",                   "Trauma & Stress",["trusted person betrayed me","betrayed completely","can never trust anyone","trust broken by someone close","deceived by someone i loved","betrayed my trust","completely betrayed my trust","friend betrayed me","smash my screen","ridiculously furious","so furious"]),
    (59, "Abandonment Fear",                  "Trauma & Stress",["terrified everyone will leave","fear of abandonment","everyone leaves me","submissive so they won't leave","desperate to keep people","people always abandon me"]),
    (60, "Rejection Sensitivity",             "Trauma & Stress",["tiniest criticism breaks me","can't handle any rejection","even small rejection devastates","hypersensitive to rejection","criticism hurts intensely"]),
    (61, "Hyperarousal",                      "Trauma & Stress",["always in fight mode","slightest noise makes me angry","body always tense","can never switch off","persistent tension","constantly activated","body fight mode"]),
    (62, "Avoidance Behavior",                "Trauma & Stress",["haven't been near that street","avoid anything that reminds me","avoiding triggers","can't go back there","avoid reminders","five years avoiding"]),

    # INTERPERSONAL (63-74) ────────────────────────────────────────────────────
    (63, "Loneliness",                        "Interpersonal",  ["feel completely alone","nobody understands me","isolated","surrounded by people but lonely","no real connection","feel disconnected from everyone"]),
    (64, "Social Withdrawal",                 "Interpersonal",  ["stopped picking up calls","avoid everyone","don't feel like talking","cut off from people","isolating myself","avoiding people","not talking to anyone"]),
    (65, "Conflict Avoidance",                "Interpersonal",  ["don't speak up to avoid","suppress feelings to keep peace","avoid any conflict","adjust to avoid argument","don't say anything to avoid fight"]),
    (66, "Codependency",                      "Interpersonal",  ["happiness depends on my partner","lost myself in them","no identity without","can't live without them","enmeshed","my life is nothing without"]),
    (67, "Attachment Anxiety",                "Interpersonal",  ["constantly check if partner replied","terrified they'll leave","need reassurance every hour","clingy","check their messages constantly"]),
    (68, "Attachment Avoidance",              "Interpersonal",  ["push people away when close","scared of intimacy","emotionally unavailable","distance when close","avoid deep connection","fear of closeness"]),
    (69, "Boundary Difficulties",             "Interpersonal",  ["can't say no","people take advantage","no limits","people pleaser","yes to everything","others use me","can't set limits"]),
    (70, "Communication Breakdown",           "Interpersonal",  ["they completely misunderstand","misunderstood every time","conversation turns into a fight","can't communicate","words get twisted","explain but they misunderstand"]),
    (71, "Family System Stress",              "Interpersonal",  ["parents fight constantly at home","parents fight constantly","toxic home environment","family conflict","home is toxic","parents fighting","unhealthy family","stressful home","environment is toxic at home"]),
    (72, "Workplace Conflict",                "Interpersonal",  ["manager is toxic","boss takes credit","office politics","toxic work environment","workplace conflict","hostile workplace","work politics"]),
    (73, "Romantic Relationship Distress",    "Interpersonal",  ["broke up","miss my ex","relationship problems","partner fight","separation","marriage issues","heartbreak","miss them every second"]),
    (74, "Grief and Loss",                    "Interpersonal",  ["passed away","someone passed","father passed","can't accept they're gone","miss them deeply","never hear their voice again","never hear his voice","grief is unbearable","lost someone dear"]),

    # POSITIVE STATES (75-88) ──────────────────────────────────────────────────
    (75, "Positive Reframing",                "Positive State", ["lesson in all of this","there's a lesson","finding meaning","finding meaning in struggle","silver lining","growth mindset","turning it around","meaning from hardship","believe there's a lesson"]),
    (76, "Gratitude",                         "Positive State", ["feel so grateful","i'm so grateful","so thankful","friend checked on me","genuinely grateful","appreciate what i have","counting my blessings","grateful they took the time"]),
    (77, "Progress Acknowledgment",           "Positive State", ["i've grown","i'm getting better","noticed improvement","not the same as before","can manage now","things are improving"]),
    (78, "Motivation",                        "Positive State", ["felt like going outside","want to try something new","have energy now","feel motivated","ready to move forward","feel inspired"]),
    (79, "Relief",                            "Positive State", ["burden finally lifted","feel so much lighter","stress is gone","weight lifted","finally over","feeling of relief","relieved now"]),
    (80, "Hope",                              "Positive State", ["feel confident things will improve","confident that things","finally going to improve","believe things will get better","optimistic about tomorrow","see a way forward","things are improving for me","things will get better for me"]),
    (81, "Mindfulness",                       "Positive State", ["staying in present moment","notice my thoughts","don't get swept away","mindful","being present","watching thoughts pass","not ruminating"]),
    (82, "Social Connection",                 "Positive State", ["felt genuinely connected","not as alone as i thought","sense of belonging","friends helped me feel","bonded with someone"]),
    (83, "Self-Compassion",                   "Positive State", ["done being hard on myself","i'm human","treating myself with kindness","forgiving myself","self-compassion","being gentle with myself"]),
    (84, "Resilience",                        "Positive State", ["i got back up","i have inner strength","i survived","bounced back","i can recover","stronger than i thought"]),
    (85, "Acceptance",                        "Positive State", ["accepted my illness","making peace with it","coming to terms","letting go","at peace with the situation","accepted the diagnosis"]),
    (86, "Empowerment",                       "Positive State", ["taking back control","nobody decides my future","my choices","taking charge","feel powerful","own my decisions","in charge of my life"]),
    (87, "Insight/Breakthrough",              "Positive State", ["suddenly understand why","now i see why","had a realization","breakthrough moment","makes sense now","clarity about my behaviour"]),
    (88, "Post-Traumatic Growth",             "Positive State", ["stronger after the accident","grew from pain","trauma taught me","life changed positively after","understand life's worth after","understand what life is truly worth","finally understand what life"]),

    # PHYSICAL-MENTAL (89-96) ──────────────────────────────────────────────────
    (89, "Sleep Disturbance",                 "Physical-Mental",["haven't slept properly","lie awake for hours","wake up multiple times","insomnia","sleep problems","can't fall asleep","nightmares","no sleep"]),
    (90, "Appetite Change",                   "Physical-Mental",["no appetite","lost appetite","haven't eaten","food doesn't appeal","skipping meals","not eating","stress eating","eating too little"]),
    (91, "Fatigue/Burnout",                   "Physical-Mental",["completely burned out","body and mind empty","running on nothing","total exhaustion","burned out","running on fumes","no energy at all"]),
    (92, "Chronic Pain-Linked Depression",    "Physical-Mental",["chronic back pain","chronic pain","pain making me depressed","life stuck because of pain","pain every day","long-term pain","diagnosed with a chronic illness","chronic illness that has no cure","has no cure","no cure","in physical pain for the rest of my life","rest of my life in pain","physical pain forever","illness with no cure","don't know how to accept this illness","accept this diagnosis"]),
    (93, "Substance Use Risk",                "Physical-Mental",["drink every night","drinking to cope","can't stop drinking","substance abuse","alcohol dependency","smoking to cope","addicted to"]),
    (94, "Self-Harm Risk",                    "Physical-Mental",["urge to cut myself","urge to self-harm","been cutting","hurting myself","self-harm urge","scratch or cut","cut myself","want to cut"]),
    (95, "Psychosomatic Symptoms",            "Physical-Mental",["get stressed and stomach hurts","get stressed my stomach","stress causes headache","body reacts to stress","tension headache","anxiety stomach","doctors say nothing is wrong physically","doctors say nothing wrong physically"]),
    (96, "Suicidal Crisis (Immediate)",       "Physical-Mental",["blade in my hand","going to cut now","ending it right now","killing myself tonight","i'm going to cut","don't want to be in this world","blade right now"]),
]

SOS_STATES = {19, 20, 94, 96}


def rule_based_route(patient_message: str, bert_emotion: str = "") -> dict:
    msg = patient_message.lower()

    if is_general_conversation(patient_message):
        return {"state_number": 0, "state_name": "General Conversation",
                "category": "General", "severity": 0, "is_sos": False,
                "clinical_insight": "Casual conversation - respond warmly."}

    best_match = None
    best_score = 0

    for state_num, state_name, category, keywords in CLINICAL_STATE_RULES:
        # Core keywords
        score = sum(1 for kw in keywords if kw.lower() in msg)
        # Extended keywords (double weight for specificity)
        ext = EXTENDED_KEYWORDS.get(state_name, [])
        score += sum(2 for kw in ext if kw.lower() in msg)
        if score > best_score:
            best_score = score
            best_match = (state_num, state_name, category)

    if best_match is None or best_score == 0:
        bert_lower = bert_emotion.lower()
        if "fear" in bert_lower:
            best_match = (21, "Generalized Anxiety Disorder", "Anxiety")
        elif "anger" in bert_lower:
            best_match = (54, "Emotional Dysregulation", "Trauma & Stress")
        elif "joy" in bert_lower:
            best_match = (80, "Hope", "Positive State")
        else:
            best_match = (1, "Major Depressive Episode", "Depression")

    state_num, state_name, category = best_match
    severity = min(10, max(2, best_score))
    is_sos = state_num in SOS_STATES
    return {"state_number": state_num, "state_name": state_name,
            "category": category, "severity": severity,
            "is_sos": is_sos, "clinical_insight": f"Matched: {state_name} (score={best_score})"}
