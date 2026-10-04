import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from core import llm
from core.config import Settings
from main import create_app
from services.database import init_db
from services.documents import load_documents

TEMPLATES_DIR = Path(__file__).parents[2] / "templates"


@pytest.fixture
def settings(tmp_path):
    out = tmp_path / "out"
    (out / "draft").mkdir(parents=True)
    (out / "index.html").write_text("<h1>Sign in</h1>")
    (out / "draft" / "index.html").write_text("<h1>Draft</h1>")
    (out / "_next" / "static").mkdir(parents=True)
    (out / "_next" / "static" / "app.js").write_text("console.log(1)")
    return Settings(db_path=tmp_path / "data" / "prelegal.db", static_dir=out, templates_dir=TEMPLATES_DIR)


@pytest.fixture
def client(settings):
    # Server errors become 500 responses, as in production, instead of raising.
    with TestClient(create_app(settings), raise_server_exceptions=False) as c:
        yield c


@pytest.fixture
def documents():
    return load_documents(TEMPLATES_DIR / "documents.json")


@pytest.fixture
def stub_llm(monkeypatch):
    """Returns a function that replaces the LLM with a stub answering with `outputs` in order.

    The function returns the list of recorded call kwargs.
    """

    def stub(*outputs: dict) -> list[dict]:
        calls = []

        def fake_completion(**kwargs):
            calls.append(kwargs)
            message = SimpleNamespace(content=json.dumps(outputs[len(calls) - 1]))
            return SimpleNamespace(choices=[SimpleNamespace(message=message)])

        monkeypatch.setattr(llm, "completion", fake_completion)
        return calls

    return stub


@pytest.fixture
def templates_dir() -> Path:
    return TEMPLATES_DIR


@pytest.fixture
def password() -> str:
    return "correct horse"


@pytest.fixture
def signed_in(client, password):
    """The client, signed in as a new user."""
    client.post("/api/auth/signup", json={"email": "ann@example.com", "password": password})
    return client


@pytest.fixture
def db(tmp_path):
    """A session on a fresh database."""
    with Session(init_db(tmp_path / "test.db")) as session:
        yield session
