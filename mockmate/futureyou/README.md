# FutureYou - Interactive AI Portfolio

A visually premium, recruiter-friendly web app where hiring teams can talk to **"Future Me (2030)"** - an AI persona powered by a **LangChain RAG** pipeline over your resume, projects, achievements, and personal story.

## Why recruiters will love it

FutureYou turns a static portfolio into a conversation. Recruiters can run quick interviews, ask for clarifications, pressure-test decisions, or even switch to a **Roast Mode** to get brutally honest (but professional) feedback while the AI stays grounded in your provided materials.

## What you get

- Dark, futuristic, glassmorphism UI with neon accents
- ChatGPT-like chat experience:
  - animated message bubbles
  - character-by-character typing
  - "AI is thinking" avatar glow
  - timestamps and smooth auto-scroll
- Persona modes (toggle):
  - **🎯 Interview Mode**: recruiter-style Q&A
  - **🔥 Roast Mode**: brutally honest, actionable critique
  - **🚀 Vision Mode**: ambitious 2030 predictions & plans
- RAG pipeline:
  - loads text files (resume/projects/story/achievements)
  - chunks + OpenAI embeddings
  - stores & retrieves with FAISS
  - injects retrieved context into the prompt before answering
- Optional voice input/output via Web Speech API (front-end)
- My Journey Timeline + Demo Mode showcase
- Public-link protections:
  - IP rate limiting on `/chat`
  - optional Cloudflare Turnstile verification

## Folder structure

```
futureyou/
  backend/
    app/
      api/
      core/
      models/
      services/
      main.py
    data/
      resume.txt
      projects.txt
      achievements.txt
      story.txt
    requirements.txt
  frontend/
    package.json
    vite.config.ts
    tailwind.config.js
    postcss.config.js
    src/
      components/
      api/
      styles/
      App.tsx
      main.tsx
  README.md
```

## Run locally (quick start)

### 1) Backend (FastAPI)

1. Open a terminal in `futureyou/backend`
2. Create and activate a venv:
   - `python -m venv .venv`
   - `.\.venv\Scripts\Activate.ps1` (PowerShell)
3. Install:
   - `pip install -r requirements.txt`
4. Create `.env` from example:
   - `copy .env.example .env`
   - update `OPENAI_API_KEY` in `.env`
5. Start:
   - `uvicorn app.main:app --reload --port 8000`
6. On first start, the FAISS index will be built from `backend/data/` and cached for future runs.

### 2) Frontend (React + Tailwind)

1. Open a terminal in `futureyou/frontend`
2. Install:
   - `npm install`
3. Start dev server:
   - `npm run dev`
4. Create `.env` from example:
   - `copy .env.example .env`
5. Point the frontend to your backend (default is `http://localhost:8000`):
   - `VITE_API_URL` (optional)

Then open the frontend URL shown by Vite (typically `http://localhost:5173`).

## Deploy for LinkedIn (shareable public URL)

You need two deployments:
- `frontend` -> Vercel (public site)
- `backend` -> Render (or Railway/Fly.io) API service

### Backend deployment (Render)

1. Create a new Web Service from `futureyou/backend`
2. Start command:
   - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables:
   - `OPENAI_API_KEY=...`
   - `OPENAI_CHAT_MODEL=gpt-4o-mini`
   - `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`
   - `CORS_ALLOW_ORIGINS=https://<your-frontend-domain>`
   - `RATE_LIMIT_WINDOW_SECONDS=60`
   - `RATE_LIMIT_MAX_REQUESTS=20`
   - `TURNSTILE_REQUIRED=1` (recommended for public demo)
   - `TURNSTILE_SECRET_KEY=...` (if Turnstile enabled)

### Frontend deployment (Vercel)

1. Import `futureyou/frontend` as a Vercel project
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL=https://<your-backend-domain>`
   - `VITE_TURNSTILE_SITE_KEY=...` (optional but recommended)

### Your LinkedIn share link

Use your deployed frontend URL, for example:
- `https://futureyou-portfolio.vercel.app`

That is the link you paste in LinkedIn posts/profile.

## Security checklist before sharing publicly

- Never commit real keys in `.env.example`, code, screenshots, or chat.
- Keep `OPENAI_API_KEY` only on backend hosting env vars.
- Keep `TURNSTILE_REQUIRED=1` and rate limiting enabled for public demos.
- Set `CORS_ALLOW_ORIGINS` to your exact frontend domain in production.

## Customize the persona (RAG inputs)

Edit these files:

- `backend/data/resume.txt`
- `backend/data/projects.txt`
- `backend/data/achievements.txt`
- `backend/data/story.txt`

The AI is designed to answer using your exact provided material - so update these for best results.

