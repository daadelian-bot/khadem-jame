#!/usr/bin/env bash
set -Eeuo pipefail
# Restore helper. Use only on a NEW / EMPTY compatible target database.
# This is not a migration script and must not be run against production by accident.

if [[ -z "${RESTORE_DATABASE_URL:-}" ]]; then
  echo "ERROR: Set RESTORE_DATABASE_URL to the TARGET Postgres connection string." >&2
  exit 2
fi
if [[ $# -ne 1 || ! -d "$1" ]]; then
  echo "Usage: RESTORE_DATABASE_URL='postgres://...' $0 backups/khadem-supabase-<timestamp>" >&2
  exit 2
fi
DIR="$1"
for f in roles.sql schema.sql data.sql SHA256SUMS; do
  [[ -f "$DIR/$f" ]] || { echo "ERROR: Missing $DIR/$f" >&2; exit 2; }
done
command -v psql >/dev/null || { echo "ERROR: psql is required." >&2; exit 2; }
command -v sha256sum >/dev/null || { echo "ERROR: sha256sum is required." >&2; exit 2; }

(cd "$DIR" && sha256sum -c SHA256SUMS)
echo
echo "TARGET database: ${RESTORE_DATABASE_URL%%\?*}"
echo "This operation creates database objects and loads data. The target must be empty/dedicated."
read -r -p "Type RESTORE-TO-EMPTY-TARGET to continue: " CONFIRM
[[ "$CONFIRM" == "RESTORE-TO-EMPTY-TARGET" ]] || { echo "Canceled."; exit 1; }

# Roles are applied separately because role creation may not run inside a transaction.
psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DIR/roles.sql"
psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f "$DIR/schema.sql"
psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -c "SET session_replication_role = replica" -f "$DIR/data.sql"

echo "SQL restore commands completed. This does NOT restore Storage files, Edge Functions, API/JWT secrets, OAuth/SMTP settings, or hosting configuration."
echo "Run the verification checklist in docs/backup-restore-fa.md before switching the app to the target project."
