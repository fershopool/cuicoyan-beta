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

// El token de invitación llega en el fragmento (#t=...&o=...): no viaja al servidor ni al Referer. Se quita de la URL
// y se guarda en sessionStorage solo mientras dura el login; se borra al aceptar o al fallar la invitación.
const INVITE_KEY = 'cuicoyan_invite';
const store = () => { try { return window.sessionStorage; } catch { return null; } };

export function invitationParams() {
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (fragment.get('t')) {
    try { store()?.setItem(INVITE_KEY, JSON.stringify({ t: fragment.get('t'), o: fragment.get('o') || '' })); } catch { /* sin almacenamiento: queda en memoria */ }
    window.history.replaceState({}, document.title, window.location.pathname);
    return { token: fragment.get('t'), ollin: fragment.get('o') || '' };
  }
  try {
    const saved = JSON.parse(store()?.getItem(INVITE_KEY) || 'null');
    if (saved?.t) return { token: saved.t, ollin: saved.o || '' };
  } catch { /* almacenamiento corrupto: se ignora */ }
  return { token: '', ollin: '' };
}

// Tras entregar el token de Ollin al login, deja solo el token de Cuicoyan (el de Ollin es de un solo uso).
export function markOllinTokenUsed(token) {
  try { store()?.setItem(INVITE_KEY, JSON.stringify({ t: token, o: '' })); } catch { /* ver arriba */ }
}

export function clearInvitation() {
  try { store()?.removeItem(INVITE_KEY); } catch { /* ver arriba */ }
}

export function invitationLoginUrl(ollinToken) {
  return `/auth/login?${new URLSearchParams({ invite: ollinToken, return_to: '/invitacion/' })}`;
}
