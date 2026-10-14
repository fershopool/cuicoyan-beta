import { environment } from '../config/environment.js';
import { ApiError, classifyError, idpPhase } from './auth-errors.js';

// La sesión es una cookie HttpOnly del auth-server (/auth) en el mismo origen: el JS nunca ve ni guarda tokens.
let idpFailingSince = null; // solo en memoria

export function loginUrl(returnTo = `${window.location.pathname}${window.location.search}`) {
  const safe = typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';
  return `/auth/login?${new URLSearchParams({ return_to: safe })}`;
}

export async function apiRequest(path, options = {}, { invitation = false } = {}) {
  let response;
  try {
    response = await fetch(new URL(path, environment.cuicoyanApiUrl || window.location.origin), {
      ...options,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': environment.csrfHeaderValue, ...(options.headers || {}) },
    });
  } catch {
    response = { ok: false, status: 0, json: async () => ({}) };
  }
  const body = await response.json().catch(() => ({}));
  if (response.ok) { idpFailingSince = null; return body; }
  const kind = classifyError(response.status, body, { invitation });
  if (kind === 'idp') idpFailingSince ??= Date.now();
  const error = new ApiError(kind, idpPhase({ failingSince: idpFailingSince, now: Date.now(), graceSeconds: environment.idpFailureGraceSeconds }));
  // Solo el código de una lista cerrada del servidor (p. ej. slug_taken); nunca el texto del error.
  error.code = typeof body?.code === 'string' ? body.code : undefined;
  throw error;
}

export async function logout() {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-Requested-With': environment.csrfHeaderValue } });
  } catch { /* sin red: la cookie caduca sola */ }
}

// El token de invitación llega en el fragmento (#t=...): no viaja al servidor ni al Referer. Se quita de la URL
// y no se guarda en ningún almacenamiento: vive solo en memoria de la página hasta que se inicia el login.
export function invitationParams() {
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const token = fragment.get('t') || '';
  if (window.location.hash) window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
  return { token };
}

// El servidor guarda la invitación en la cookie de flujo y devuelve la URL de autorización del IdP.
export async function startInvitation(token, returnTo = '/perfil/') {
  let response;
  try {
    response = await fetch('/auth/invite', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': environment.csrfHeaderValue },
      body: JSON.stringify({ token, return_to: returnTo }),
    });
  } catch {
    throw new ApiError('invitation');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body?.data?.redirect !== 'string') throw new ApiError('invitation');
  return body.data.redirect;
}
