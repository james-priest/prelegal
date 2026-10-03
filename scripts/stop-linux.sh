#!/usr/bin/env bash
# Stop the Prelegal container (the database is discarded with it).
set -euo pipefail

docker stop prelegal
