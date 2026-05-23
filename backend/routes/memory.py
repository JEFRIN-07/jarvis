from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter()

MEMORY_FILE = "memory.json"


def load_memory() -> dict:
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    return {"name": "", "preferences": "", "projects": "", "notes": []}


def save_memory(data: dict):
    with open(MEMORY_FILE, "w") as f:
        json.dump(data, f, indent=2)


class MemoryUpdate(BaseModel):
    key: str
    value: str


@router.get("/")
def get_memory():
    return load_memory()


@router.post("/update")
def update_memory(update: MemoryUpdate):
    memory = load_memory()
    memory[update.key] = update.value
    save_memory(memory)
    return {"status": "saved", "memory": memory}


@router.post("/note")
def add_note(note: dict):
    memory = load_memory()
    if "notes" not in memory:
        memory["notes"] = []
    memory["notes"].append(note.get("text", ""))
    save_memory(memory)
    return {"status": "note saved"}


@router.delete("/clear")
def clear_memory():
    save_memory({"name": "", "preferences": "", "projects": "", "notes": []})
    return {"status": "memory cleared"}
