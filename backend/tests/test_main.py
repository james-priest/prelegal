import sqlite3


def test_startup_creates_database(client, settings):
    with sqlite3.connect(settings.db_path) as conn:
        tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert "users" in tables


def test_serves_login_page_at_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Sign in" in response.text


def test_serves_nested_page(client):
    response = client.get("/nda/")
    assert response.status_code == 200
    assert "NDA" in response.text
