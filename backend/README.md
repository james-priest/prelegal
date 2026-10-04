# Prelegal backend

FastAPI app (uv project). Serves the JSON API under `/api` and the statically exported frontend at `/`.

```bash
uv sync
uv run uvicorn main:app --reload --env-file ../.env   # http://localhost:8000
uv run pytest
```

Code is organized by layer: `api` calls `services`, which use `models` and `core`. `tests/` mirrors this layout.

| Path                    | Contents |
| ----------------------- | -------- |
| `main.py`               | `create_app(settings)`: lifespan (recreates the DB), routers, static mount |
| `api/`                  | Routers, request/response handling only: `health` (`GET /api/health`), `chat` (`POST /api/chat`) |
| `services/database.py`  | SQLite, deleted and recreated with a `users` table on every startup |
| `services/documents.py` | Loads `templates/documents.json`: the supported documents, their parties and cover page fields |
| `services/chat.py`      | Chat flow: pick a document, then draft it with a response schema built per document; `respond()` |
| `services/prompts.py`   | Selection and drafting system prompts |
| `models/`               | Pydantic schemas: `base` (camelCase), `chat` (request/response), `document` (registry specs, parties) |
| `core/config.py`        | `Settings`, read from `PRELEGAL_*` env vars |
| `core/llm.py`           | `complete_structured()`: LiteLLM via OpenRouter (Cerebras), Structured Outputs. Needs `OPENROUTER_API_KEY` |

A new document type is a template in `templates/` plus an entry in `templates/documents.json`; no code changes.

| Env var                  | Default            | Purpose                           |
| ------------------------ | ------------------ | --------------------------------- |
| `PRELEGAL_DB_PATH`       | `data/prelegal.db` | SQLite file                       |
| `PRELEGAL_STATIC_DIR`    | `../frontend/out`  | Frontend export (`npm run build`) |
| `PRELEGAL_TEMPLATES_DIR` | `../templates`     | Templates and `documents.json`    |
