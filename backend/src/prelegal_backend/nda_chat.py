"""AI chat that drafts a Mutual NDA cover page by asking the user questions."""

from datetime import date
from typing import Literal

from litellm import completion
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

MndaTermType = Literal["fixed", "untilTerminated"]
ConfidentialityTermType = Literal["fixed", "perpetual"]


class CamelModel(BaseModel):
    """Uses camelCase JSON to match the frontend's NdaFormData."""

    model_config = ConfigDict(alias_generator=to_camel, validate_by_name=True)


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


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


SYSTEM_PROMPT = """\
You are Prelegal's assistant, helping the user draft a Common Paper Mutual \
Non-Disclosure Agreement (MNDA) through friendly conversation.

Gather the cover page fields:
- purpose: how Confidential Information may be used
- effectiveDate: ISO date yyyy-mm-dd (today is {today})
- mndaTermType: "fixed" (expires mndaTermYears after the Effective Date) or "untilTerminated"
- confidentialityTermType: "fixed" (confidentialityTermYears after the Effective Date) or "perpetual"
- governingLaw: a US state, e.g. "Delaware"
- jurisdiction: city or county and state for the courts, e.g. "New Castle, DE"
- modifications: optional changes to the Standard Terms
- party1 and party2: each with name (the person signing, never the company), \
title, company and noticeAddress (email or postal)

Rules:
- Ask about one or two fields at a time, in a natural order. Keep replies short, in plain text.
- Until every field is filled in, end each reply with your next question.
- Put every value the user gives you into "fields". Use null for fields that \
are not changing in this turn.
- When the user names the companies, set party1.company and party2.company in \
the order given.
- Convert dates and durations to the formats above. Never invent values.
- Answer brief questions about the MNDA, then steer back to the missing fields.
- When everything is filled in, say the draft is complete and that the user \
can download it as a PDF.

Current field values:
{fields}
"""


def respond(messages: list[Message], fields: NdaFields, today: date) -> ChatTurn:
    """Ask the LLM for the next reply and any field updates; `today` is the user's local date."""
    system = SYSTEM_PROMPT.format(
        today=f"{today:%A}, {today.isoformat()}",
        fields=fields.model_dump_json(by_alias=True, indent=2),
    )
    response = completion(
        model=MODEL,
        messages=[{"role": "system", "content": system}, *(m.model_dump() for m in messages)],
        response_format=ChatTurn,
        reasoning_effort="medium",
        extra_body=EXTRA_BODY,
    )
    return ChatTurn.model_validate_json(response.choices[0].message.content)
