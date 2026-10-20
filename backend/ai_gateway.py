import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List

HUMAN_INTERVIEWER_PROMPT = """You are Alex, an authentic Staff Software Engineer & Hiring Bar Raiser at a tier-1 tech firm (Google/Meta standard) conducting a live interview for a {level} {role}.
Time Remaining: {time_remaining}
Current Round Stage: {phase}

The candidate's current code in the Monaco Editor:
```
{current_code}
```

CRITICAL INTERVIEWER DIRECTIVES:
1. EXTREME BREVITY (2 TO 3 SENTENCES ONLY):
   - This is an active voice interview. Limit your response to 2 to 3 concise, conversational sentences maximum.
2. GROUNDED IN CODE & REALITY:
   - Always acknowledge and base your reply on the candidate's actual code in the editor above.
3. NEVER GIVE PREMATURE PRAISE OR FINAL EVALUATIONS:
   - Keep probing for edge cases, tradeoffs, and pointer movements.
"""

def call_gemini(api_key: str, prompt: str, system_instruction: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 300
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        result = json.loads(response.read().decode("utf-8"))
        candidate = result.get("candidates", [{}])[0]
        parts = candidate.get("content", {}).get("parts", [{}])
        return parts[0].get("text", "").strip()

def call_ollama(ollama_url: str, model: str, prompt: str, system_instruction: str) -> str:
    url = f"{ollama_url.rstrip('/')}/api/generate"
    payload = {
        "model": model or "llama3.2",
        "prompt": f"System: {system_instruction}\n\nUser: {prompt}",
        "stream": False
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req, timeout=15) as response:
        result = json.loads(response.read().decode("utf-8"))
        return result.get("response", "").strip()

def call_openai(api_key: str, messages: List[Dict[str, str]], system_instruction: str) -> str:
    url = "https://api.openai.com/v1/chat/completions"
    formatted_messages = [{"role": "system", "content": system_instruction}]
    for m in messages[-6:]:
        formatted_messages.append({"role": m.get("role", "user"), "content": m.get("text", "")})

    payload = {
        "model": "gpt-4o-mini",
        "messages": formatted_messages,
        "temperature": 0.5,
        "max_tokens": 250
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        result = json.loads(response.read().decode("utf-8"))
        return result["choices"][0]["message"]["content"].strip()

def get_interviewer_response(data: Dict[str, Any]) -> str:
    provider = data.get("provider", "demo")
    api_key = data.get("apiKey") or os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY", "")
    messages = data.get("messages", [])
    current_code = data.get("currentCode", "// (Blank)")
    role = data.get("role", "Full-Stack Engineer")
    level = data.get("level", "Mid-Level")
    phase = data.get("phase", "clarify")
    time_remaining = data.get("timeRemaining", "45:00")
    ollama_model = data.get("ollamaModel", "llama3.2")
    ollama_url = data.get("ollamaUrl", "http://localhost:11434")

    system_instruction = HUMAN_INTERVIEWER_PROMPT.format(
        role=role,
        level=level,
        phase=phase,
        time_remaining=time_remaining,
        current_code=current_code
    )

    last_user_msg = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_msg = m.get("text", "")
            break

    # 1. Ollama
    if provider == "ollama":
        try:
            return call_ollama(ollama_url, ollama_model, last_user_msg, system_instruction)
        except Exception as e:
            return f"Ollama local connection error ({str(e)}). Make sure Ollama is running on {ollama_url}."

    # 2. Gemini
    if provider == "gemini" and api_key:
        try:
            return call_gemini(api_key, last_user_msg, system_instruction)
        except Exception as e:
            pass # fallback to smart response

    # 3. OpenAI
    if provider == "openai" and api_key:
        try:
            return call_openai(api_key, messages, system_instruction)
        except Exception as e:
            pass # fallback to smart response

    # Default Intelligent Demo / Smart Fallback
    text_lower = last_user_msg.lower()
    if "why" in text_lower and ("two" in text_lower or "pointer" in text_lower):
        return "Two Pointers work here because the input array is sorted. By adjusting the left and right pointers based on whether the sum is too small or too large, we eliminate a search dimension and achieve optimal O(n) linear time with O(1) space."
    if "hint" in text_lower or "stuck" in text_lower:
        return "Think about the extremes: if numbers[left] + numbers[right] is greater than our target, which pointer should move inward to reduce the total sum?"
    if "check" in text_lower or "review" in text_lower or "code" in text_lower:
        if "while" in current_code:
            return "I see your while loop structure in Monaco Editor! Click 'Run Code Sandbox' to test it against our test cases. How will you handle duplicate values or negative inputs?"
        return "I see the function signature, but your loop body is still empty. Go ahead and initialize your pointer bounds and while condition."

    return "Good reasoning. Walk me through your pointer movement logic step-by-step before executing the test suite."
