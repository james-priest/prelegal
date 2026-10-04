"""Chat request/response models shared by every document conversation."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

from models.base import CamelModel
from models.document import Party


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(CamelModel):
    """The conversation so far, the draft's current state and the user's local date."""

    document_id: str | None = None
    messages: list[Message]
    fields: dict[str, str] = Field(default_factory=dict)
    parties: dict[str, Party] = Field(default_factory=dict)
    today: date


class ChatResponse(CamelModel):
    """The assistant's reply, the chosen document and the fields and party details it filled in."""

    reply: str
    document_id: str | None
    fields: dict[str, str] = Field(default_factory=dict)
    parties: dict[str, dict[str, str]] = Field(default_factory=dict)
