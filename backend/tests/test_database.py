import sqlite3

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


def test_startup_creates_empty_users_table(client, settings):
    with sqlite3.connect(settings.db_path) as conn:
        columns = [row[1] for row in conn.execute("PRAGMA table_info(users)")]
        count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert columns == ["id", "email", "password_hash", "created_at"]
    assert count == 0


def test_startup_discards_existing_database(settings):
    settings.db_path.parent.mkdir(parents=True)
    with sqlite3.connect(settings.db_path) as conn:
        conn.execute("CREATE TABLE stale (id INTEGER)")
    with TestClient(create_app(settings)):
        with sqlite3.connect(settings.db_path) as conn:
            tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert "stale" not in tables
    assert "users" in tables


def test_users_email_is_unique(client, settings):
    insert = "INSERT INTO users (email, password_hash) VALUES ('a@example.com', 'x')"
    with sqlite3.connect(settings.db_path) as conn:
        conn.execute(insert)
        with pytest.raises(sqlite3.IntegrityError):
            conn.execute(insert)
