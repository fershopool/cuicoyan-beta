// Lógica pura de errores de sesión: sin red, sin almacenamiento, sin tokens. Nunca se muestra texto del servidor.
export const MESSAGES = {
  session: 'Tu sesión expiró o aún no inicias sesión. Inicia sesión para continuar.',
  idp: 'No pudimos verificar tu identidad en este momento. Tus cambios en pantalla no se perdieron; reintenta en unos minutos.',
  idpExpired: 'Seguimos sin poder verificar tu sesión. Por seguridad, inicia sesión de nuevo cuando el servicio esté disponible.',
  invitation: 'Esta invitación no es válida o ya expiró. Pide una nueva al equipo de Cuicoyan.',
  generic: 'No se pudo completar la operación. Inténtalo de nuevo.',
};

// kind: 'session' | 'idp' | 'invitation' | 'generic'. Solo se lee `code` (lista cerrada) y el estado HTTP.
export function classifyError(status, body, { invitation = false } = {}) {
  const code = body && typeof body === 'object' ? body.code : undefined;
  if (code === 'session_required' || code === 'session_expired' || status === 401) return 'session';
  if (code === 'idp_unavailable' || status === 503 || status === 0) return 'idp';
  if (invitation && status >= 400 && status < 500) return 'invitation';
  return 'generic';
}

// Con el IdP caído el servidor mantiene la sesión durante IDP_FAILURE_GRACE_SECONDS. La interfaz no cierra
// sesión ni borra nada en ese lapso; pasado el plazo deja de prometer que la sesión sigue vigente.
export function idpPhase({ failingSince, now, graceSeconds }) {
  if (failingSince == null) return 'ok';
  return now - failingSince <= Math.max(0, Number(graceSeconds) || 0) * 1000 ? 'grace' : 'expired';
}

export function messageFor(kind, phase = 'grace') {
  if (kind === 'idp') return phase === 'expired' ? MESSAGES.idpExpired : MESSAGES.idp;
  return MESSAGES[kind] || MESSAGES.generic;
}

export class ApiError extends Error {
  constructor(kind, phase = 'grace') {
    super(messageFor(kind, phase));
    this.kind = kind;
    this.phase = phase;
  }
}
