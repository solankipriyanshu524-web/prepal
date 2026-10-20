# 🚀 PrepPal Deployment Guide

PrepPal is a full-stack platform consisting of:
- **Frontend**: React 19 + Tailwind CSS + Monaco Editor (Vite SPA)
- **Backend**: FastAPI + Uvicorn + Subprocess Code Runner + ReportLab PDF Generator

Because FastAPI is configured to automatically serve the built frontend assets from `/dist`, you can deploy the entire application as **one single unified service** (no CORS issues, 1 URL, free tier friendly) or **split across two services** (e.g., Vercel + Render).

---

## 🌟 Recommended: Option 1 — Single Full-Stack App on Render (Free)

Deploy everything on Render with one click or a few fields.

### Method A: Using Docker (Most Reliable — handles Python + Node for code runner)
1. Push your repository to **GitHub** or **GitLab**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
3. Select your repository.
4. Set the following fields:
   - **Name**: `prepal`
   - **Environment / Runtime**: `Docker`
   - **Region**: Any (e.g., Oregon or Frankfurt)
   - **Branch**: `main`
   - **Plan**: `Free`
5. (Optional) In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Optional, your Google Gemini API key)*
   - `OPENAI_API_KEY`: *(Optional, your OpenAI key)*
6. Click **Deploy Web Service**.
   Render will build the multi-stage Docker container and give you a live URL like `https://prepal-xxxx.onrender.com`.

---

## ⚡ Option 2 — Deploy with Railway

1. Push your code to GitHub.
2. Sign in to [Railway](https://railway.com/).
3. Click **New Project** ➔ **Deploy from GitHub repo**.
4. Select your `prepal` repository.
5. Railway will automatically detect the [Dockerfile](file:///c:/prepal/Dockerfile) and build both the frontend and backend.
6. Under your service **Settings** ➔ **Networking**, click **Generate Domain** to get a public URL.

---

## 🌐 Option 3 — Decoupled: Vercel (Frontend) + Render (Backend)

If you prefer hosting the React frontend on Vercel's global CDN:

### 1. Deploy the Backend to Render or Railway
- Deploy the repository as a Python Web Service on Render:
  - **Build Command**: `pip install -r backend/requirements.txt`
  - **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Copy your backend URL: e.g. `https://prepal-backend.onrender.com`

### 2. Deploy the Frontend to Vercel
1. Import your repository into [Vercel](https://vercel.com/).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. In [vercel.json](file:///c:/prepal/vercel.json), add your backend URL to proxy `/api/*` requests:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://prepal-backend.onrender.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**.

---

## 🐳 Option 4 — Self-Hosted / VPS with Docker Compose

To run PrepPal on any Linux VPS (Ubuntu, Debian, DigitalOcean, AWS EC2, Linode):

1. Clone your repo:
   ```bash
   git clone <your-repo-url> prepal
   cd prepal
   ```
2. Run with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
3. Open `http://<your-server-ip>:8000` in your browser.

---

## ⚙️ Environment Variables Summary

| Variable | Required? | Description |
|---|---|---|
| `PORT` | Auto-set by cloud | Web server port (defaults to 8000) |
| `GEMINI_API_KEY` | Optional | Server-side Gemini API key (users can also input in the web UI) |
| `OPENAI_API_KEY` | Optional | Server-side OpenAI API key |

---

## 🔍 Verifying the Deployment

Once deployed, test that all subsystems are operational:
- **Frontend SPA**: `https://<your-app-url>/`
- **Backend Health Check**: `https://<your-app-url>/api/health`
- **Swagger Documentation**: `https://<your-app-url>/docs`
