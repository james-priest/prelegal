import sqlite3

import pytest

from services.database import init_db


@pytest.fixture
def db_path(tmp_path):
    path = tmp_path / "data" / "prelegal.db"
    init_db(path)
    return path


def test_creates_empty_users_table(db_path):
    with sqlite3.connect(db_path) as conn:
        columns = [row[1] for row in conn.execute("PRAGMA table_info(users)")]
        count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert columns == ["id", "email", "password_hash", "created_at"]
    assert count == 0


def test_discards_existing_database(tmp_path):
    path = tmp_path / "prelegal.db"
    with sqlite3.connect(path) as conn:
        conn.execute("CREATE TABLE stale (id INTEGER)")
    init_db(path)
    with sqlite3.connect(path) as conn:
        tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert "stale" not in tables
    assert "users" in tables


def test_users_email_is_unique(db_path):
    insert = "INSERT INTO users (email, password_hash) VALUES ('a@example.com', 'x')"
    with sqlite3.connect(db_path) as conn:
        conn.execute(insert)
        with pytest.raises(sqlite3.IntegrityError):
            conn.execute(insert)
