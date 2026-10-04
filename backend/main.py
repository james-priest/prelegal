"""FastAPI app: JSON API under /api, static frontend export at /."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from api import chat, health
from core.config import Settings
from core.static import FrontendStaticFiles
from services.database import init_db
from services.documents import load_documents


def create_app(settings: Settings) -> FastAPI:
    """Build the app; the database is recreated at `settings.db_path` on startup."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        init_db(settings.db_path)
        yield

    app = FastAPI(title="Prelegal", lifespan=lifespan)
    app.state.documents = load_documents(settings.templates_dir / "documents.json")
    app.include_router(health.router)
    app.include_router(chat.router)

    # Mounted last so /api routes take precedence. Absent until the frontend is built.
    if settings.static_dir.is_dir():
        app.mount("/", FrontendStaticFiles(directory=settings.static_dir, html=True), name="frontend")

    return app


app = create_app(Settings())
