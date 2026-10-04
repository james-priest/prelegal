"""Application settings, read from PRELEGAL_* environment variables."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PRELEGAL_")

    db_path: Path = Path("data/prelegal.db")
    static_dir: Path = Path("../frontend/out")
