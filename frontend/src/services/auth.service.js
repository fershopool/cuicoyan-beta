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
  throw new ApiError(kind, idpPhase({ failingSince: idpFailingSince, now: Date.now(), graceSeconds: environment.idpFailureGraceSeconds }));
}

export async function logout() {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-Requested-With': environment.csrfHeaderValue } });
  } catch { /* sin red: la cookie caduca sola */ }
}

export function invitationParams() {
  const params = new URLSearchParams(window.location.search);
  return { id: params.get('invitation_id') || '', token: params.get('token') || '' };
}

// El token de un solo uso no debe quedarse en la barra de direcciones ni en el historial.
export function stripInvitationFromUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}
