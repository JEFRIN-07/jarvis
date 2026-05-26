@echo off
title JARVIS STARTUP
color 0b

:: Start Ollama silently
start "" "C:\Users\lenovo\AppData\Local\Programs\Ollama\ollama.exe" serve

timeout /t 3 /nobreak > nul

:: Start Backend silently
start "Jarvis Backend" /min cmd /k "cd C:\Users\lenovo\OneDrive\Desktop\jarvis\backend && uvicorn main:app --port 8000"

timeout /t 3 /nobreak > nul

:: Start Frontend silently  
start "Jarvis Frontend" /min cmd /k "cd C:\Users\lenovo\OneDrive\Desktop\jarvis\frontend && npm run dev"

timeout /t 5 /nobreak > nul

:: Open Chrome
start chrome "http://localhost:5173"