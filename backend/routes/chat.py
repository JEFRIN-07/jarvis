from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ai_router import route_message
from tools_executor import execute_action
import re

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    memory: dict = {}


class ChatResponse(BaseModel):
    response: str
    model_used: str
    model_name: str
    action_taken: Optional[str] = None
    action_result: Optional[str] = None


@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    result = await route_message(
        message=req.message,
        history=[m.dict() for m in req.history],
        memory=req.memory
    )

    response_text = result["response"]
    action_taken = None
    action_result = None

    # Clean up backslashes Mistral adds: ACTION\_OPEN\_APP → ACTION:OPEN_APP
    cleaned = response_text.replace("\\_", "_").replace("\\:", ":")

    # Match ACTION:TYPE:VALUE anywhere in response
    action_match = re.search(r'ACTION:([A-Z_]+):(.+?)(?:\n|$)', cleaned)
    if action_match:
        action_type = action_match.group(1).strip()
        action_value = action_match.group(2).strip()

        action_result = await execute_action(action_type, action_value)
        action_taken = f"{action_type}:{action_value}"

        # Remove action tag from response
        response_text = re.sub(r'ACTION[:\\\_]+[A-Z_]+[:\\\_]+\S+', '', response_text).strip()
        if not response_text:
            response_text = f"Done! {action_result}"

    return ChatResponse(
        response=response_text,
        model_used=result["model_used"],
        model_name=result["model_name"],
        action_taken=action_taken,
        action_result=action_result
    )