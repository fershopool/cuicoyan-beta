import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

// Mismo patrón que auth-ui.test.mjs: window antes de importar el servicio (carga la config del entorno).
globalThis.window = { location: { origin: 'https://cuicoyan.test', pathname: '/admin/', search: '', hash: '' } };

// Importación dinámica: el servicio se carga después de fijar window.
const mod = () => import('../frontend/src/services/admin.service.js');

// Oráculo independiente: Buffer 'base64url' de Node no añade relleno.
const enc = (bytes) => Buffer.from(bytes).toString('base64url');
const u8 = (arr) => new Uint8Array(arr);
const bytesOf = (ab) => new Uint8Array(ab);
// Longitudes 1..5 (mod 3 distintos, producirían relleno en base64) y bytes que dan '-' y '_'.
const SAMPLES = [[0xff], [0xfe, 0x00], [0x00, 0xff, 0x80], [0xfb, 0xff, 0xbf, 0x01], [0x80, 0x81, 0x82, 0x83, 0xff]];

// ---------- Conversiones base64url puras ----------

test('b64uToBuffer/bufferToB64u: ida y vuelta con bytes no ASCII y sin relleno', async () => {
  const { b64uToBuffer, bufferToB64u } = await mod();
  for (const s of SAMPLES) {
    const bytes = u8(s);
    const str = bufferToB64u(bytes);
    assert.equal(str, enc(bytes));
    assert.doesNotMatch(str, /[=+/]/);
    assert.ok(b64uToBuffer(str) instanceof ArrayBuffer);
    assert.deepEqual(bytesOf(b64uToBuffer(str)), bytes);
  }
});

test('bufferToB64u acepta ArrayBuffer y Uint8Array con offset', async () => {
  const { bufferToB64u } = await mod();
  const bytes = u8([0xfb, 0xff, 0xbf, 0x01]);
  assert.equal(bufferToB64u(bytes.buffer), enc(bytes));
  const big = u8([9, 9, ...bytes, 9]);
  assert.equal(bufferToB64u(big.subarray(2, 2 + bytes.length)), enc(bytes));
});

test('creationOptionsFromServer: decodifica challenge, user.id y excludeCredentials, sin mutar ni perder campos', async () => {
  const { creationOptionsFromServer } = await mod();
  const data = {
    rp: { id: 'cuicoyan.test', name: 'Cuicoyan' },
    user: { id: enc([0xc3, 0xa9, 0x01]), name: 'ana@cuicoyan.test', displayName: 'Ana Ñandú' },
    challenge: enc([0xff, 0xfe, 0x10, 0x20, 0x30]),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    excludeCredentials: [{ type: 'public-key', id: enc([1, 2, 3, 4]), transports: ['internal'] }],
    serverOnly: { nested: [1, 2] },
  };
  const snapshot = structuredClone(data);
  const out = creationOptionsFromServer(data);

  assert.deepEqual(data, snapshot, 'no debe mutar data');
  assert.ok(out.challenge instanceof ArrayBuffer);
  assert.deepEqual(bytesOf(out.challenge), u8([0xff, 0xfe, 0x10, 0x20, 0x30]));
  assert.deepEqual(bytesOf(out.user.id), u8([0xc3, 0xa9, 0x01]));
  assert.deepEqual(bytesOf(out.excludeCredentials[0].id), u8([1, 2, 3, 4]));

  // Resto de campos intactos.
  assert.deepEqual(Object.keys(out).sort(), Object.keys(data).sort());
  assert.equal(out.user.name, snapshot.user.name);
  assert.equal(out.user.displayName, snapshot.user.displayName);
  assert.deepEqual(out.rp, snapshot.rp);
  assert.deepEqual(out.pubKeyCredParams, snapshot.pubKeyCredParams);
  assert.equal(out.timeout, 60000);
  assert.equal(out.attestation, 'none');
  assert.deepEqual(out.authenticatorSelection, snapshot.authenticatorSelection);
  assert.equal(out.excludeCredentials[0].type, 'public-key');
  assert.deepEqual(out.excludeCredentials[0].transports, ['internal']);
  assert.deepEqual(out.serverOnly, snapshot.serverOnly);
});

test('requestOptionsFromServer: decodifica challenge y allowCredentials, sin mutar ni perder campos', async () => {
  const { requestOptionsFromServer } = await mod();
  const data = {
    challenge: enc([0x00, 0xff, 0x7f, 0x80]),
    rpId: 'cuicoyan.test',
    timeout: 45000,
    userVerification: 'preferred',
    allowCredentials: [
      { type: 'public-key', id: enc([0xfa, 0xfb]), transports: ['usb', 'internal'] },
      { type: 'public-key', id: enc([0x01, 0x02, 0x03]) },
    ],
    extensions: { appid: 'https://cuicoyan.test' },
  };
  const snapshot = structuredClone(data);
  const out = requestOptionsFromServer(data);

  assert.deepEqual(data, snapshot, 'no debe mutar data');
  assert.ok(out.challenge instanceof ArrayBuffer);
  assert.deepEqual(bytesOf(out.challenge), u8([0x00, 0xff, 0x7f, 0x80]));
  assert.deepEqual(bytesOf(out.allowCredentials[0].id), u8([0xfa, 0xfb]));
  assert.deepEqual(bytesOf(out.allowCredentials[1].id), u8([0x01, 0x02, 0x03]));

  assert.deepEqual(Object.keys(out).sort(), Object.keys(data).sort());
  assert.equal(out.rpId, 'cuicoyan.test');
  assert.equal(out.timeout, 45000);
  assert.equal(out.userVerification, 'preferred');
  assert.deepEqual(out.allowCredentials[0].transports, ['usb', 'internal']);
  assert.equal(out.allowCredentials[1].type, 'public-key');
  assert.deepEqual(out.extensions, snapshot.extensions);
});

test('registrationToServer: attestationObject y clientDataJSON en base64url sin relleno', async () => {
  const { registrationToServer } = await mod();
  const attestation = u8([0xa3, 0xff, 0x01, 0xfe]);
  const clientData = u8([0x7b, 0xfe, 0x7d]);
  const credential = {
    id: 'no-se-usa',
    type: 'public-key',
    response: { attestationObject: attestation.buffer, clientDataJSON: clientData.buffer },
  };
  const out = registrationToServer(credential);
  assert.deepEqual(out, { attestationObject: enc(attestation), clientDataJSON: enc(clientData) });
  assert.doesNotMatch(out.attestationObject + out.clientDataJSON, /[=+/]/);
});

test('assertionToServer: credentialId sale de rawId y el resto de response, sin relleno', async () => {
  const { assertionToServer } = await mod();
  const rawId = u8([0xfa, 0xfb, 0x01]);
  const authData = u8([0x01, 0xff]);
  const clientData = u8([0xfe, 0x7d, 0x7b, 0x00]);
  const signature = u8([0x30, 0xff, 0x02]);
  const credential = {
    id: 'NO-USAR-ESTE-ID',
    type: 'public-key',
    rawId: rawId.buffer,
    response: {
      authenticatorData: authData.buffer,
      clientDataJSON: clientData.buffer,
      signature: signature.buffer,
      userHandle: enc([0x42]),
    },
  };
  const out = assertionToServer(credential);
  assert.deepEqual(out, {
    credentialId: enc(rawId),
    authenticatorData: enc(authData),
    clientDataJSON: enc(clientData),
    signature: enc(signature),
  });
  assert.doesNotMatch(Object.values(out).join(''), /[=+/]/);
});

// ---------- Funciones de red sobre apiRequest (fetch mockeado) ----------

let calls;
function mockFetch(status = 200, body = {}) {
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: new URL(String(url), 'https://cuicoyan.test'), init });
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

test('adminStatus: GET /api/cuicoyan/admin/status con same-origin y cabecera CSRF', async () => {
  const { adminStatus } = await mod();
  mockFetch(200, { ok: true });
  await adminStatus();
  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/admin/status');
  assert.equal(url.search, '');
  assert.equal((init.method ?? 'GET').toUpperCase(), 'GET');
  assert.equal(init.credentials, 'same-origin');
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');
});

test('listContactRequests: GET con query solo de los parámetros definidos', async () => {
  const { listContactRequests } = await mod();
  mockFetch(200, { items: [] });

  await listContactRequests({ status: 'nuevo', limit: 10, offset: 0 });
  let { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/admin/contact-requests');
  assert.equal((init.method ?? 'GET').toUpperCase(), 'GET');
  assert.equal(url.searchParams.get('status'), 'nuevo');
  assert.equal(url.searchParams.get('limit'), '10');
  assert.equal(url.searchParams.get('offset'), '0');
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');

  await listContactRequests({ status: undefined, limit: 5 });
  ({ url } = calls[1]);
  assert.deepEqual([...url.searchParams.keys()], ['limit']);

  await listContactRequests({});
  assert.equal(calls[2].url.search, '');
});

test('setContactStatus: PATCH /api/cuicoyan/admin/contact-requests/<id> con cuerpo {status}', async () => {
  const { setContactStatus } = await mod();
  mockFetch(200, {});
  await setContactStatus('abc-123', 'contactado');
  const { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/admin/contact-requests/abc-123');
  assert.equal(init.method.toUpperCase(), 'PATCH');
  assert.equal(typeof init.body, 'string');
  assert.deepEqual(JSON.parse(init.body), { status: 'contactado' });
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');
});

test('createInvitation: POST /api/cuicoyan/invitations con el cuerpo completo', async () => {
  const { createInvitation } = await mod();
  mockFetch(201, {});
  const payload = { kind: 'profile', profile_id: 'p-1', role: 'editor', email: 'invitada@cuicoyan.test', ttl_seconds: 3600 };
  await createInvitation(payload);
  const { url, init } = calls[0];
  assert.equal(url.pathname, '/api/cuicoyan/invitations');
  assert.equal(init.method.toUpperCase(), 'POST');
  assert.equal(typeof init.body, 'string');
  assert.deepEqual(JSON.parse(init.body), payload);
  assert.equal(header(init, 'X-Requested-With'), 'ollin-auth');
});

test('un 401 se propaga como error en todas las funciones de red', async () => {
  const { adminStatus, listContactRequests, setContactStatus, createInvitation } = await mod();
  mockFetch(401, { code: 'unauthenticated', error: 'sin sesión' });
  await assert.rejects(adminStatus());
  await assert.rejects(listContactRequests({}));
  await assert.rejects(setContactStatus('1', 'nuevo'));
  await assert.rejects(createInvitation({ kind: 'profile', profile_id: 'p', role: 'editor', email: 'a@cuicoyan.test', ttl_seconds: 60 }));
});
