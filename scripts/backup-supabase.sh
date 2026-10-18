#!/usr/bin/env bash
set -Eeuo pipefail
# Local, private backup only. Never commit the output or database credentials.
# Requirements: Supabase CLI, psql, sha256sum, and Docker (used by Supabase CLI).

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: Set DATABASE_URL to the source project's Postgres connection string." >&2
  exit 2
fi
command -v supabase >/dev/null || { echo "ERROR: Supabase CLI is required." >&2; exit 2; }
command -v sha256sum >/dev/null || { echo "ERROR: sha256sum is required." >&2; exit 2; }

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${BACKUP_DIR:-backups}/khadem-supabase-${STAMP}"
mkdir -p "$OUT"
chmod 700 "$OUT"

echo "Creating roles, schema, and data dumps in: $OUT"
supabase db dump --db-url "$DATABASE_URL" --role-only -f "$OUT/roles.sql"
supabase db dump --db-url "$DATABASE_URL" -f "$OUT/schema.sql"
supabase db dump --db-url "$DATABASE_URL" --use-copy --data-only -f "$OUT/data.sql"

cat > "$OUT/README.txt" <<EOF
Khadem Jame Supabase backup
Created (UTC): $STAMP
Source project ref: ${SUPABASE_PROJECT_REF:-not supplied}
Files: roles.sql, schema.sql, data.sql
Important: Storage objects, Auth/provider settings, Edge Functions, secrets, and app hosting configuration require separate backup/export steps. Confirm auth schema coverage for your project before relying on this as a full disaster-recovery copy.
Restore only into a dedicated compatible target after reviewing docs/backup-restore-fa.md.
Keep this directory private and encrypted; it may contain sensitive personal and financial data.
EOF

(
  cd "$OUT"
  sha256sum roles.sql schema.sql data.sql README.txt > SHA256SUMS
)
echo
echo "Backup files created:"
ls -lh "$OUT"
echo "Verify integrity with: (cd '$OUT' && sha256sum -c SHA256SUMS)"
echo "WARNING: this is a database dump, not yet a complete project restore point until Storage/Auth settings/functions are separately captured and tested."
