

import time
import requests

# ---------------- CONFIG ----------------
API_BASE = "http://127.0.0.1:5000/api"
COOLDOWN = 0.8  # seconds between gestures
last_action_time = 0

# ---------------- GESTURE LOGIC ----------------
def detect_from_image(frame):
    """
    Input: frame (image from browser)
    Output: action string ("play", "pause", "next", "prev", "volume_up", "volume_down", "like", "dislike", "none")
    Logic: Same as original EXE version
    """
    global last_action_time
    import mediapipe as mp

    # --- Mediapipe Hand Detection ---
    mp_hands = mp.solutions.hands
    with mp_hands.Hands(static_image_mode=True, max_num_hands=1) as hands:
        results = hands.process(frame)

        if not results.multi_hand_landmarks:
            return "none"

        hand = results.multi_hand_landmarks[0]

        thumb_tip = hand.landmark[4]
        index_tip = hand.landmark[8]
        middle_tip = hand.landmark[12]
        ring_tip = hand.landmark[16]
        pinky_tip = hand.landmark[20]
        wrist = hand.landmark[0]

        current_time = time.time()
        if current_time - last_action_time < COOLDOWN:
            return "none"

        # Open palm -> Play
        if all([thumb_tip.y < index_tip.y,
                index_tip.y < middle_tip.y,
                middle_tip.y < ring_tip.y,
                ring_tip.y < pinky_tip.y]):
            last_action_time = current_time
            return "play"

        # Fist -> Pause
        if all([thumb_tip.y > index_tip.y,
                index_tip.y > middle_tip.y,
                middle_tip.y > ring_tip.y,
                ring_tip.y > pinky_tip.y]):
            last_action_time = current_time
            return "pause"

        # Swipe right -> Next
        if index_tip.x - wrist.x > 0.25:
            last_action_time = current_time
            return "next"

        # Swipe left -> Previous
        if index_tip.x - wrist.x < -0.25:
            last_action_time = current_time
            return "prev"

        # Pinch out -> Volume up
        pinch_dist = abs(thumb_tip.x - index_tip.x)
        if pinch_dist > 0.18:
            last_action_time = current_time
            return "volume_up"

        if pinch_dist < 0.04:
            last_action_time = current_time
            return "volume_down"

        # Thumb up -> Like
        if thumb_tip.y < index_tip.y - 0.05:
            last_action_time = current_time
            return "like"

        # Thumb down -> Dislike
        if thumb_tip.y > index_tip.y + 0.1:
            last_action_time = current_time
            return "dislike"

    return "none"

# ---------------- SEND ACTION TO SERVER ----------------
def send_action(action):
    if action == "none":
        return
    try:
        requests.post(f"{API_BASE}/{action}")
    except:
        pass
