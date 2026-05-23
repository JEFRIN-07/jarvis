# JARVIS v0.1 — Setup Guide

## What You're Getting
- React frontend (Vite) on port 5173
- FastAPI backend on port 8000
- Local AI via Ollama (Mistral) — FREE, offline
- Optional Claude API for complex tasks
- Open apps, search web, memory system

---

## STEP 1 — Install Ollama (Local AI)

1. Go to: https://ollama.com/download
2. Download for Windows and install
3. Open Command Prompt and run:
   ollama pull mistral
4. Wait for download (~4GB, one time only)
5. Ollama runs automatically in background

Test it works:
   ollama run mistral
   Type "hello" and press Enter
   Press Ctrl+D to exit

---

## STEP 2 — Setup Backend

Open Command Prompt in the jarvis/backend folder:

   cd jarvis\backend
   pip install -r requirements.txt

Copy the env file:
   copy .env.example .env

Optional: Open .env and add your Claude API key
(Leave blank to use only local Mistral — works fine)

---

## STEP 3 — Setup Frontend

Open a NEW Command Prompt in jarvis/frontend folder:

   cd jarvis\frontend
   npm install

---

## STEP 4 — Run Everything

You need 2 Command Prompt windows open:

Window 1 — Backend:
   cd jarvis\backend
   uvicorn main:app --reload --port 8000

Window 2 — Frontend:
   cd jarvis\frontend
   npm run dev

---

## STEP 5 — Open Jarvis

Open your browser and go to:
   http://localhost:5173

You should see Jarvis with the dark HUD interface!

---

## Testing Jarvis

Try these commands:
- "Open Chrome"
- "Open VS Code"
- "Search AI news today"
- "Help me write a Python function"
- "Open https://youtube.com"

---

## Troubleshooting

Problem: "Ollama not running"
Fix: Open Command Prompt and run: ollama serve

Problem: Backend error on startup
Fix: Make sure all packages installed: pip install -r requirements.txt

Problem: Frontend won't start
Fix: Run: npm install (in frontend folder)

Problem: CORS error in browser
Fix: Make sure backend is running on port 8000

---

## Project Structure

jarvis/
├── backend/
│   ├── main.py              ← FastAPI server
│   ├── ai_router.py         ← Routes to local/cloud AI
│   ├── tools_executor.py    ← Opens apps, searches web
│   ├── routes/
│   │   ├── chat.py          ← Chat endpoint
│   │   ├── memory.py        ← Memory save/load
│   │   └── tools.py         ← Tool endpoints
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx           ← Main app
        ├── App.css           ← All styles
        └── components/
            ├── ChatWindow.jsx
            ├── MessageBubble.jsx
            ├── TypingIndicator.jsx
            ├── Sidebar.jsx
            └── StatusBar.jsx

---

## What's Next (v0.2)
- Voice input (Web Speech API)
- Voice output (Edge TTS)
- File reading
- Better memory
- Permission dialogs for risky actions
