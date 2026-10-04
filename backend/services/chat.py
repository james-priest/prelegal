"""AI chat that picks a supported document and drafts its cover page."""

import json
from typing import Literal

from pydantic import BaseModel, Field, create_model

from core import llm
from models.base import CamelModel
from models.chat import ChatRequest, ChatResponse, Message
from models.document import DocumentSpec, Party, PartyUpdates
from services.prompts import DRAFT_PROMPT, SELECTION_PROMPT

REPLY = Field(description="Message to the user. Ends with the next question unless the draft is complete.")


def _id_literal(documents: dict[str, DocumentSpec]):
    """A Literal type of the supported document ids, so the schema enumerates them."""
    return Literal[tuple(documents)]


def selection_model(documents: dict[str, DocumentSpec]) -> type[BaseModel]:
    """Response schema while no document is chosen: a reply and an optional document id."""
    return create_model(
        "SelectionTurn",
        __base__=CamelModel,
        reply=(str, REPLY),
        document_id=(_id_literal(documents) | None, Field(description="The chosen supported document, or null")),
    )


def draft_model(doc: DocumentSpec, documents: dict[str, DocumentSpec]) -> type[BaseModel]:
    """Response schema for drafting `doc`: one named, described property per field and party."""
    fields = create_model(
        "Fields",
        **{
            f.key: (str | None, Field(default=None, description=f"{f.label}: {f.description}. Example: {f.example}"))
            for f in doc.fields
        },
    )
    parties = create_model(
        "Parties",
        **{p.key: (PartyUpdates, Field(default_factory=PartyUpdates, description=f"The {p.label}")) for p in doc.parties},
    )
    return create_model(
        "DraftTurn",
        __base__=CamelModel,
        reply=(str, REPLY),
        document_id=(_id_literal(documents), Field(description=f'"{doc.id}" unless the user switches documents')),
        fields=(fields, Field(description="Every value the user has just provided; null for the rest")),
        parties=(parties, Field(description="Party details the user has just provided; null for the rest")),
    )


def _history(system: str, messages: list[Message]) -> list[dict]:
    return [{"role": "system", "content": system}, *(m.model_dump() for m in messages)]


def select_document(messages: list[Message], documents: dict[str, DocumentSpec]) -> BaseModel:
    """Ask the LLM which supported document the user wants, if any yet."""
    catalog = "\n".join(f"- {d.id}: {d.name}. {d.description}" for d in documents.values())
    system = SELECTION_PROMPT.format(catalog=catalog)
    return llm.complete_structured(_history(system, messages), selection_model(documents))


def draft(doc: DocumentSpec, documents: dict[str, DocumentSpec], request: ChatRequest) -> BaseModel:
    """Ask the LLM for the next reply and any field and party updates for `doc`."""
    state = {
        "fields": {f.key: request.fields.get(f.key, "") for f in doc.fields},
        "parties": {p.key: request.parties.get(p.key, Party()).model_dump(by_alias=True) for p in doc.parties},
    }
    today = request.today
    system = DRAFT_PROMPT.format(
        name=doc.name,
        description=doc.description,
        fields="\n".join(f"- {f.key} ({f.label}): {f.description}, e.g. {f.example}" for f in doc.fields),
        parties=", ".join(f"{p.key} ({p.label})" for p in doc.parties),
        today=f"{today:%A}, {today:%B} {today.day}, {today.year}",
        other_ids=", ".join(d for d in documents if d != doc.id),
        id=doc.id,
        state=json.dumps(state, indent=2),
    )
    return llm.complete_structured(_history(system, request.messages), draft_model(doc, documents))


def respond(request: ChatRequest, documents: dict[str, DocumentSpec]) -> ChatResponse:
    """Next assistant turn: choose a document if needed, then draft it."""
    doc_id = request.document_id
    if doc_id is None:
        selection = select_document(request.messages, documents)
        if selection.document_id is None:
            return ChatResponse(reply=selection.reply, document_id=None)
        doc_id = selection.document_id

    # A newly chosen or switched document starts from a blank state.
    blank = request.model_copy(update={"fields": {}, "parties": {}})
    turn = draft(documents[doc_id], documents, request if doc_id == request.document_id else blank)
    if turn.document_id != doc_id:
        doc_id = turn.document_id
        turn = draft(documents[doc_id], documents, blank)

    parties = turn.parties.model_dump(by_alias=True, exclude_none=True)
    return ChatResponse(
        reply=turn.reply,
        document_id=doc_id,
        fields=turn.fields.model_dump(exclude_none=True),
        parties={key: updates for key, updates in parties.items() if updates},
    )
