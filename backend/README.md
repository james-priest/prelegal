# Prelegal backend

FastAPI app (uv project). Serves the JSON API under `/api` and the statically exported frontend at `/`.

```bash
uv sync
uv run uvicorn prelegal_backend.main:app --reload --env-file ../.env   # http://localhost:8000
uv run pytest
```

- `src/prelegal_backend/main.py` — app factory, `GET /api/health`, `POST /api/chat`, static frontend mount.
- `src/prelegal_backend/nda_chat.py` — NDA chat: system prompt and a LiteLLM call (OpenRouter, Cerebras) with Structured Outputs returning `{reply, fields}`. Needs `OPENROUTER_API_KEY`.
- `src/prelegal_backend/db.py` — SQLite database, deleted and recreated with a `users` table on every startup.

| Env var               | Default            | Purpose                         |
| --------------------- | ------------------ | ------------------------------- |
| `PRELEGAL_DB_PATH`    | `data/prelegal.db` | SQLite file                     |
| `PRELEGAL_STATIC_DIR` | `../frontend/out`  | Frontend export (`npm run build`) |
