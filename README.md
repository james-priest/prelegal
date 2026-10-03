# prelegal
A platform for drafting common legal agreements

> **🚧 Status: In progress** — this project is under active development and is expected to be completed by **October 7, 2026**.

## Features

- **Sign in** — placeholder login screen (no authentication yet).
- **Mutual NDA Creator** — fill in a form and download a completed Common Paper Mutual NDA as a PDF.

## Running

Requires Docker. Optionally put `OPENROUTER_API_KEY` in `.env` at the project root (passed to the container when present), then:

```bash
scripts/start-mac.sh      # or start-linux.sh / start-windows.ps1
scripts/stop-mac.sh       # or stop-linux.sh / stop-windows.ps1
```

The app runs at http://localhost:8000. The SQLite database is recreated each time the container starts.

## Layout

| Path        | Contents                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| `frontend/` | Next.js app, statically exported. See [`frontend/README.md`](frontend/README.md) |
| `backend/`  | FastAPI (uv) app serving `/api` and the static frontend. See [`backend/README.md`](backend/README.md) |
| `templates/`| Legal agreement templates, listed in `catalog.json`                       |
| `scripts/`  | Start/stop scripts for Docker                                             |
