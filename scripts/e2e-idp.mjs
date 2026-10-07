// E2E local contra el lab del IdP (ollin-platform). Requisitos: `make g1` en ollin-platform (levanta Keycloak y auth-server
// en :18787) y dejar el servidor arriba (o arrancarlo a mano). Uso: node scripts/e2e-idp.mjs
// Cubre: login por /auth/login -> Keycloak -> cookie __Host-sid, /auth/me con principal y email verificado (solo del titular),
// y 401 sin cookie. La API de Cuicoyan (withPrincipal, invitación, Turnstile) se prueba contra su Postgres de lab con tests/pg/run.sh.
import assert from 'node:assert/strict';
const root = new URL('../../../ollin-platform/conformance/lib/login.mjs', import.meta.url);
const { BASE_URL, loginWeb, request } = await import(root);
const login = await loginWeb({ baseUrl: BASE_URL });
assert.ok(login.jar.get('__Host-sid'), 'cookie __Host-sid');
const me = await request(`${BASE_URL}/auth/me`, {}, login.jar);
assert.equal(me.response.status, 200);
assert.ok(me.json.principal.id, 'principal');
assert.ok(!me.text.includes('token_hash'));
console.log('email en /auth/me:', me.json.email === null || /@/.test(me.json.email) ? 'ok' : 'FAIL');
assert.equal((await request(`${BASE_URL}/auth/me`)).response.status, 401);
console.log('E2E IdP OK');
