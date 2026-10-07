import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

globalThis.window = { location: { origin: 'http://localhost' } };
const { buildContactRequest, sendContactRequest } = await import('../frontend/src/services/contact-request.js');

test('el registro se mapea al contrato de contact-requests con el token de Turnstile', () => {
  const body = buildContactRequest({ roleKey: 'foro', name: 'Ana', email: 'a@x.mx', organization: 'Foro Sur', fields: { Folio: 'F1', 'Celular (WhatsApp)': '5512345678' }, turnstileToken: 'tok' });
  assert.equal(body.requested_profile_type, 'cultural_forum');
  assert.equal(body.turnstile_token, 'tok');
  assert.equal(body.requester_name, 'Ana');
  assert.match(body.message, /Celular \(WhatsApp\): 5512345678/);
  assert.equal(buildContactRequest({ roleKey: 'artista', name: 'a', email: 'e', organization: 'o', fields: { k: 'x'.repeat(9000) }, turnstileToken: 't' }).message.length, 5000);
  assert.equal(buildContactRequest({ roleKey: 'artista', name: 'a', email: 'e', organization: 'o', fields: {}, turnstileToken: 't' }).requested_profile_type, 'artist');
});

test('se envía por POST a la API del mismo origen y falla si responde error', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push([url, init]); return { ok: calls.length === 1 }; };
  await sendContactRequest({ a: 1 });
  assert.equal(calls[0][0], '/api/cuicoyan/contact-requests');
  assert.equal(calls[0][1].method, 'POST');
  await assert.rejects(sendContactRequest({ a: 1 }));
});

test('/unete ya no usa FormSubmit', () => {
  for (const f of ['components/join-form.js', 'config/environment.js', 'pages/unete/unete.html']) assert.doesNotMatch(readFileSync(new URL(`../frontend/src/${f}`, import.meta.url), 'utf8'), /formsubmit/i);
});
