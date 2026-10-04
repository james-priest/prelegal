import sqlite3

from services.database import init_db


def table_names(path) -> set[str]:
    with sqlite3.connect(path) as conn:
        return {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}


def test_creates_tables(tmp_path):
    path = tmp_path / "data" / "prelegal.db"
    init_db(path)
    assert {"users", "auth_sessions", "drafts"} <= table_names(path)


def test_discards_existing_database(tmp_path):
    path = tmp_path / "prelegal.db"
    with sqlite3.connect(path) as conn:
        conn.execute("CREATE TABLE stale (id INTEGER)")
    init_db(path)
    assert "stale" not in table_names(path)
