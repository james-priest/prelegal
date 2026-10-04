# Prelegal backend

FastAPI app (uv project). Serves the JSON API under `/api` and the statically exported frontend at `/`.

```bash
uv sync
uv run uvicorn app.main:app --reload --env-file ../.env   # http://localhost:8000
uv run pytest
```

| Path                       | Contents                                                                 |
| -------------------------- | ------------------------------------------------------------------------ |
| `app/main.py`              | `create_app(settings)`: lifespan (recreates the DB), routers, static mount |
| `app/core/config.py`       | `Settings`, read from `PRELEGAL_*` env vars                              |
| `app/core/database.py`     | SQLite, deleted and recreated with a `users` table on every startup      |
| `app/core/llm.py`          | `complete_structured()`: LiteLLM via OpenRouter (Cerebras), Structured Outputs. Needs `OPENROUTER_API_KEY` |
| `app/models/`              | Pydantic schemas: `base` (camelCase), `chat` (messages), `nda`           |
| `app/routes/`              | API routers: `health` (`GET /api/health`), `chat` (`POST /api/chat`)     |
| `app/services/nda_chat.py` | NDA system prompt and `respond()`                                        |

A new document type adds `models/<doc>.py`, `services/<doc>_chat.py` and a route.

| Env var               | Default            | Purpose                           |
| --------------------- | ------------------ | --------------------------------- |
| `PRELEGAL_DB_PATH`    | `data/prelegal.db` | SQLite file                       |
| `PRELEGAL_STATIC_DIR` | `../frontend/out`  | Frontend export (`npm run build`) |
