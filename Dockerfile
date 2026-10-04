# Stage 1: build the Next.js frontend as a static export.
FROM node:24-slim AS frontend
WORKDIR /build
# The /draft page reads ../templates (documents.json and the templates) at build time.
COPY templates ./templates
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: FastAPI backend serving the API and the static frontend.
FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_NO_DEV=1 \
    PRELEGAL_DB_PATH=/app/data/prelegal.db \
    PRELEGAL_STATIC_DIR=/app/frontend/out

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=backend/pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project
COPY backend ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked

COPY templates /app/templates
COPY --from=frontend /build/frontend/out /app/frontend/out

ENV PATH="/app/backend/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
