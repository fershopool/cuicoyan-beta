import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { ApiError, MESSAGES, classifyError, idpPhase, messageFor } from '../frontend/src/services/auth-errors.js';

const src = (f) => readFileSync(new URL(`../frontend/src/${f}`, import.meta.url), 'utf8');

test('clasifica errores: sesión expirada, IdP caído, invitación inválida', () => {
  assert.equal(classifyError(401, { code: 'session_expired' }), 'session');
  assert.equal(classifyError(401, {}), 'session');
  assert.equal(classifyError(503, { code: 'idp_unavailable' }), 'idp');
  assert.equal(classifyError(0, null), 'idp');
  assert.equal(classifyError(400, { error: 'x' }, { invitation: true }), 'invitation');
  assert.equal(classifyError(400, { error: 'x' }), 'generic');
  assert.equal(classifyError(500, {}), 'generic');
});

test('IDP_FAILURE_GRACE_SECONDS: gracia sin cerrar sesión y luego expirada', () => {
  assert.equal(idpPhase({ failingSince: null, now: 10_000, graceSeconds: 300 }), 'ok');
  assert.equal(idpPhase({ failingSince: 0, now: 300_000, graceSeconds: 300 }), 'grace');
  assert.equal(idpPhase({ failingSince: 0, now: 300_001, graceSeconds: 300 }), 'expired');
  assert.notEqual(messageFor('idp', 'grace'), messageFor('idp', 'expired'));
});

test('los mensajes son fijos y no filtran detalles del servidor', () => {
  const err = new ApiError(classifyError(500, { error: 'password authentication failed for app_rw at 10.0.0.7', stack: 'x' }));
  assert.equal(err.message, MESSAGES.generic);
  for (const m of Object.values(MESSAGES)) assert.doesNotMatch(m, /app_rw|stack|token|10\.0|SQL|Keycloak/i);
});

test('apiRequest usa cookie same-origin y CSRF; sin Authorization ni almacenamiento', async () => {
  globalThis.window = { location: { origin: 'https://cuicoyan.ollin.digital', pathname: '/perfil/', search: '' } };
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return { ok: false, status: 503, json: async () => ({ code: 'idp_unavailable', error: 'detalle interno' }) }; };
  const { apiRequest } = await import('../frontend/src/services/auth.service.js');
  await assert.rejects(apiRequest('/api/cuicoyan/me/profile'), (e) => e.kind === 'idp' && !/interno/.test(e.message));
  assert.equal(calls[0].init.credentials, 'same-origin');
  assert.equal(calls[0].init.headers['X-Requested-With'], 'ollin-auth');
  assert.equal(calls[0].init.headers.Authorization, undefined);
});

test('el código de la web no guarda ni lee tokens ni usa Supabase', () => {
  const files = ['main.js', 'services/auth.service.js', 'services/auth-errors.js', 'config/environment.js'];
  for (const f of files) assert.doesNotMatch(src(f), /localStorage\.setItem\([^)]*token|sessionStorage|access_token|refresh_token|Bearer|supabase/i, f);
  assert.match(src('services/auth.service.js'), /\/auth\/login/);
});

test('el botón de login apunta a /auth/login y la invitación quita el token de la URL', () => {
  assert.match(src('main.js'), /loginUrl\(\)/);
  assert.match(src('main.js'), /stripInvitationFromUrl\(\)/);
  assert.ok(readdirSync(new URL('../frontend/src/services/', import.meta.url)).includes('auth-errors.js'));
});

test('Turnstile: widget en el formulario, token enviado, CSP solo abre challenges.cloudflare.com', () => {
  assert.match(src('components/join-form.js'), /turnstileWidget\(\)/);
  assert.match(src('components/join-form.js'), /turnstile_token: captcha\.token\(\)/);
  assert.match(src('components/turnstile.js'), /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/);
  const html = src('pages/unete/unete.html');
  assert.match(html, /script-src 'self' https:\/\/challenges\.cloudflare\.com;/);
  assert.match(html, /frame-src https:\/\/challenges\.cloudflare\.com;/);
  assert.doesNotMatch(html, /unsafe-eval|script-src[^;]*unsafe-inline|script-src[^;]*\*/);
  assert.doesNotMatch(src('config/environment.js') + src('components/turnstile.js'), /TURNSTILE_SECRET/);
});
