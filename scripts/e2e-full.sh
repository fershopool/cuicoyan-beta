#!/usr/bin/env bash
# E2E completo: Keycloak real + auth-server real + API de Cuicoyan (Next) + web estática, todo detrás de UN origen
# (http://localhost:18787) y con UNA base Postgres compartida (app.* del IdP y cuicoyan.*). Ver docs/e2e.md.
set -Eeuo pipefail
WEB=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
PLATFORM=$(CDPATH= cd -- "$WEB/../../ollin-platform" && pwd)
API=$(CDPATH= cd -- "$WEB/../../AAA.Base/Identificador_tlatolli" && pwd)
IDP=$PLATFORM/iac/idp-lab
KIT=$PLATFORM/kits/auth-server
OUT=$WEB/.e2e
PG=cuicoyan-e2e-pg; DB=ollin_e2e
P_PG=55434; P_AUTH=18790; P_API=13001; P_WEB=14173; P_PROXY=18787
ORIGIN=http://localhost:$P_PROXY
mkdir -p "$OUT"; umask 077

log() { printf '[e2e] %s\n' "$*"; }
for bin in docker node npm curl openssl lsof; do command -v "$bin" >/dev/null || { echo "falta $bin" >&2; exit 1; }; done
docker info >/dev/null 2>&1 || { echo 'Docker no está corriendo' >&2; exit 1; }
for p in $P_PROXY $P_AUTH $P_API $P_WEB $P_PG; do
  lsof -ti "tcp:$p" -sTCP:LISTEN >/dev/null 2>&1 && { echo "puerto $p ocupado (¿make g1 o una corrida previa sigue arriba?)" >&2; exit 1; }
done

cleanup() {
  for p in $P_PROXY $P_AUTH $P_API $P_WEB; do lsof -ti "tcp:$p" -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true; done
  [[ "${E2E_KEEP:-0}" == 1 ]] || docker rm -f "$PG" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

# 1) Keycloak (IdP real). Los secretos del lab se generan en iac/idp-lab (ignorados por git).
log 'Keycloak'
"$IDP/scripts/gen-secrets.sh" >/dev/null
(cd "$IDP" && docker compose --profile keycloak up -d >/dev/null 2>&1)
for _ in $(seq 1 90); do curl -fsS http://127.0.0.1:8081/realms/ollin-lab/.well-known/openid-configuration >/dev/null 2>&1 && break; sleep 1; done
curl -fsS http://127.0.0.1:8081/realms/ollin-lab/.well-known/openid-configuration >/dev/null

# 2) Postgres compartido y desechable: IdP (app.*) + Cuicoyan (cuicoyan.*) en la MISMA base.
log 'Postgres compartido'
docker image inspect ollin-pg:lab >/dev/null 2>&1 || docker build -t ollin-pg:lab "$PLATFORM/conformance/pg" >/dev/null
docker rm -f "$PG" >/dev/null 2>&1 || true
docker run -d --name "$PG" -e POSTGRES_PASSWORD="$(openssl rand -hex 16)" -e POSTGRES_DB=$DB -p 127.0.0.1:$P_PG:5432 ollin-pg:lab >/dev/null
for _ in $(seq 1 60); do docker exec "$PG" pg_isready -U postgres -d $DB >/dev/null 2>&1 && break; sleep 1; done
sleep 2
psq() { docker exec -i -e PGOPTIONS=--client-min-messages=warning "$PG" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d $DB "$@"; }
apply() { psq -f - <"$1" >/dev/null; }
apply "$API/tests/pg/fixtures/lab_stub.sql"
for f in "$KIT"/migrations/*.sql; do apply "$f"; done
apply "$API/supabase/20260926_cuicoyan_profiles.sql"
apply "$API/supabase/20260927_cuicoyan_profile_workflow.sql"
for f in "$API"/supabase/20261*_cuicoyan_*.sql; do apply "$f"; done
APP_PW=$(openssl rand -hex 16); WEB_PW=$(openssl rand -hex 16)
psq -c "ALTER ROLE app_rw LOGIN PASSWORD '$APP_PW' NOSUPERUSER NOBYPASSRLS; ALTER ROLE cuicoyan_web LOGIN PASSWORD '$WEB_PW' NOSUPERUSER NOBYPASSRLS"

# 3) auth-server real (puerto interno; el origen público es el del proxy, que es el registrado en Keycloak).
log 'auth-server'
set -a; source "$IDP/.env"; set +a
(cd "$KIT" && npm run build >/dev/null)
ADMIN_TOKEN=$(openssl rand -hex 24)
cat >"$OUT/auth.env" <<ENV
NODE_ENV=lab
ISSUER=http://localhost:8081/realms/ollin-lab
CLIENT_ID=ollin-lab-api
CLIENT_KEY_PATH=$IDP/secrets/ollin-client.key.pem
CLIENT_KEY_ALG=RS256
CLIENT_KEY_ID=ollin-lab-rsa
REDIRECT_URI=$ORIGIN/auth/callback
PUBLIC_ORIGIN=$ORIGIN
DATABASE_URL=postgres://app_rw:$APP_PW@127.0.0.1:$P_PG/$DB
PORT=$P_AUTH
TIER=T2
APP_HANDOFF_URI=ollin-lab://auth/handoff
CELL_ENCRYPTION_KEY=$(openssl rand -base64 32)
COOKIE_MAX_AGE_SECONDS=43200
CSRF_HEADER_VALUE=ollin-auth
FLOW_TTL_SECONDS=600
HANDOFF_TTL_SECONDS=60
SESSION_IDLE_SECONDS=1800
SESSION_ABSOLUTE_SECONDS=43200
ACCESS_TTL_SECONDS=900
REFRESH_IDLE_SECONDS=1209600
REFRESH_ABSOLUTE_SECONDS=7776000
SESSION_CACHE_SECONDS=5
LAST_SEEN_WRITE_SECONDS=300
IDP_CHECK_INTERVAL_SECONDS=10
OIDC_SCOPE=openid
IDP_FAILURE_GRACE_SECONDS=3600
RATE_LIMIT_MAX=200
RATE_LIMIT_WINDOW_SEC=5
ADMIN_TOKEN=$ADMIN_TOKEN
DB_POOL_MAX=10
DB_STATEMENT_TIMEOUT_MS=5000
DB_LOCK_TIMEOUT_MS=2000
DB_IDLE_TRANSACTION_TIMEOUT_MS=5000
ALLOW_INSECURE_IDP=1
ATTESTOR=lab
REQUIRE_MEMBERSHIP=true
MIN_CLIENT_VERSION=1.0.0
RECOMMENDED_CLIENT_VERSION=1.0.0
ENV
(set -a; source "$OUT/auth.env"; set +a; cd "$KIT" && exec node dist/src/server.js >"$OUT/auth-server.log" 2>&1) &
for _ in $(seq 1 30); do curl -sS -o /dev/null "http://127.0.0.1:$P_AUTH/healthz" 2>/dev/null && break; sleep 1; done
curl -fsS "http://127.0.0.1:$P_AUTH/healthz" >/dev/null

# 4) API de Cuicoyan (Next.js, build de producción) con rol cuicoyan_web y Turnstile de PRUEBA de Cloudflare.
log 'API Next.js (build + start)'
(cd "$API" && npx next build >"$OUT/next-build.log" 2>&1)
(cd "$API" && exec env \
  CUICOYAN_DATABASE_URL="postgres://cuicoyan_web:$WEB_PW@127.0.0.1:$P_PG/$DB" \
  OLLIN_AUTH_INTERNAL_URL="http://127.0.0.1:$P_AUTH" OLLIN_ADMIN_TOKEN="$ADMIN_TOKEN" OLLIN_CSRF_HEADER_VALUE=ollin-auth \
  CUICOYAN_ALLOWED_ORIGIN="$ORIGIN" TRUST_PROXY=true \
  TURNSTILE_SECRET=1x0000000000000000000000000000000AA \
  npx next start -p $P_API >"$OUT/next.log" 2>&1) &
for _ in $(seq 1 60); do curl -fsS "http://127.0.0.1:$P_API/api/cuicoyan/profiles" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS "http://127.0.0.1:$P_API/api/cuicoyan/profiles" >/dev/null || { tail -n 20 "$OUT/next.log" >&2; exit 1; }

# 5) Web estática + proxy de un solo origen.
log "proxy de un solo origen $ORIGIN"
(cd "$WEB/frontend" && exec env PORT=$P_WEB node ../scripts/dev-server.mjs frontend >"$OUT/web.log" 2>&1) &
(exec env PORT=$P_PROXY AUTH_URL="http://127.0.0.1:$P_AUTH" API_URL="http://127.0.0.1:$P_API" WEB_URL="http://127.0.0.1:$P_WEB" node "$WEB/scripts/e2e-proxy.mjs" >"$OUT/proxy.log" 2>&1) &
for _ in $(seq 1 20); do curl -fsS "$ORIGIN/healthz" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS "$ORIGIN/healthz" >/dev/null

log 'pruebas'
E2E_ORIGIN=$ORIGIN E2E_PG_CONTAINER=$PG E2E_PG_DB=$DB E2E_ADMIN_TOKEN=$ADMIN_TOKEN \
E2E_WEB_DATABASE_URL="postgres://cuicoyan_web:$WEB_PW@127.0.0.1:$P_PG/$DB" E2E_AUTH_INTERNAL="http://127.0.0.1:$P_AUTH" \
BASE_URL=$ORIGIN CSRF_HEADER_VALUE=ollin-auth KEYCLOAK_ADMIN_PASSWORD="$KEYCLOAK_ADMIN_PASSWORD" \
  node --test --test-reporter=spec "$WEB/tests/e2e/full.test.mjs"
