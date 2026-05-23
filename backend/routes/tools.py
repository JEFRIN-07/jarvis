from fastapi import APIRouter
from pydantic import BaseModel
from tools_executor import execute_action

router = APIRouter()


class ToolRequest(BaseModel):
    action: str
    value: str


@router.post("/execute")
async def execute_tool(req: ToolRequest):
    result = await execute_action(req.action, req.value)
    return {"status": "executed", "result": result}


@router.get("/list")
def list_tools():
    return {
        "tools": [
            {"name": "OPEN_APP", "description": "Open an application", "example": "Chrome, VS Code, Notepad"},
            {"name": "OPEN_URL", "description": "Open a website", "example": "https://google.com"},
            {"name": "SEARCH", "description": "Search the web", "example": "AI news today"},
        ]
    }
