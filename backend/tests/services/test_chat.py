from models.chat import ChatRequest
from services.chat import draft_model, respond

GREETING = {"role": "assistant", "content": "What kind of agreement do you need?"}


def request(document_id=None, text="hi", fields=None):
    return ChatRequest.model_validate({
        "documentId": document_id,
        "messages": [GREETING, {"role": "user", "content": text}],
        "fields": fields or {},
        "today": "2026-10-03",
    })


def draft_turn(document_id, fields=None, parties=None, reply="What is the Effective Date?"):
    return {"reply": reply, "documentId": document_id, "fields": fields or {}, "parties": parties or {}}


def test_unsupported_request_returns_reply_without_document(documents, stub_llm):
    calls = stub_llm({"reply": "We can't draft that; a PSA is closest.", "documentId": None})
    response = respond(request(text="An employment contract"), documents)
    assert response.document_id is None
    assert response.reply == "We can't draft that; a PSA is closest."
    assert len(calls) == 1
    assert "pilot-agreement: Pilot Agreement" in calls[0]["messages"][0]["content"]


def test_selected_document_is_drafted_in_the_same_request(documents, stub_llm):
    calls = stub_llm(
        {"reply": "Sure", "documentId": "pilot-agreement"},
        draft_turn("pilot-agreement", {"pilotPeriod": "60 days"}, {"customer": {"company": "Globex"}}),
    )
    response = respond(request(text="A 60 day pilot for Globex"), documents)
    assert len(calls) == 2
    assert response.document_id == "pilot-agreement"
    assert response.reply == "What is the Effective Date?"
    assert response.fields == {"pilotPeriod": "60 days"}
    assert response.parties == {"customer": {"company": "Globex"}}


def test_chosen_document_skips_selection(documents, stub_llm):
    calls = stub_llm(draft_turn("mutual-nda", {"governingLaw": "Delaware"}))
    response = respond(request("mutual-nda", fields={"purpose": "Joint venture"}), documents)
    assert len(calls) == 1
    assert response.fields == {"governingLaw": "Delaware"}


def test_draft_prompt_includes_current_values_and_today(documents, stub_llm):
    calls = stub_llm(draft_turn("mutual-nda"))
    respond(request("mutual-nda", fields={"purpose": "Joint venture"}), documents)
    system = calls[0]["messages"][0]["content"]
    assert '"purpose": "Joint venture"' in system
    assert '"governingLaw": ""' in system
    assert "today is Saturday, October 3, 2026" in system


def test_switching_documents_redrafts_from_blank_state(documents, stub_llm):
    calls = stub_llm(
        draft_turn("pilot-agreement"),
        draft_turn("pilot-agreement", {"pilotPeriod": "60 days"}),
    )
    response = respond(request("mutual-nda", fields={"purpose": "Joint venture"}), documents)
    assert len(calls) == 2
    assert '"purpose"' not in calls[1]["messages"][0]["content"]
    assert response.document_id == "pilot-agreement"
    assert response.fields == {"pilotPeriod": "60 days"}


def test_draft_schema_has_a_described_property_per_field_and_party(documents):
    doc = documents["pilot-agreement"]
    schema = draft_model(doc, documents).model_json_schema(by_alias=True)
    fields = schema["$defs"]["Fields"]["properties"]
    assert set(fields) == {f.key for f in doc.fields}
    assert fields["pilotPeriod"]["description"].startswith("Pilot Period: How long the pilot lasts")
    assert set(schema["$defs"]["Parties"]["properties"]) == {"customer", "provider"}
