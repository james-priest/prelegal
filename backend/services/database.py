"""SQLite database, recreated from scratch on every startup."""

from pathlib import Path

from sqlalchemy import Engine
from sqlmodel import SQLModel, create_engine

from models import draft, user  # noqa: F401  (registers the tables)


def init_db(path: Path) -> Engine:
    """Delete any existing database at `path`, create the tables and return the engine."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.unlink(missing_ok=True)
    # FastAPI may use a session from another thread than the one that created it.
    engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    return engine
