// E2E completo contra el stack real levantado por scripts/e2e-full.sh (un solo origen, una sola BD, Keycloak real).
// No se ejecuta suelto: necesita las variables E2E_* que exporta el orquestador. Ver docs/e2e.md.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import test, { after } from 'node:test';

const here = import.meta.dirname;
const API = resolve(here, '../../../../AAA.Base/Identificador_tlatolli');
const { CookieJar, request, loginThroughIdp, idpEnv } = await import(pathToFileURL(resolve(here, '../../../../ollin-platform/conformance/lib/login.mjs')));
const { Client } = createRequire(`${API}/package.json`)('pg');

const env = (name) => process.env[name] || assert.fail(`falta ${name}: usa scripts/e2e-full.sh`);
const ORIGIN = env('E2E_ORIGIN');
const ISSUER = 'http://localhost:8081/realms/ollin-lab';
const KC = 'http://localhost:8081';
const TURNSTILE_DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX'; // valor de la documentación de pruebas de Cloudflare
const sh = promisify(execFile);
const run = randomBytes(4).toString('hex');
const secret = () => randomBytes(12).toString('hex');

// SQL como superusuario (solo para montar/inspeccionar datos; la API jamás lo usa).
const sql = async (query) => (await sh('docker', ['exec', '-i', env('E2E_PG_CONTAINER'), 'psql', '-X', '-At', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', env('E2E_PG_DB'), '-c', query])).stdout.trim();

// ---- Keycloak: usuarios del lab (admin = synthetic.user, más dos usuarios con email verificado) ----
async function kc(path, init = {}) {
  const tokenRes = await fetch(`${KC}/realms/master/protocol/openid-connect/token`, { method: 'POST', body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: idpEnv.KEYCLOAK_ADMIN_USERNAME || 'admin', password: env('KEYCLOAK_ADMIN_PASSWORD') }) });
  const { access_token } = await tokenRes.json();
  return fetch(`${KC}/admin/realms/ollin-lab${path}`, { ...init, headers: { authorization: `Bearer ${access_token}`, 'content-type': 'application/json' } });
}
async function kcUser(username) { return (await (await kc(`/users?username=${username}&exact=true`)).json())[0]; }
async function kcCreate(username) {
  const old = await kcUser(username);
  if (old) await kc(`/users/${old.id}`, { method: 'DELETE' });
  const password = secret();
  const email = `${username}.${run}@localhost.invalid`;
  const res = await kc('/users', { method: 'POST', body: JSON.stringify({ username, email, emailVerified: true, enabled: true, firstName: 'E2E', lastName: username, credentials: [{ type: 'password', value: password, temporary: false }] }) });
  assert.equal(res.status, 201, 'crear usuario en Keycloak');
  return { username, password, email };
}

// ---- Cliente HTTP del navegador simulado (mismo origen, cabecera CSRF) ----
const api = (jar, method, path, body, headers = {}) => request(`${ORIGIN}${path}`, {
  method,
  headers: { 'content-type': 'application/json', 'x-requested-with': 'ollin-auth', origin: ORIGIN, 'sec-fetch-site': 'same-origin', ...headers },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
}, jar);
const loginAs = async (user, inviteToken) => {
  const jar = new CookieJar();
  if (inviteToken) assert.equal((await api(jar, 'POST', '/auth/invite', { invite: inviteToken })).response.status, 204);
  await loginThroughIdp({ baseUrl: ORIGIN, jar, username: user.username, password: user.password });
  return jar;
};
const fragment = (invitePath) => Object.fromEntries(new URLSearchParams(invitePath.split('#')[1]));

const ctx = {};
const web = new Client({ connectionString: env('E2E_WEB_DATABASE_URL') });
after(async () => { await web.end().catch(() => {}); });

test('preparación: usuarios de Keycloak y admin cuicoyan en la BD compartida', async () => {
  ctx.invitee = await kcCreate('e2e.invitee');
  ctx.other = await kcCreate('e2e.other');
  const synthetic = await kcUser('synthetic.user');
  ctx.admin = { username: 'synthetic.user', password: idpEnv.KEYCLOAK_SYNTHETIC_PASSWORD, email: synthetic.email };
  assert.ok(ctx.admin.password, 'contraseña del usuario sintético del lab');
  await sql(`WITH p AS (INSERT INTO app.principals(status) VALUES ('active') RETURNING id),
    i AS (INSERT INTO app.identities(issuer, subject, principal_id) SELECT '${ISSUER}', '${synthetic.id}', id FROM p RETURNING principal_id)
    INSERT INTO app.memberships(principal_id, scope, role, status) SELECT principal_id, 'cuicoyan', 'admin', 'active' FROM i`);
  await web.connect();
});

test('un solo origen: /auth, /api y la web responden bajo el mismo host; /admin no se expone', async () => {
  assert.equal((await request(`${ORIGIN}/auth/me`)).response.status, 401);
  assert.equal((await request(`${ORIGIN}/api/cuicoyan/profiles`)).response.status, 200);
  for (const page of ['/unete/', '/invitacion/']) {
    const r = await request(`${ORIGIN}${page}`);
    assert.equal(r.response.status, 200, page);
    assert.match(r.response.headers.get('content-type'), /text\/html/);
  }
  assert.equal((await request(`${ORIGIN}/admin/invitations`, { method: 'POST' })).response.status, 404);
});

test('login real por Keycloak y autorización de admin en la API (membresía + sonda privilegiada)', async () => {
  ctx.adminJar = await loginAs(ctx.admin);
  assert.ok(ctx.adminJar.get('__Host-sid'), 'cookie de sesión');
  const me = await api(ctx.adminJar, 'GET', '/auth/me');
  assert.equal(me.response.status, 200);
  assert.ok(me.json.memberships.some((m) => m.scope === 'cuicoyan' && m.role === 'admin'));
  assert.equal((await api(ctx.adminJar, 'GET', '/api/cuicoyan/admin/contact-requests')).response.status, 200);
  assert.equal((await api(new CookieJar(), 'GET', '/api/cuicoyan/admin/contact-requests')).response.status, 401);
});

test('/unete: el formulario real (servicio del frontend) crea la solicitud con Turnstile de prueba', async () => {
  globalThis.window = { location: { origin: ORIGIN } };
  const { buildContactRequest, sendContactRequest } = await import(pathToFileURL(resolve(here, '../../frontend/src/services/contact-request.js')));
  const realFetch = globalThis.fetch;
  // Un navegador de mismo origen resuelve la ruta relativa y añade Origin / Sec-Fetch-Site; aquí lo imitamos.
  globalThis.fetch = (url, init) => realFetch(new URL(url, ORIGIN), { ...init, headers: { ...init.headers, origin: ORIGIN, 'sec-fetch-site': 'same-origin' } });
  ctx.requesterEmail = `solicitud.${run}@localhost.invalid`;
  try {
    await sendContactRequest(buildContactRequest({ roleKey: 'artista', name: 'Ana E2E', email: ctx.requesterEmail, organization: 'Colectivo E2E', fields: { Folio: run }, turnstileToken: TURNSTILE_DUMMY_TOKEN }));
  } finally { globalThis.fetch = realFetch; }
  assert.equal(await sql(`SELECT count(*) FROM cuicoyan.contact_requests WHERE email = '${ctx.requesterEmail}' AND status = 'received'`), '1');
  ctx.contactRequestId = await sql(`SELECT id FROM cuicoyan.contact_requests WHERE email = '${ctx.requesterEmail}'`);
});

test('/unete: falla cerrada sin captcha, sin cabecera CSRF, con origen ajeno y con cuerpo enorme', async () => {
  const body = { requester_name: 'X', email: `x.${run}@localhost.invalid`, requested_profile_type: 'artist' };
  const anon = new CookieJar();
  assert.equal((await api(anon, 'POST', '/api/cuicoyan/contact-requests', body)).response.status, 400, 'sin token');
  assert.equal((await api(anon, 'POST', '/api/cuicoyan/contact-requests', { ...body, turnstile_token: '' })).response.status, 400, 'token vacío');
  assert.equal((await api(anon, 'POST', '/api/cuicoyan/contact-requests', { ...body, turnstile_token: TURNSTILE_DUMMY_TOKEN }, { 'x-requested-with': 'x' })).response.status, 403, 'CSRF');
  assert.equal((await api(anon, 'POST', '/api/cuicoyan/contact-requests', { ...body, turnstile_token: TURNSTILE_DUMMY_TOKEN }, { origin: 'https://evil.example' })).response.status, 403, 'origen ajeno');
  assert.equal((await api(anon, 'POST', '/api/cuicoyan/contact-requests', { ...body, message: 'a'.repeat(20000), turnstile_token: TURNSTILE_DUMMY_TOKEN })).response.status, 400, 'cuerpo > 16 KB');
  assert.equal(await sql(`SELECT count(*) FROM cuicoyan.contact_requests WHERE email = 'x.${run}@localhost.invalid'`), '0');
});

test('withPrincipal y RLS: cada principal ve lo suyo; cuicoyan_web no toca app.*', async () => {
  // Rol de la web: sin acceso a app.*
  assert.equal((await web.query('SELECT current_user u')).rows[0].u, 'cuicoyan_web');
  for (const stmt of ['SELECT 1 FROM app.memberships', 'SELECT 1 FROM app.sessions', 'SELECT 1 FROM app.invitations', "INSERT INTO app.principals(status) VALUES ('active')", "UPDATE app.memberships SET role = 'admin'"]) {
    await assert.rejects(web.query(stmt), /permission denied/, stmt);
  }
  // Dos principales con un perfil cada uno (uno publicado, otro borrador).
  const [a, b] = (await sql(`INSERT INTO app.principals(status) SELECT 'active' FROM generate_series(1,2) RETURNING id`)).split('\n');
  await sql(`WITH p1 AS (INSERT INTO cuicoyan.profiles(profile_type, slug, display_name, status) VALUES ('artist','rls-a-${run}','A','published') RETURNING id),
    p2 AS (INSERT INTO cuicoyan.profiles(profile_type, slug, display_name, status) VALUES ('artist','rls-b-${run}','B','draft') RETURNING id)
    INSERT INTO cuicoyan.profile_members(profile_id, principal_id, member_role, membership_status)
      SELECT p1.id, '${a}'::uuid, 'owner', 'active' FROM p1 UNION ALL SELECT p2.id, '${b}'::uuid, 'owner', 'active' FROM p2`);
  process.env.CUICOYAN_DATABASE_URL = env('E2E_WEB_DATABASE_URL');
  const { withPrincipal, closeCuicoyanPool } = await import(pathToFileURL(`${API}/lib/cuicoyan/db.ts`));
  try {
    const slugs = (p) => withPrincipal(p, async (q) => (await q(`SELECT slug FROM cuicoyan.profiles WHERE slug LIKE 'rls-%-${run}' ORDER BY slug`)).rows.map((r) => r.slug));
    const members = (p) => withPrincipal(p, async (q) => (await q(`SELECT principal_id FROM cuicoyan.profile_members WHERE principal_id IN ('${a}','${b}')`)).rows.map((r) => r.principal_id));
    assert.deepEqual(await slugs(null), [`rls-a-${run}`], 'anónimo: solo publicados');
    assert.deepEqual(await slugs(a), [`rls-a-${run}`]);
    assert.deepEqual(await slugs(b), [`rls-a-${run}`, `rls-b-${run}`], 'B ve el publicado y su borrador');
    assert.deepEqual(await members(a), [a], 'A solo ve su membresía');
    assert.deepEqual(await members(null), []);
    const hijack = await withPrincipal(a, (q) => q(`UPDATE cuicoyan.profiles SET display_name = 'hack' WHERE slug = 'rls-b-${run}'`));
    assert.equal(hijack.rowCount, 0, 'A no puede editar el perfil de B');
    assert.equal(await withPrincipal(null, async (q) => (await q('SELECT count(*)::int n FROM cuicoyan.contact_requests')).rows[0].n), 0, 'el visitante no lee solicitudes');
    assert.equal(await withPrincipal(a, async (q) => (await q("SELECT nullif(current_setting('app.principal_id', true), '') p")).rows[0].p), a);
    assert.equal(await withPrincipal(null, async (q) => (await q("SELECT nullif(current_setting('app.principal_id', true), '') p")).rows[0].p), null, 'el contexto no se hereda entre llamadas');
  } finally { await closeCuicoyanPool(); }
});

test('invitación: crear perfil desde la solicitud e invitar (token opaco, hash en BD, TTL 30 min)', async () => {
  const slug = `e2e-${run}`;
  const profile = await api(ctx.adminJar, 'POST', '/api/cuicoyan/admin/profiles', { profile_type: 'artist', slug, display_name: 'Ana E2E', contact_request_id: ctx.contactRequestId });
  assert.equal(profile.response.status, 201, profile.text);
  ctx.profileId = profile.json.data.id;
  assert.equal(await sql(`SELECT status FROM cuicoyan.contact_requests WHERE id = '${ctx.contactRequestId}'`), 'converted');
  const inv = await api(ctx.adminJar, 'POST', `/api/cuicoyan/admin/profiles/${ctx.profileId}/invite`, { email: ctx.invitee.email, contact_request_id: ctx.contactRequestId });
  assert.equal(inv.response.status, 201, inv.text);
  const { t, o } = fragment(inv.json.data.invite_path);
  assert.match(inv.json.data.invite_path, /^\/invitacion\/#/);
  assert.match(t, /^[A-Za-z0-9_-]{43}$/, 'token opaco de 256 bits');
  assert.ok(o, 'token de Ollin');
  Object.assign(ctx, { t, o });
  assert.equal(inv.text.split(t).length, 2, 'el token aparece una sola vez en la respuesta (invite_path)');
  assert.equal(await sql(`SELECT count(*) FROM cuicoyan.invitations i WHERE i::text LIKE '%${t}%'`), '0', 'la BD no guarda el token, solo su hash');
  const row = await sql(`SELECT octet_length(token_hash), status, round(extract(epoch FROM expires_at - created_at)/60)::int, invited_email FROM cuicoyan.invitations WHERE profile_id = '${ctx.profileId}'`);
  assert.equal(row, `32|pending|30|${ctx.invitee.email}`);
});

test('invitación ligada al email: otra persona no puede usar ni el token de Ollin ni el de Cuicoyan', async () => {
  // Ollin: el token de la invitación solo provisiona al email invitado.
  const jar = new CookieJar();
  assert.equal((await api(jar, 'POST', '/auth/invite', { invite: ctx.o })).response.status, 204);
  await assert.rejects(loginThroughIdp({ baseUrl: ORIGIN, jar, username: ctx.other.username, password: ctx.other.password }), /HTTP 40[13]/);
  assert.equal((await api(new CookieJar(), 'GET', `/auth/login?invite=${ctx.o}`)).response.status, 400, 'L6: invite ya no viaja por query');
  // Cuicoyan: other entra con SU invitación de Ollin y presenta el token de Cuicoyan ajeno.
  const inviteOther = await request(`${env('E2E_AUTH_INTERNAL')}/admin/invitations`, { method: 'POST', headers: { authorization: `Bearer ${env('E2E_ADMIN_TOKEN')}`, 'content-type': 'application/json' }, body: JSON.stringify({ email: ctx.other.email, scope: 'cuicoyan', role: 'member', expires_in: 1800 }) });
  assert.equal(inviteOther.response.status, 201);
  ctx.otherJar = await loginAs(ctx.other, inviteOther.json.token);
  const stolen = await api(ctx.otherJar, 'POST', '/api/cuicoyan/me/invitations/accept', { token: ctx.t });
  assert.equal(stolen.response.status, 400);
  assert.equal(stolen.json.error, 'Invitación no válida');
  assert.equal(await sql(`SELECT status FROM cuicoyan.invitations WHERE profile_id = '${ctx.profileId}'`), 'pending', 'el intento ajeno no consume el token');
});

test('invitación de un solo uso: el invitado acepta una vez; reuso y manipulación se rechazan', async () => {
  ctx.inviteeJar = await loginAs(ctx.invitee, ctx.o);
  const me = await api(ctx.inviteeJar, 'GET', '/auth/me');
  assert.equal(me.json.email, ctx.invitee.email, 'email verificado de la identidad');
  assert.equal((await api(ctx.inviteeJar, 'GET', '/api/cuicoyan/admin/contact-requests')).response.status, 403, 'un miembro no es admin');
  assert.equal((await api(new CookieJar(), 'POST', '/api/cuicoyan/me/invitations/accept', { token: ctx.t })).response.status, 401, 'sin sesión');
  assert.equal((await api(ctx.inviteeJar, 'POST', '/api/cuicoyan/me/invitations/accept', { token: `${ctx.t}x` })).response.status, 400, 'token alterado');
  const ok = await api(ctx.inviteeJar, 'POST', '/api/cuicoyan/me/invitations/accept', { token: ctx.t });
  assert.equal(ok.response.status, 200, ok.text);
  assert.equal(ok.json.data.profile_id, ctx.profileId);
  // Hallazgo: next.config.mjs pisa el Referrer-Policy: no-referrer que fija la ruta (llega strict-origin-when-cross-origin); la cabecera de una respuesta JSON no afecta navegaciones y la página ya lo fija por <meta>.
  assert.equal(ok.response.headers.get('cache-control'), 'no-store');
  for (const jar of [ctx.inviteeJar, ctx.otherJar]) {
    const reuse = await api(jar, 'POST', '/api/cuicoyan/me/invitations/accept', { token: ctx.t });
    assert.equal(reuse.response.status, 400, 'reuso rechazado');
    assert.equal(reuse.json.error, 'Invitación no válida');
  }
  assert.equal(await sql(`SELECT status FROM cuicoyan.invitations WHERE profile_id = '${ctx.profileId}'`), 'accepted');
  assert.equal((await api(ctx.inviteeJar, 'GET', '/api/cuicoyan/me/profile')).json.data.profiles[0].id, ctx.profileId, 'el invitado ve su perfil');
  assert.equal((await api(ctx.otherJar, 'GET', '/api/cuicoyan/me/profile')).json.data, null, 'otro principal no ve nada');
  assert.equal(await sql(`SELECT string_agg(action, ',' ORDER BY action) FROM cuicoyan.audit_log WHERE metadata->>'profile_id' = '${ctx.profileId}' AND action LIKE 'invitation.%'`), 'invitation.accepted,invitation.created');
});

test('invitación: reinvitar revoca la anterior y una invitación vencida no se acepta', async () => {
  const invite = async (profileId) => fragment((await api(ctx.adminJar, 'POST', `/api/cuicoyan/admin/profiles/${profileId}/invite`, { email: ctx.other.email })).json.data.invite_path).t;
  const second = (await api(ctx.adminJar, 'POST', '/api/cuicoyan/admin/profiles', { profile_type: 'cultural_forum', slug: `e2e-foro-${run}`, display_name: 'Foro E2E' })).json.data.id;
  const old = await invite(second);
  const fresh = await invite(second);
  assert.equal((await api(ctx.otherJar, 'POST', '/api/cuicoyan/me/invitations/accept', { token: old })).response.status, 400, 'la anterior quedó revocada');
  // Vencida: se fuerza el reloj de la fila (el TTL real de 30 min se comprobó arriba).
  await sql(`UPDATE cuicoyan.invitations SET created_at = now() - interval '2 hours', expires_at = now() - interval '1 hour' WHERE profile_id = '${second}' AND status = 'pending'`);
  assert.equal((await api(ctx.otherJar, 'POST', '/api/cuicoyan/me/invitations/accept', { token: fresh })).response.status, 400, 'vencida');
  assert.equal(await sql(`SELECT count(*) FROM cuicoyan.profile_members WHERE profile_id = '${second}'`), '0');
});

test('/unete: límite de tasa por IP (CF-Connecting-IP de confianza) responde 429', async () => {
  const anon = new CookieJar();
  const statuses = [];
  for (let i = 0; i < 10; i += 1) statuses.push((await api(anon, 'POST', '/api/cuicoyan/contact-requests', { requester_name: 'R' })).response.status);
  assert.ok(statuses.includes(429), `esperaba un 429 en ${statuses}`);
});
