#!/bin/sh
set -eu

if [ "${LITESTREAM_ENABLED:-1}" = "1" ]; then
  if [ -n "${LITESTREAM_S3_BUCKET:-}" ] && [ -n "${AWS_REGION:-}" ] && [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    exec litestream replicate -config /app/config/litestream.yml -exec /app/inkforge
  fi
  echo "Litestream disabled because required S3 env vars are missing. Starting InkForge directly."
fi

exec /app/inkforge
