"""Mutual NDA cover page fields and chat request/response schemas."""

from datetime import date
from typing import Literal

from pydantic import Field

from models.base import CamelModel
from models.chat import Message

MndaTermType = Literal["fixed", "untilTerminated"]
ConfidentialityTermType = Literal["fixed", "perpetual"]


class Party(CamelModel):
    name: str
    title: str
    company: str
    notice_address: str


class NdaFields(CamelModel):
    """Current cover page values, as held by the frontend."""

    purpose: str
    effective_date: str
    mnda_term_type: MndaTermType
    mnda_term_years: int
    confidentiality_term_type: ConfidentialityTermType
    confidentiality_term_years: int
    governing_law: str
    jurisdiction: str
    modifications: str
    party1: Party
    party2: Party


class PartyUpdates(CamelModel):
    name: str | None = None
    title: str | None = None
    company: str | None = None
    notice_address: str | None = None


class FieldUpdates(CamelModel):
    """Fields to change; null means leave unchanged."""

    purpose: str | None = None
    effective_date: date | None = None
    mnda_term_type: MndaTermType | None = None
    mnda_term_years: int | None = None
    confidentiality_term_type: ConfidentialityTermType | None = None
    confidentiality_term_years: int | None = None
    governing_law: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None
    party1: PartyUpdates = Field(default_factory=PartyUpdates)
    party2: PartyUpdates = Field(default_factory=PartyUpdates)


class ChatTurn(CamelModel):
    """One assistant turn: the message to show and the fields it fills in."""

    reply: str = Field(
        description="Message to the user. Ends with the next question unless every field is filled in."
    )
    fields: FieldUpdates = Field(
        description="Every value the user has just provided, including company names; null for the rest."
    )


class NdaChatRequest(CamelModel):
    """The conversation so far, current fields and the user's local date."""

    messages: list[Message]
    fields: NdaFields
    today: date
