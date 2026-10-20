import os
import sys
import io
import datetime

# Ensure backend directory is in sys.path regardless of working directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from code_runner import execute_code
from pdf_generator import generate_scorecard_pdf
from ai_gateway import get_interviewer_response
from history_service import get_all_history, save_interview_session, get_session_by_id

app = FastAPI(
    title="PrepPal AI Backend API",
    description="Full-stack FastAPI backend for PrepPal: Sandboxed code runner, ReportLab PDF scorecard generator, AI interview gateway, and interview history.",
    version="1.0.0"
)

# CORS setup for Vite frontend (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class CodeRunRequest(BaseModel):
    language: str
    code: str
    timeout_seconds: Optional[float] = 5.0

class ChatMessage(BaseModel):
    role: str
    text: str
    timestamp: Optional[str] = None

class InterviewChatRequest(BaseModel):
    provider: Optional[str] = "demo"
    apiKey: Optional[str] = ""
    messages: List[Dict[str, Any]] = []
    currentCode: Optional[str] = ""
    problem: Optional[Dict[str, Any]] = None
    role: Optional[str] = "Full-Stack Engineer"
    level: Optional[str] = "Mid-Level"
    phase: Optional[str] = "clarify"
    timeRemaining: Optional[str] = "45:00"
    ollamaModel: Optional[str] = "llama3.2"
    ollamaUrl: Optional[str] = "http://localhost:11434"

class ScorecardPdfRequest(BaseModel):
    candidateRole: Optional[str] = "Full-Stack Engineer"
    level: Optional[str] = "Mid-Level"
    problem: Optional[str] = "Two Sum II"
    scorecard: Dict[str, Any]
    code: Optional[str] = ""

class HistorySaveRequest(BaseModel):
    candidateRole: Optional[str] = "Full-Stack Engineer"
    level: Optional[str] = "Mid-Level"
    problem: Optional[str] = "Two Sum II"
    scorecard: Dict[str, Any]
    code: Optional[str] = ""

@app.get("/api")
def read_root():
    return {
        "platform": "PrepPal AI Backend Suite",
        "status": "online",
        "docs_url": "/docs",
        "endpoints": [
            "/api/health",
            "/api/run-code",
            "/api/scorecard/pdf",
            "/api/interview/chat",
            "/api/history"
        ]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "runners": ["python 3.12", "nodejs"],
        "pdf_engine": "reportlab"
    }

@app.post("/api/run-code")
def run_code_endpoint(req: CodeRunRequest):
    """
    Executes Python or JavaScript code inside an isolated subprocess with a strict timeout.
    """
    result = execute_code(
        language=req.language,
        code=req.code,
        timeout_seconds=req.timeout_seconds or 5.0
    )
    return result

@app.post("/api/interview/chat")
def interview_chat_endpoint(req: InterviewChatRequest):
    """
    AI Tech Lead Interviewer chat completion gateway.
    """
    reply = get_interviewer_response(req.model_dump())
    return {"reply": reply}

@app.post("/api/scorecard/pdf")
def create_scorecard_pdf(req: ScorecardPdfRequest):
    """
    Generates and returns an official, printable FAANG-style interview evaluation PDF.
    """
    try:
        pdf_buffer = generate_scorecard_pdf(req.model_dump())
        filename = f"prepal-scorecard-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@app.get("/api/history")
def list_history():
    """
    Returns all stored interview sessions and scorecards.
    """
    return get_all_history()

@app.post("/api/history")
def save_history(req: HistorySaveRequest):
    """
    Saves a completed interview session.
    """
    saved = save_interview_session(req.model_dump())
    return {"success": True, "session": saved}

@app.get("/api/history/{session_id}")
def get_history_detail(session_id: str):
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
# Production SPA Static File Serving
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))

if os.path.isdir(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API or docs routes
        if full_path.startswith("api") or full_path in ("docs", "openapi.json", "redoc"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        target_file = os.path.join(DIST_DIR, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    def serve_placeholder():
        return {
            "platform": "PrepPal AI Backend Suite",
            "status": "online",
            "message": "Frontend not built yet. Run 'npm run build' or access /api for backend endpoints.",
            "docs_url": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
