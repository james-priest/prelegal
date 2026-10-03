import sqlite3

import pytest
from fastapi.testclient import TestClient

from prelegal_backend.main import create_app


@pytest.fixture
def static_dir(tmp_path):
    out = tmp_path / "out"
    (out / "nda").mkdir(parents=True)
    (out / "index.html").write_text("<h1>Sign in</h1>")
    (out / "nda" / "index.html").write_text("<h1>NDA</h1>")
    return out


@pytest.fixture
def db_path(tmp_path):
    return tmp_path / "data" / "prelegal.db"


@pytest.fixture
def client(db_path, static_dir):
    with TestClient(create_app(db_path, static_dir)) as c:
        yield c


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_startup_creates_empty_users_table(client, db_path):
    with sqlite3.connect(db_path) as conn:
        columns = [row[1] for row in conn.execute("PRAGMA table_info(users)")]
        count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert columns == ["id", "email", "password_hash", "created_at"]
    assert count == 0


def test_startup_discards_existing_database(db_path, static_dir):
    db_path.parent.mkdir(parents=True)
    with sqlite3.connect(db_path) as conn:
        conn.execute("CREATE TABLE stale (id INTEGER)")
    with TestClient(create_app(db_path, static_dir)):
        with sqlite3.connect(db_path) as conn:
            tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert "stale" not in tables
    assert "users" in tables


def test_users_email_is_unique(client, db_path):
    insert = "INSERT INTO users (email, password_hash) VALUES ('a@example.com', 'x')"
    with sqlite3.connect(db_path) as conn:
        conn.execute(insert)
        with pytest.raises(sqlite3.IntegrityError):
            conn.execute(insert)


def test_serves_login_page_at_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Sign in" in response.text


def test_serves_nested_page(client):
    response = client.get("/nda/")
    assert response.status_code == 200
    assert "NDA" in response.text
