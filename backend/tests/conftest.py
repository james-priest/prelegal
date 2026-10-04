import json
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.core import llm
from app.core.config import Settings
from app.main import create_app


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
