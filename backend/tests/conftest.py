import json
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from core import llm
from core.config import Settings
from main import create_app


@pytest.fixture
def settings(tmp_path):
    out = tmp_path / "out"
    (out / "nda").mkdir(parents=True)
    (out / "index.html").write_text("<h1>Sign in</h1>")
    (out / "nda" / "index.html").write_text("<h1>NDA</h1>")
    return Settings(db_path=tmp_path / "data" / "prelegal.db", static_dir=out)


@pytest.fixture
def client(settings):
    # Server errors become 500 responses, as in production, instead of raising.
    with TestClient(create_app(settings), raise_server_exceptions=False) as c:
        yield c


@pytest.fixture
def stub_llm(monkeypatch):
    """Returns a function that replaces the LLM with a stub returning `output`.

    The function returns the list of recorded call kwargs.
    """

    def stub(output: dict) -> list[dict]:
        calls = []

        def fake_completion(**kwargs):
            calls.append(kwargs)
            message = SimpleNamespace(content=json.dumps(output))
            return SimpleNamespace(choices=[SimpleNamespace(message=message)])

        monkeypatch.setattr(llm, "completion", fake_completion)
        return calls

    return stub


@pytest.fixture
def nda_fields() -> dict:
    """Blank NDA cover page fields, as the frontend sends them."""
    party = {"name": "", "title": "", "company": "", "noticeAddress": ""}
    return {
        "purpose": "",
        "effectiveDate": "",
        "mndaTermType": "fixed",
        "mndaTermYears": 1,
        "confidentialityTermType": "fixed",
        "confidentialityTermYears": 1,
        "governingLaw": "",
        "jurisdiction": "",
        "modifications": "",
        "party1": party,
        "party2": dict(party),
    }


@pytest.fixture
def llm_turn() -> dict:
    """A valid LLM response for an NDA chat turn."""
    return {
        "reply": "Thanks! Which state's law should govern?",
        "fields": {
            "purpose": "Joint venture",
            "effectiveDate": "2026-10-04",
            "party1": {"company": "Acme Inc"},
        },
    }


@pytest.fixture
def llm_calls(stub_llm, llm_turn):
    """Stubs the LLM with `llm_turn`; returns the recorded call kwargs."""
    return stub_llm(llm_turn)
