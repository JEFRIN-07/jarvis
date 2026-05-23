from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.memory import router as memory_router
from routes.tools import router as tools_router

app = FastAPI(title="Jarvis API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(memory_router, prefix="/api/memory", tags=["memory"])
app.include_router(tools_router, prefix="/api/tools", tags=["tools"])

@app.get("/")
def root():
    return {"status": "Jarvis is online", "version": "0.1.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
