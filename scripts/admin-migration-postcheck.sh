#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_BASE="${1:-$ROOT_DIR/artifacts/admin-migration}"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
RUN_DIR="$OUT_BASE/$STAMP"
SQL_FILE="$ROOT_DIR/sql/supabase-admin-post-migration-validation.sql"

mkdir -p "$RUN_DIR"

ENV_REPORT="$RUN_DIR/env-check.txt"
SQL_REPORT="$RUN_DIR/sql-validation.txt"
SUMMARY_REPORT="$RUN_DIR/summary.txt"

required_env=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

echo "Admin migration post-check" > "$ENV_REPORT"
echo "UTC timestamp: $STAMP" >> "$ENV_REPORT"
echo "" >> "$ENV_REPORT"

echo "Required environment variables:" >> "$ENV_REPORT"
all_env_ok=true
for key in "${required_env[@]}"; do
  if [[ -n "${!key:-}" ]]; then
    echo "[OK] $key is present" >> "$ENV_REPORT"
  else
    echo "[MISSING] $key is not set" >> "$ENV_REPORT"
    all_env_ok=false
  fi
done

if [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" && "${NEXT_PUBLIC_SUPABASE_URL}" == *"supabase.co"* ]]; then
  echo "[OK] NEXT_PUBLIC_SUPABASE_URL format looks valid" >> "$ENV_REPORT"
else
  echo "[WARN] NEXT_PUBLIC_SUPABASE_URL does not look like a supabase.co URL" >> "$ENV_REPORT"
fi

if [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" && -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" && "${SUPABASE_SERVICE_ROLE_KEY}" == "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" ]]; then
  echo "[MISSING-CONTROL] SUPABASE_SERVICE_ROLE_KEY matches anon key (unexpected)" >> "$ENV_REPORT"
  all_env_ok=false
fi

sql_ok=false
if [[ ! -f "$SQL_FILE" ]]; then
  echo "SQL file missing: $SQL_FILE" > "$SQL_REPORT"
elif [[ -n "${SUPABASE_DB_URL:-}" ]] && command -v psql >/dev/null 2>&1; then
  {
    echo "Running SQL validation via psql"
    echo "Command: psql \"SUPABASE_DB_URL\" -v ON_ERROR_STOP=1 -f \"$SQL_FILE\""
    echo ""
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
  } > "$SQL_REPORT" 2>&1
  sql_ok=true
else
  {
    echo "SQL validation skipped"
    echo "Reason: SUPABASE_DB_URL is not set or psql is unavailable"
    echo "Run manually in Supabase SQL Editor using: sql/supabase-admin-post-migration-validation.sql"
  } > "$SQL_REPORT"
fi

{
  echo "Admin migration post-check summary"
  echo "Run directory: $RUN_DIR"
  echo "Env report: $ENV_REPORT"
  echo "SQL report: $SQL_REPORT"
  echo ""
  if [[ "$all_env_ok" == true ]]; then
    echo "Environment check: PASS"
  else
    echo "Environment check: FAIL"
  fi

  if [[ "$sql_ok" == true ]]; then
    echo "SQL execution: PASS"
  else
    echo "SQL execution: SKIPPED"
  fi

  echo ""
  echo "Archive this directory as rollout evidence."
} > "$SUMMARY_REPORT"

cat "$SUMMARY_REPORT"
