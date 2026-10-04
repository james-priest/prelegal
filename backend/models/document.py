"""Supported document types (from templates/documents.json) and party details."""

from pydantic import BaseModel

from models.base import CamelModel


class DocumentField(BaseModel):
    key: str
    label: str
    description: str
    example: str
    inline: bool = False


class DocumentParty(BaseModel):
    key: str
    label: str


class DocumentSpec(BaseModel):
    """A document we can draft: its template, party roles and cover page fields."""

    id: str
    name: str
    description: str
    template: str
    parties: list[DocumentParty]
    fields: list[DocumentField]


class Party(CamelModel):
    company: str = ""
    name: str = ""
    title: str = ""
    notice_address: str = ""


class PartyUpdates(CamelModel):
    """Party details to change; null means leave unchanged."""

    company: str | None = None
    name: str | None = None
    title: str | None = None
    notice_address: str | None = None
