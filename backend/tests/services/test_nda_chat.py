from datetime import date

from models.chat import Message
from models.nda import NdaFields
from services.nda_chat import respond

TODAY = date(2026, 10, 3)


def test_sends_history_after_system_prompt(nda_fields, llm_calls):
    history = [
        Message(role="assistant", content="What is the NDA for?"),
        Message(role="user", content="A joint venture"),
    ]
    respond(history, NdaFields.model_validate(nda_fields), TODAY)
    sent = llm_calls[0]["messages"]
    assert sent[0]["role"] == "system"
    assert sent[1:] == [m.model_dump() for m in history]


def test_system_prompt_includes_current_fields_and_date(nda_fields, llm_calls):
    respond([Message(role="user", content="hi")], NdaFields.model_validate(nda_fields), TODAY)
    system = llm_calls[0]["messages"][0]["content"]
    assert '"mndaTermType": "fixed"' in system
    assert '"noticeAddress": ""' in system
    assert "today is Saturday, 2026-10-03" in system


def test_returns_parsed_turn(nda_fields, llm_calls, llm_turn):
    turn = respond([Message(role="user", content="hi")], NdaFields.model_validate(nda_fields), TODAY)
    assert turn.reply == llm_turn["reply"]
    assert turn.fields.purpose == "Joint venture"
