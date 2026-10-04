# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

See "Current status" at the end for what is implemented so far.

## Development process

When instructed to build a feature:

1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
The frontend is statically exported (Next.js `output: "export"`) and served by FastAPI.  
There should be scripts in scripts/ for:

```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```

Backend available at http://localhost:8000

## Color Scheme

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Current status

Implemented (PL-2 to PL-5):

- Templates: Common Paper templates in `templates/`, listed in `catalog.json`.
- Frontend: Next.js static export. `/` is a fake sign-in page (no authentication, submit goes to `/nda/`). `/nda/` is the Mutual NDA creator: AI chat (`NdaChat`, `lib/chat.ts`) beside a live preview, PDF download via print. Brand colors are Tailwind tokens (`brand-*`) in `globals.css`. Tests: `npm test` (Vitest).
- Backend: `backend/src/prelegal_backend/` with `main.py` (app factory, `GET /api/health`, `POST /api/chat`, static mount), `nda_chat.py` (system prompt, LiteLLM Structured Outputs call returning a reply plus nullable field updates) and `db.py` (recreates SQLite at startup with an empty `users` table). Env vars: `PRELEGAL_DB_PATH`, `PRELEGAL_STATIC_DIR`. Tests: `uv run pytest`.
- Docker: multi-stage `Dockerfile`. Start/stop scripts in `scripts/` pass `.env` to the container when it exists.

Not yet implemented: real sign up/sign in and documents other than the Mutual NDA.
