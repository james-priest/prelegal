from fastapi import APIRouter

from app.models.nda import ChatTurn, NdaChatRequest
from app.services import nda_chat

router = APIRouter(prefix="/api")


@router.post("/chat")
def chat(request: NdaChatRequest) -> ChatTurn:
    """Next assistant reply and field updates for the NDA conversation."""
    return nda_chat.respond(request.messages, request.fields, request.today)
