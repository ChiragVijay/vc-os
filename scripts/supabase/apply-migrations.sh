#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL is required. Add it to .env.local."
  exit 1
fi

MIGRATION_FILE="$ROOT_DIR/supabase/migrations/20260204120000_init.sql"

if [[ ! -f "$MIGRATION_FILE" ]]; then
  echo "Migration file not found at $MIGRATION_FILE"
  exit 1
fi

psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"
echo "Migration applied successfully."
