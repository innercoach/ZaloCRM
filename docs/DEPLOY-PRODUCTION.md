# ZaloCRM production deploy

This is the reusable deploy flow for the production host `huytv@10.68.10.171`.

Use this guide for normal app deploys from `innercoach/main`, for app-only `.env` reloads, and for rollback checks. The one-time PWA/golden migration guide remains in `docs/MIGRATION-PWA1-GOLDEN-DESIGN-DOCKER.md`.

## Production facts

- SSH host: `huytv@10.68.10.171`
- App directory: `/home/huytv/ZaloCRM`
- Deploy source: `https://github.com/innercoach/ZaloCRM.git`
- Historical upstream: `https://github.com/locphamnguyen/ZaloCRM.git`
- Branch: `main`
- Public app port: `3080`
- Health URL on server: `http://localhost:3080/health`
- PostgreSQL container: `zalo-crm-db`
- App container: `zalo-crm-app`
- MinIO container: `zalo-crm-minio`
- Production MinIO console host port: `127.0.0.1:9002:9001`

The MinIO console uses host port `9002` because host port `9001` is already allocated on production. Preserve this local Docker Compose change during deploys.

## Never run these on production

These commands can delete the PostgreSQL database volume, MinIO files, or local backups:

```bash
docker compose down -v
docker volume rm ...
docker system prune -a --volumes
rm -rf backups
```

Use `manual-backups/` for manual deploy database backups because the `backups/` directory may be owned by the backup container.

## Normal deploy

From your local checkout:

```bash
scripts/deploy-production.sh
```

What the script does on the server:

1. Enters `/home/huytv/ZaloCRM`.
2. Ensures `origin` points to `innercoach/ZaloCRM`.
3. Ensures `upstream` points to `locphamnguyen/ZaloCRM`.
4. Fetches `origin/main` and sets `main` to track it.
5. Refuses unexpected dirty tracked files.
6. Saves the predeploy commit to `/tmp/zalocrm-predeploy-sha.txt`.
7. Creates a PostgreSQL backup in `manual-backups/pre-deploy-YYYYmmdd-HHMMSS.sql`.
8. Resets code to `origin/main`.
9. Reapplies the production MinIO console mapping `127.0.0.1:9002:9001`.
10. Rebuilds/recreates the app service.
11. Ensures `db` and `minio` are running.
12. Verifies `http://localhost:3080/health`.

Preview the remote commands without changing production:

```bash
scripts/deploy-production.sh --dry-run
```

Deploy a different branch only when intentionally testing a deploy branch:

```bash
scripts/deploy-production.sh --branch my-branch
```

## App-only `.env` reload

If you only changed app environment variables on production and do not need new code or database backup:

```bash
scripts/deploy-production.sh --app-env-reload
```

This runs only:

```bash
docker compose up -d --force-recreate app
```

Then it verifies the health endpoint.

## Manual remote check

If a deploy fails before code update, inspect the server state:

```bash
ssh huytv@10.68.10.171
cd /home/huytv/ZaloCRM
git remote -v
git status --short --branch
docker compose ps
curl -fsS http://localhost:3080/health
```

Expected git remote shape:

```text
origin    https://github.com/innercoach/ZaloCRM.git (fetch)
origin    https://github.com/innercoach/ZaloCRM.git (push)
upstream  https://github.com/locphamnguyen/ZaloCRM.git (fetch)
upstream  https://github.com/locphamnguyen/ZaloCRM.git (push)
```

Expected branch shape:

```text
## main...origin/main
```

A local `docker-compose.yml` diff for MinIO port `9002` is expected on production.

## Rollback app code

Rollback app code first. Do not restore the database unless you confirmed schema/data damage.

```bash
ssh huytv@10.68.10.171
cd /home/huytv/ZaloCRM
PREDEPLOY_SHA=$(cat /tmp/zalocrm-predeploy-sha.txt)
git reset --hard "$PREDEPLOY_SHA"
python3 - <<'PY'
from pathlib import Path
path = Path('docker-compose.yml')
text = path.read_text()
text = text.replace('127.0.0.1:9001:9001', '127.0.0.1:9002:9001')
path.write_text(text)
PY
docker compose up -d --build app
curl -fsS http://localhost:3080/health
```

## Restore database only if needed

Only restore PostgreSQL after confirming the backup is correct and the data/schema needs rollback.

```bash
ssh huytv@10.68.10.171
cd /home/huytv/ZaloCRM
docker compose stop app
cat manual-backups/pre-deploy-YYYYmmdd-HHMMSS.sql | docker exec -i zalo-crm-db psql -U crmuser zalocrm
docker compose up -d app
curl -fsS http://localhost:3080/health
```

Replace `YYYYmmdd-HHMMSS` with the actual backup filename.

## Useful overrides

The script defaults to production, but these environment variables are supported:

```bash
DEPLOY_HOST=huytv@10.68.10.171 \
DEPLOY_APP_DIR=/home/huytv/ZaloCRM \
DEPLOY_BRANCH=main \
scripts/deploy-production.sh
```

For a one-off command-line override:

```bash
scripts/deploy-production.sh --host huytv@10.68.10.171 --dir /home/huytv/ZaloCRM --branch main
```
