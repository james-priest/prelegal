"""FastAPI app: JSON API under /api, static frontend export at /."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from prelegal_backend.db import init_db


def create_app(db_path: Path, static_dir: Path) -> FastAPI:
    """Build the app; the database is recreated at `db_path` on startup."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        init_db(db_path)
        yield

    app = FastAPI(title="Prelegal", lifespan=lifespan)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        """Liveness check."""
        return {"status": "ok"}

    # Mounted last so /api routes take precedence. Absent until the frontend is built.
    if static_dir.is_dir():
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")

    return app


app = create_app(
    db_path=Path(os.environ.get("PRELEGAL_DB_PATH", "data/prelegal.db")),
    static_dir=Path(os.environ.get("PRELEGAL_STATIC_DIR", "../frontend/out")),
)
