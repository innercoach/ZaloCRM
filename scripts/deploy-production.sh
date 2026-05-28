#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-huytv@10.68.10.171}"
APP_DIR="${DEPLOY_APP_DIR:-/home/huytv/ZaloCRM}"
BRANCH="${DEPLOY_BRANCH:-main}"
ORIGIN_URL="${DEPLOY_ORIGIN_URL:-https://github.com/innercoach/ZaloCRM.git}"
UPSTREAM_URL="${DEPLOY_UPSTREAM_URL:-https://github.com/locphamnguyen/ZaloCRM.git}"
HEALTH_URL="${DEPLOY_HEALTH_URL:-http://localhost:3080/health}"
MODE="deploy"
DRY_RUN=0

usage() {
  cat <<'EOF'
Usage: scripts/deploy-production.sh [--host user@host] [--dir /path/to/ZaloCRM] [--branch main] [--dry-run]
       scripts/deploy-production.sh --app-env-reload [--host user@host] [--dir /path/to/ZaloCRM]

Modes:
  deploy            Backup DB, update origin/main, rebuild/recreate app, verify health.
  --app-env-reload  Recreate only the app container after app-only .env changes.
  --dry-run         Print the remote commands without executing them.

Environment overrides:
  DEPLOY_HOST, DEPLOY_APP_DIR, DEPLOY_BRANCH, DEPLOY_ORIGIN_URL, DEPLOY_UPSTREAM_URL, DEPLOY_HEALTH_URL
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      HOST="$2"
      shift 2
      ;;
    --dir)
      APP_DIR="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --origin-url)
      ORIGIN_URL="$2"
      shift 2
      ;;
    --upstream-url)
      UPSTREAM_URL="$2"
      shift 2
      ;;
    --health-url)
      HEALTH_URL="$2"
      shift 2
      ;;
    --app-env-reload)
      MODE="app-env-reload"
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

quote() {
  printf '%q' "$1"
}

REMOTE_SCRIPT=$(cat <<'REMOTE_EOF'
set -euo pipefail

cd "$APP_DIR"

echo "==> Production deploy context"
echo "Host: $(hostname)"
echo "Directory: $(pwd)"
echo "Branch: $BRANCH"

echo "==> Ensure git remotes track the deploy source"
git remote get-url origin >/dev/null 2>&1 || git remote add origin "$ORIGIN_URL"
git remote set-url origin "$ORIGIN_URL"
if git remote get-url upstream >/dev/null 2>&1; then
  git remote set-url upstream "$UPSTREAM_URL"
else
  git remote add upstream "$UPSTREAM_URL"
fi

git fetch origin "$BRANCH"
git branch --set-upstream-to="origin/$BRANCH" "$BRANCH" >/dev/null 2>&1 || true

if [[ "$MODE" == "app-env-reload" ]]; then
  echo "==> Recreate app container for app-only environment changes"
  docker compose up -d --force-recreate app
  echo "==> Verify app health"
  for attempt in {1..30}; do
    if curl -fsS "$HEALTH_URL"; then
      echo
      echo "==> App env reload completed"
      exit 0
    fi
    sleep 2
  done
  echo "Health check failed after app env reload" >&2
  docker logs zalo-crm-app --tail 120 >&2 || true
  exit 1
fi

echo "==> Check working tree"
status_lines=$(git status --short)
unexpected_lines=$(printf '%s\n' "$status_lines" | grep -vE '^( M|M ) docker-compose\.yml$|^\?\? \.deploy-artifacts/|^\?\? manual-backups/|^\?\? docker-compose\.yml\.|^\?\? \.env\.pre-vapid-fix-|^\?\? fcm\.json$' || true)
if [[ -n "$unexpected_lines" ]]; then
  echo "Unexpected local changes on production:" >&2
  printf '%s\n' "$unexpected_lines" >&2
  exit 1
fi

PREDEPLOY_SHA=$(git rev-parse HEAD)
printf '%s\n' "$PREDEPLOY_SHA" > /tmp/zalocrm-predeploy-sha.txt
echo "==> Saved rollback SHA: $PREDEPLOY_SHA"

echo "==> Backup PostgreSQL database"
mkdir -p manual-backups
BACKUP_FILE="manual-backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
docker exec zalo-crm-db pg_dump -U crmuser zalocrm > "$BACKUP_FILE"
test -s "$BACKUP_FILE"
ls -lh "$BACKUP_FILE"

echo "==> Update code to origin/$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> Preserve production MinIO console port mapping"
python3 - <<'PY'
from pathlib import Path
path = Path('docker-compose.yml')
text = path.read_text()
text = text.replace('127.0.0.1:9001:9001', '127.0.0.1:9002:9001')
path.write_text(text)
PY

echo "==> Build and recreate app"
docker compose up -d --build app

echo "==> Ensure dependent services are running"
docker compose up -d db minio

echo "==> Container status"
docker compose ps

echo "==> Verify app health"
for attempt in {1..30}; do
  if curl -fsS "$HEALTH_URL"; then
    echo
    echo "==> Deploy completed"
    exit 0
  fi
  sleep 2
done

echo "Health check failed after deploy" >&2
docker logs zalo-crm-app --tail 120 >&2 || true
exit 1
REMOTE_EOF
)

REMOTE_ENV="APP_DIR=$(quote "$APP_DIR") BRANCH=$(quote "$BRANCH") ORIGIN_URL=$(quote "$ORIGIN_URL") UPSTREAM_URL=$(quote "$UPSTREAM_URL") HEALTH_URL=$(quote "$HEALTH_URL") MODE=$(quote "$MODE")"
REMOTE_COMMAND="$REMOTE_ENV bash -s"

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "ssh $HOST '$REMOTE_COMMAND' <<'REMOTE_EOF'"
  printf '%s\n' "$REMOTE_SCRIPT"
  echo "REMOTE_EOF"
  exit 0
fi

ssh "$HOST" "$REMOTE_COMMAND" <<<"$REMOTE_SCRIPT"
