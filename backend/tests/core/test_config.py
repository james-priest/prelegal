from pathlib import Path

from core.config import Settings


def test_settings_read_prelegal_env_vars(monkeypatch):
    monkeypatch.setenv("PRELEGAL_DB_PATH", "/tmp/other.db")
    monkeypatch.setenv("PRELEGAL_STATIC_DIR", "/srv/out")
    settings = Settings()
    assert settings.db_path == Path("/tmp/other.db")
    assert settings.static_dir == Path("/srv/out")
