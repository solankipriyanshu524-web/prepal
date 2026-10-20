import os
import json
import uuid
import datetime
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")

def _ensure_file():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

def get_all_history() -> List[Dict[str, Any]]:
    _ensure_file()
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_interview_session(data: Dict[str, Any]) -> Dict[str, Any]:
    _ensure_file()
    history = get_all_history()
    
    session_id = str(uuid.uuid4())[:8]
    record = {
        "id": session_id,
        "createdAt": datetime.datetime.now().isoformat(),
        "role": data.get("candidateRole") or data.get("role", "Software Engineer"),
        "level": data.get("level", "Mid-Level"),
        "problem": data.get("problem", "Technical Assessment"),
        "overallScore": data.get("scorecard", {}).get("overallScore", 0),
        "verdict": data.get("scorecard", {}).get("verdict", "Completed"),
        "metrics": data.get("scorecard", {}).get("metrics", {}),
        "scorecard": data.get("scorecard", {}),
        "code": data.get("code", "")
    }

    # Prepend newest first
    history.insert(0, record)

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return record

def get_session_by_id(session_id: str) -> Optional[Dict[str, Any]]:
    history = get_all_history()
    for item in history:
        if item.get("id") == session_id:
            return item
    return None
