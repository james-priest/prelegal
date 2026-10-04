"""Saved drafts: a user's document, its field values and the chat that produced it."""

from datetime import datetime

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

from models.base import CamelModel, UtcDatetime, utcnow
from models.chat import Message
from models.document import Party


class Draft(SQLModel, table=True):
    __tablename__ = "drafts"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    document_id: str
    fields: dict = Field(default_factory=dict, sa_column=Column(JSON))
    parties: dict = Field(default_factory=dict, sa_column=Column(JSON))
    messages: list = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class DraftIn(CamelModel):
    """A draft as the frontend saves it after each chat turn."""

    document_id: str
    fields: dict[str, str]
    parties: dict[str, Party]
    messages: list[Message]


class DraftSummary(CamelModel):
    id: int
    document_id: str
    parties: dict[str, Party]
    updated_at: UtcDatetime


class DraftOut(DraftSummary):
    fields: dict[str, str]
    messages: list[Message]
    created_at: UtcDatetime
