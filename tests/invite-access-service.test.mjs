import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

// Mismo patrón que admin-service.test.mjs: window antes de importar (la config lee el entorno).
const location = { origin: 'https://cuicoyan.test', pathname: '/perfil/', search: '', hash: '' };
globalThis.window = { location, history: globalThis.history };
globalThis.location = location;
// El servicio consulta document en invitationParams; comparte la misma location del navegador simulado.
globalThis.document = { location };

// Oráculo de historial: registra replaceState y aplica el fragmento como lo haría el navegador.
const replaceCalls = [];
const historyStub = {
  replaceState(state, title, url) {
    replaceCalls.push(String(url));
    const i = String(url).indexOf('#');
    location.hash = i >= 0 ? String(url).slice(i) : '';
  },
};
window.history = historyStub;
globalThis.history = historyStub;

const BASE = 'https://cuicoyan.test';
const authMod = () => import('../frontend/src/services/auth.service.js');
const adminMod = () => import('../frontend/src/services/admin.service.js');

// ---------- Mock de fetch ----------

let calls;
function mockFetch(status = 200, body = {}) {
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: new URL(String(url), BASE), init });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    };
  };
}

// Cabeceras pueden llegar como objeto plano o como Headers.
function header(init, name) {
  const h = init.headers;
  if (!h) return undefined;
  if (typeof h.get === 'function') return h.get(name) ?? undefined;
  const key = Object.keys(h).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? h[key] : undefined;
}

const realFetch = globalThis.fetch;
const realSession = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
const realLocal = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

afterEach(() => {
  globalThis.fetch = realFetch;
  if (realSession) Object.defineProperty(globalThis, 'sessionStorage', realSession);
  if (realLocal) Object.defineProperty(globalThis, 'localStorage', realLocal);
  replaceCalls.length = 0;
  location.hash = '';
});

// Espías de almacenamiento: cualquier escritura queda registrada.
function spyStorages() {
  const writes = [];
  const make = (name) => ({
    getItem: () => null,
    setItem: (k, v) => writes.push(`${name}.setItem:${k}`),
    removeItem: (k) => writes.push(`${name}.removeItem:${k}`),
    clear: () => writes.push(`${name}.clear`),
  });
  Object.defineProperty(globalThis, 'sessionStorage', { value: make('session'), configurable: true, writable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: make('local'), configurable: true, writable: true });
  return writes;
}

// ---------- auth.service: startInvitation ----------

test('startInvitation: POST a /auth/invite con cookie same-origin, cabecera CSRF y cuerpo JSON', async () => {
  const { startInvitation } = await authMod();
  mockFetch(200, { data: { redirect: '/perfil/?ok=1' } });
  await startInvitation('tok-123', '/admin/');
  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url.pathname, '/auth/invite');
  assert.equal(init.method, 'POST');
  assert.equal(init.credentials, 'same-origin');
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');
  assert.equal(header(init, 'Authorization'), undefined);
  assert.deepEqual(JSON.parse(init.body), { token: 'tok-123', return_to: '/admin/' });
});

test('startInvitation: return_to por defecto es /perfil/', async () => {
  const { startInvitation } = await authMod();
  mockFetch(200, { data: { redirect: '/perfil/' } });
  await startInvitation('tok-abc');
  assert.deepEqual(JSON.parse(calls[0].init.body), { token: 'tok-abc', return_to: '/perfil/' });
});

test('startInvitation: en éxito devuelve data.redirect', async () => {
  const { startInvitation } = await authMod();
  mockFetch(200, { data: { redirect: '/perfil/?bienvenida=1' } });
  assert.equal(await startInvitation('t'), '/perfil/?bienvenida=1');
});

test('startInvitation: una respuesta de error rechaza con ApiError kind "invitation"', async () => {
  const { startInvitation } = await authMod();
  for (const status of [400, 401, 404, 409]) {
    mockFetch(status, { error: 'invitación no válida' });
    await assert.rejects(startInvitation('x'), (e) => e.kind === 'invitation', `status ${status}`);
  }
});

// ---------- auth.service: invitationParams ----------

test('invitationParams: lee el token de #t= y limpia el fragmento con history.replaceState', async () => {
  const { invitationParams } = await authMod();
  location.hash = '#t=tok.ABC-_123';
  assert.deepEqual(invitationParams(), { token: 'tok.ABC-_123' });
  assert.equal(replaceCalls.length, 1, 'debe llamar replaceState una vez');
  assert.doesNotMatch(replaceCalls[0], /#|t=/);
  assert.equal(location.hash, '', 'el fragmento queda limpio');
});

test('invitationParams: sin fragmento devuelve token vacío', async () => {
  const { invitationParams } = await authMod();
  location.hash = '';
  assert.equal(invitationParams().token, '');
});

test('invitationParams: no escribe en sessionStorage ni localStorage', async () => {
  const { invitationParams, startInvitation } = await authMod();
  const writes = spyStorages();
  mockFetch(200, { data: { redirect: '/perfil/' } });
  location.hash = '#t=secreto-no-persistir';
  invitationParams();
  await startInvitation('secreto-no-persistir');
  assert.deepEqual(writes, [], 'no debe escribirse nada en almacenamiento');
});

// ---------- admin.service ----------

test('approveContactRequest: POST con el cuerpo de aprobación', async () => {
  const { approveContactRequest } = await adminMod();
  mockFetch(200, { data: { ok: true } });
  const body = { slug: 'ana-ruiz', display_name: 'Ana Ruiz' };
  const out = await approveContactRequest('req-1', { ...body, ttl_seconds: 3600 });
  const { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/admin/contact-requests/req-1/approve');
  assert.equal(init.method, 'POST');
  assert.equal(init.credentials, 'same-origin');
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');
  assert.deepEqual(JSON.parse(init.body), body);
  assert.deepEqual(out, { ok: true });
});

test('listAccounts: GET sin query si no hay parámetros; con limit/offset los incluye', async () => {
  const { listAccounts } = await adminMod();
  mockFetch(200, { data: [{ id: 'a' }] });
  const out = await listAccounts();
  assert.equal(calls[0].url.pathname, '/api/cuicoyan/admin/accounts');
  assert.equal(calls[0].url.search, '');
  assert.equal(calls[0].init.method ?? 'GET', 'GET');
  assert.deepEqual(out, [{ id: 'a' }]);

  await listAccounts({ limit: 20, offset: 40 });
  assert.equal(calls[1].url.pathname, '/api/cuicoyan/admin/accounts');
  assert.equal(calls[1].url.searchParams.get('limit'), '20');
  assert.equal(calls[1].url.searchParams.get('offset'), '40');
});

test('listAccounts: omite parámetros no definidos', async () => {
  const { listAccounts } = await adminMod();
  mockFetch(200, { data: [] });
  await listAccounts({ limit: 5, offset: undefined });
  assert.deepEqual([...calls[0].url.searchParams.keys()], ['limit']);
});

test('setAccountStatus: PATCH con {status} y id codificado', async () => {
  const { setAccountStatus } = await adminMod();
  mockFetch(200, { data: { status: 'suspendido' } });
  const id = 'a/b c?d#e';
  const out = await setAccountStatus(id, 'suspendido');
  const { url, init } = calls[0];
  assert.equal(url.pathname, `/api/cuicoyan/admin/accounts/${encodeURIComponent(id)}`);
  assert.equal(init.method, 'PATCH');
  assert.equal(init.credentials, 'same-origin');
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');
  assert.deepEqual(JSON.parse(init.body), { status: 'suspendido' });
  assert.deepEqual(out, { status: 'suspendido' });
});

test('listInvitations: GET a /api/cuicoyan/admin/invitations y devuelve data', async () => {
  const { listInvitations } = await adminMod();
  mockFetch(200, { data: [{ id: 'inv-1' }] });
  const out = await listInvitations({ limit: 10, offset: 0 });
  const { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/admin/invitations');
  assert.equal(url.searchParams.get('limit'), '10');
  assert.equal(url.searchParams.get('offset'), '0');
  assert.equal(init.credentials, 'same-origin');
  assert.deepEqual(out, [{ id: 'inv-1' }]);
});

test('revokeInvitation: DELETE con id codificado y devuelve data', async () => {
  const { revokeInvitation } = await adminMod();
  mockFetch(200, { data: { revoked: true } });
  const id = 'inv 1/÷';
  const out = await revokeInvitation(id);
  const { url, init } = calls[0];
  assert.equal(url.pathname, `/api/cuicoyan/admin/invitations/${encodeURIComponent(id)}`);
  assert.equal(init.method, 'DELETE');
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');
  assert.deepEqual(out, { revoked: true });
});

test('admin: 401, 403 y 409 se propagan como rechazo', async () => {
  const { approveContactRequest, listAccounts, setAccountStatus, listInvitations, revokeInvitation } = await adminMod();
  const ops = [
    () => approveContactRequest('r', { slug: 's', display_name: 'd' }),
    () => listAccounts({ limit: 1 }),
    () => setAccountStatus('p', 'activo'),
    () => listInvitations({ limit: 1 }),
    () => revokeInvitation('i'),
  ];
  for (const status of [401, 403, 409]) {
    mockFetch(status, { error: 'detalle' });
    for (const op of ops) await assert.rejects(op(), undefined, `status ${status}`);
  }
});
