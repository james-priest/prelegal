from fastapi import APIRouter, HTTPException, Request

from models.chat import ChatRequest, ChatResponse
from services import chat as chat_service

router = APIRouter(prefix="/api")


@router.post("/chat")
def chat(body: ChatRequest, request: Request) -> ChatResponse:
    """Next assistant reply, chosen document and field updates."""
    documents = request.app.state.documents
    if body.document_id is not None and body.document_id not in documents:
        raise HTTPException(status_code=422, detail=f"Unknown document: {body.document_id}")
    return chat_service.respond(body, documents)
