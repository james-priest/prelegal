"""AI chat that drafts a Mutual NDA cover page by asking the user questions."""

from datetime import date

from core import llm
from models.chat import Message
from models.nda import ChatTurn, NdaFields

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
    return llm.complete_structured(
        [{"role": "system", "content": system}, *(m.model_dump() for m in messages)],
        ChatTurn,
    )
