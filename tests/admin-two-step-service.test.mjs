import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

// Mismo patrón que invite-access-service.test.mjs: window antes de importar (la config lee el entorno).
const location = { origin: 'https://cuicoyan.test', pathname: '/admin/', search: '', hash: '' };
globalThis.window = { location, history: globalThis.history };
globalThis.location = location;
globalThis.document = { location };

const BASE = 'https://cuicoyan.test';
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

afterEach(() => {
  globalThis.fetch = realFetch;
});

// ---------- inviteApprovedRequest ----------

test('inviteApprovedRequest: POST same-origin al endpoint con id codificado, cabecera X-Requested-With y cuerpo {}', async () => {
  mockFetch(200, { data: { invite_url: 'https://cuicoyan.test/i/x' } });
  const { inviteApprovedRequest } = await adminMod();

  const out = await inviteApprovedRequest('a/b c');

  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/admin/contact-requests/' + encodeURIComponent('a/b c') + '/invite');
  assert.equal(init.method, 'POST');
  assert.equal(init.credentials, 'same-origin');
  assert.ok(header(init, 'X-Requested-With'), 'falta cabecera X-Requested-With');
  assert.deepEqual(JSON.parse(init.body), {});
  assert.deepEqual(out, { invite_url: 'https://cuicoyan.test/i/x' });
});

test('inviteApprovedRequest: envía ttl_seconds en el cuerpo cuando se pasa', async () => {
  mockFetch(200, { data: {} });
  const { inviteApprovedRequest } = await adminMod();

  await inviteApprovedRequest('42', { ttl_seconds: 3600 });

  assert.deepEqual(JSON.parse(calls[0].init.body), { ttl_seconds: 3600 });
});

for (const status of [401, 403, 409]) {
  test(`inviteApprovedRequest: un ${status} rechaza la promesa`, async () => {
    mockFetch(status, { error: 'nope' });
    const { inviteApprovedRequest } = await adminMod();

    await assert.rejects(inviteApprovedRequest('42'));
  });
}

// ---------- approveContactRequest ----------

test('approveContactRequest: POST a /approve con cuerpo exacto {slug, display_name} y devuelve .data', async () => {
  mockFetch(200, { data: { status: 'approved' } });
  const { approveContactRequest } = await adminMod();

  const out = await approveContactRequest('42', { slug: 'ana', display_name: 'Ana Pérez' });

  const { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/admin/contact-requests/42/approve');
  assert.equal(init.method, 'POST');
  assert.equal(init.credentials, 'same-origin');
  assert.deepEqual(JSON.parse(init.body), { slug: 'ana', display_name: 'Ana Pérez' });
  assert.deepEqual(out, { status: 'approved' });
});

test('approveContactRequest: ignora ttl_seconds aunque se pase', async () => {
  mockFetch(200, { data: {} });
  const { approveContactRequest } = await adminMod();

  await approveContactRequest('42', { slug: 'ana', display_name: 'Ana', ttl_seconds: 60 });

  assert.deepEqual(JSON.parse(calls[0].init.body), { slug: 'ana', display_name: 'Ana' });
});

// ---------- ollinListText ----------

test('ollinListText: solo filas approved, en orden, formato correo<TAB>nombre<TAB>fecha UTC', async () => {
  const { ollinListText } = await adminMod();

  const text = ollinListText([
    { email: 'a@x.test', requester_name: 'Ana', status: 'approved', created_at: '2026-10-01T10:00:00Z' },
    { email: 'b@x.test', requester_name: 'Beto', status: 'pending', created_at: '2026-10-02T10:00:00Z' },
    { email: 'c@x.test', requester_name: 'Carla', status: 'rejected', created_at: '2026-10-03T10:00:00Z' },
    { email: 'd@x.test', requester_name: 'Dani', status: 'approved', created_at: '2026-09-30T08:30:00Z' },
  ]);

  assert.equal(text, 'a@x.test\tAna\t2026-10-01\nd@x.test\tDani\t2026-09-30');
});

test('ollinListText: tabuladores y saltos de línea dentro de los campos se vuelven espacio', async () => {
  const { ollinListText } = await adminMod();

  const text = ollinListText([
    { email: 'e@x.test', requester_name: 'Eva\tMaría\nLópez\r\nRuiz', status: 'approved', created_at: '2026-10-05T12:00:00Z' },
  ]);

  assert.equal(text, 'e@x.test\tEva María López Ruiz\t2026-10-05');
});

test('ollinListText: fecha en el borde del día UTC', async () => {
  const { ollinListText } = await adminMod();

  const text = ollinListText([
    { email: 'f@x.test', requester_name: 'F', status: 'approved', created_at: '2026-10-13T23:59:59Z' },
    { email: 'g@x.test', requester_name: 'G', status: 'approved', created_at: '2026-10-14T00:00:00Z' },
  ]);

  assert.equal(text, 'f@x.test\tF\t2026-10-13\ng@x.test\tG\t2026-10-14');
});

test('ollinListText: omite filas approved sin email', async () => {
  const { ollinListText } = await adminMod();

  const text = ollinListText([
    { requester_name: 'Sin correo', status: 'approved', created_at: '2026-10-01T10:00:00Z' },
    { email: 'h@x.test', requester_name: 'H', status: 'approved', created_at: '2026-10-01T10:00:00Z' },
  ]);

  assert.equal(text, 'h@x.test\tH\t2026-10-01');
});

test('ollinListText: arreglo vacío o sin filas válidas devuelve cadena vacía', async () => {
  const { ollinListText } = await adminMod();

  assert.equal(ollinListText([]), '');
  assert.equal(ollinListText([{ email: 'i@x.test', requester_name: 'I', status: 'pending', created_at: '2026-10-01T10:00:00Z' }]), '');
});
