#!/usr/bin/env bash
#
# Dump or restore a Supabase database (schema + data, public schema only).
# Reads DIRECT_URL from .env.prod.local and .env.development.local.
#
# Usage:
#   ./scripts/clone-supabase.sh --source dev                      # dump dev to .tmp/dev-*.dump
#   ./scripts/clone-supabase.sh --source prod                     # dump prod to .tmp/prod-*.dump
#   ./scripts/clone-supabase.sh --source dev  --restore <file>    # restore dump file into dev
#   ./scripts/clone-supabase.sh --source prod --restore <file>    # restore dump file into prod (DANGEROUS)

set -euo pipefail

# --- paths -------------------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROD_ENV="${ROOT_DIR}/.env.prod.local"
DEV_ENV="${ROOT_DIR}/.env.development.local"
DUMP_DIR="${ROOT_DIR}/.tmp"

# --- flags -------------------------------------------------------------------
SOURCE=""
RESTORE_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      [[ $# -ge 2 ]] || { echo "--source needs a value (dev|prod)" >&2; exit 1; }
      SOURCE="$2"; shift 2 ;;
    --source=*)    SOURCE="${1#*=}"; shift ;;
    --restore)
      [[ $# -ge 2 ]] || { echo "--restore needs a file path" >&2; exit 1; }
      RESTORE_FILE="$2"; shift 2 ;;
    --restore=*)   RESTORE_FILE="${1#*=}"; shift ;;
    -h|--help)     sed -n '2,11p' "$0"; exit 0 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

case "$SOURCE" in
  dev|prod) ;;
  "") echo "--source is required (dev|prod)" >&2; exit 1 ;;
  *)  echo "--source must be 'dev' or 'prod' (got: $SOURCE)" >&2; exit 1 ;;
esac

# --- helpers -----------------------------------------------------------------
log()  { printf '\033[1;34m[clone]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[clone]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[clone]\033[0m %s\n' "$*" >&2; exit 1; }

read_env() {
  local file="$1" key="$2"
  [[ -f "$file" ]] || fail "missing env file: $file"
  local line
  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  [[ -n "$line" ]] || fail "${key} not found in ${file}"
  local value="${line#${key}=}"
  value="${value%\"}"; value="${value#\"}"
  value="${value%\'}"; value="${value#\'}"
  printf '%s' "$value"
}

host_of() { printf '%s' "$1" | sed -E 's#.*@([^/:]+).*#\1#'; }

# --- pg client ---------------------------------------------------------------
for candidate in \
    /opt/homebrew/opt/postgresql@17/bin \
    /usr/local/opt/postgresql@17/bin \
    /opt/homebrew/opt/libpq/bin \
    /usr/local/opt/libpq/bin; do
  [[ -x "$candidate/pg_dump" ]] && { PATH="$candidate:$PATH"; break; }
done

command -v pg_dump    >/dev/null || fail "pg_dump not found (brew install postgresql@17)"
command -v pg_restore >/dev/null || fail "pg_restore not found"
command -v psql       >/dev/null || fail "psql not found"

pg_major="$(pg_dump --version | awk '{print $3}' | cut -d. -f1)"
[[ "$pg_major" -ge 17 ]] || fail "pg_dump is v${pg_major}, need >=17 (brew install postgresql@17)"

# --- resolve URL -------------------------------------------------------------
case "$SOURCE" in
  prod) ENV_FILE="$PROD_ENV" ;;
  dev)  ENV_FILE="$DEV_ENV"  ;;
esac
DB_URL="$(read_env "$ENV_FILE" DIRECT_URL)"
log "Source ($SOURCE) : $(host_of "$DB_URL")"

mkdir -p "$DUMP_DIR"

# --- dump mode ---------------------------------------------------------------
if [[ -z "$RESTORE_FILE" ]]; then
  DUMP_FILE="${DUMP_DIR}/${SOURCE}-$(date +%Y%m%d-%H%M%S).dump"
  log "Dumping ${SOURCE} -> ${DUMP_FILE}"
  pg_dump "$DB_URL" \
    --format=custom \
    --no-owner \
    --no-privileges \
    --no-comments \
    --schema=public \
    --file="$DUMP_FILE"
  log "Dump size: $(du -h "$DUMP_FILE" | cut -f1)"
  log "Done."
  exit 0
fi

# --- restore mode ------------------------------------------------------------
[[ -f "$RESTORE_FILE" ]] || fail "dump file not found: $RESTORE_FILE"
log "Restore file   : ${RESTORE_FILE}"

if [[ "$SOURCE" == "prod" ]]; then
  warn "!!! You are about to OVERWRITE PRODUCTION !!!"
  read -r -p "Type 'OVERWRITE PROD' to continue: " confirm
  [[ "$confirm" == "OVERWRITE PROD" ]] || fail "aborted"
else
  read -r -p "This will OVERWRITE the ${SOURCE} database. Type 'yes' to continue: " confirm
  [[ "$confirm" == "yes" ]] || fail "aborted"
fi

log "Restoring into ${SOURCE} (this may take a while)..."
pg_restore \
  --no-owner \
  --no-privileges \
  --single-transaction \
  --clean --if-exists \
  --dbname="$DB_URL" \
  "$RESTORE_FILE"

log "Done."
