#!/usr/bin/env bash
# Build and start Prelegal in Docker at http://localhost:8000
set -euo pipefail
cd "$(dirname "$0")/.."

# Pass .env (API keys) to the container when present.
set --
if [[ -f .env ]]; then set -- --env-file .env; fi

docker build -t prelegal .
docker rm -f prelegal >/dev/null 2>&1 || true
docker run -d --rm --name prelegal -p 8000:8000 "$@" prelegal
echo "Prelegal running at http://localhost:8000"
