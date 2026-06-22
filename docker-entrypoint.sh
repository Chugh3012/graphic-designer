#!/bin/sh
# Boot sequence for the container:
#   1. If this is a fresh container (no local DB yet), restore the latest
#      snapshot from Azure Blob. A no-op on the very first deploy.
#   2. Hand off to Litestream, which runs the Next.js server AND continuously
#      streams SQLite changes to Blob. On SIGTERM it flushes a final sync.
set -e

if [ ! -f /data/portfolio.db ]; then
  echo "litestream: restoring /data/portfolio.db from replica (if any)..."
  litestream restore -if-replica-exists /data/portfolio.db
fi

exec litestream replicate -exec "node server.js"
