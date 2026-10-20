# 🚀 PrepPal — AI Technical Interview & Live Coding Platform

> An adaptive, multimodal AI mock interview platform featuring real-time speech recognition (STT), voice synthesis (TTS), embedded Monaco code editor, interactive system design whiteboard, and comprehensive Big-O scorecard evaluation.

---

## 🌟 Key Features

1. **🎙️ Multimodal Voice & Audio Engine**:
   - **Speech-to-Text (STT)**: Real-time browser speech recognition via Web Speech API (`webkitSpeechRecognition`).
   - **Text-to-Speech (TTS)**: AI Lead (Alex) dynamically speaks questions and follow-ups with natural speech synthesis.
   - **Live Audio Waveform**: Visualizer animating speaking, listening, and thinking states.

2. **👁️ Proactive "Over-the-Shoulder" AI Observer (Standout Feature)**:
   - **Real-Time Code Anomaly Detector**: Proactively spots quadratic $O(N^2)$ nested loops, infinite loop hazards (missing pointer increments), and static return values *while you type*.
   - **Inactivity & Stuck Nudges**: If no code or speech activity occurs for 50s, Alex chimes in softly with Socratic guidance instead of leaving the candidate stranded.
   - **Realistic FAANG Scale Curveballs**: Introduces distributed scaling constraints (e.g., 100GB out-of-core streaming) once the basic sandbox tests pass.
   - **Interactive Co-Pilot Controls**: Toggleable observer HUD badge with animated beacon, Monaco notification alert tray, and one-click response action chips (`Explain Approach`, `Need a Hint`, `Got It, Fixing`).

3. **🧠 Dual AI Engine (Cloud + Local Offline)**:
   - **Google Gemini 1.5 Flash**: Lightning-fast cloud responses with generous free tier.
   - **Ollama (Local LLM)**: Zero cloud cost, 100% privacy-first execution with `llama3.2` on `http://localhost:11434`.
   - **Interactive Demo Simulator**: Instant test-drive without requiring any API keys or local downloads.
   - **OpenAI GPT-4o-mini**: Standard OpenAI API integration.

4. **💻 Embedded Monaco Code Sandbox**:
   - VS Code Monaco Editor with JavaScript & Python syntax highlighting.
   - Live browser sandbox runtime with interactive console output tray.

5. **📐 System Design Architecture Whiteboard**:
   - Freehand sketch, rectangle, circle, and connector tools.
   - One-click **System Design Node Stamps** (`+ Client`, `+ Load Balancer`, `+ API Gateway`, `+ Redis Cache`, `+ PostgreSQL DB`).
   - Export whiteboard as high-res PNG.

6. **📊 Comprehensive Scorecard & Report Generator**:
   - Overall Score (0-10) with hire verdict (`Strong Hire`, `Hire`, `Needs Improvement`).
   - 4-Dimension Metric Breakdown: Technical Accuracy, Code Quality, Problem Solving, Communication.
   - Estimated Time & Space Complexity (Big-O analysis).
   - Key Strengths & High-Impact Improvements.
   - Download report as JSON.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons
- **Code Editor**: `@monaco-editor/react`
- **Whiteboard**: HTML5 Canvas with custom high-DPI renderer
- **Audio / Voice**: Browser Native Web Speech API (STT & TTS)
- **AI Integrations**: Google Gemini API, Ollama (Local LLM), OpenAI API
- **Build Tool**: Vite 8

---

## ⚡ Running the Project

1. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

2. To restart the development server manually:
   ```bash
   npm run dev
   ```

---

## 🚢 Deployment

See the comprehensive [Deployment Guide](file:///c:/prepal/DEPLOYMENT.md) for 1-click cloud deployment instructions:
- **Render (Free Web Service / Docker)**
- **Railway**
- **Vercel (Frontend) + Render (Backend)**
- **Self-Hosted Docker Compose**

---

## 📄 Resume Bullet Point (Ready to Paste)

```markdown
• Developed PrepPal, a full-stack AI technical mock interview platform combining real-time speech recognition (Web Speech API), Monaco code editor, and an interactive system design whiteboard.
• Engineered a proactive "Over-the-Shoulder" AI Interviewer that observes candidate keystrokes in real-time, autonomously flagging quadratic nested loops, infinite recursion hazards, and inactivity stalls with Socratic audio guidance.
• Architected a provider-agnostic AI layer supporting Google Gemini 1.5 Flash and self-hosted open-source models (Ollama/LLaMA-3), reducing evaluation latency to < 1.5s.
• Built automated post-interview scorecard generation analyzing Big-O time/space complexity, code idiomatic structure, and communication metrics.
```
