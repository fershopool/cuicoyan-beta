// Lógica pura de la revisión de perfiles (sin red ni DOM). Probada en tests/profiles-admin-logic.test.mjs.

export const NOTE_MIN = 10;
export const NOTE_MAX = 500;
export const LIST_LIMIT = 100;
export const DECISIONS = ['published', 'rejected'];

const KINDS = {
  artista: { table: 'artist_profiles', label: 'Artista' },
  foro: { table: 'venue_profiles', label: 'Foro' },
};

export const tableFor = (kind) => KINDS[kind]?.table ?? null;
export const kindLabel = (kind) => KINDS[kind]?.label ?? 'Perfil';

// Valida la decisión y la nota. Rechazar exige una nota de al menos NOTE_MIN caracteres (sin contar espacios de los extremos).
export function validateDecision(kind, decision, note) {
  if (!tableFor(kind)) return { ok: false, error: 'Tipo de perfil no válido.' };
  if (!DECISIONS.includes(decision)) return { ok: false, error: 'Decisión no válida.' };
  const text = typeof note === 'string' ? note.trim() : '';
  if (text.length > NOTE_MAX) return { ok: false, error: `La nota no puede superar ${NOTE_MAX} caracteres.` };
  if (decision === 'rejected' && text.length < NOTE_MIN) {
    return { ok: false, error: `Para rechazar escribe una nota de al menos ${NOTE_MIN} caracteres.` };
  }
  return { ok: true, note: text || null };
}

function submittedTime(row) {
  const time = Date.parse(row?.submitted_at);
  return Number.isNaN(time) ? Infinity : time; // sin fecha, al final
}

// Une artistas y foros pendientes, marca el tipo y ordena por envío (más antiguo primero). Máximo LIST_LIMIT.
export function buildPendingList(artists = [], venues = []) {
  const tag = (kind) => (row) => ({ ...row, kind, kindLabel: kindLabel(kind) });
  return [...artists.map(tag('artista')), ...venues.map(tag('foro'))]
    .filter((row) => row && row.status === 'pending')
    .sort((a, b) => {
      const ta = submittedTime(a);
      const tb = submittedTime(b);
      if (ta === tb) return 0;
      return ta < tb ? -1 : 1;
    })
    .slice(0, LIST_LIMIT);
}

// Solo http y https. Cualquier otra cosa (javascript:, texto suelto, vacío) devuelve null.
export function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

// Enlace a la vista pública solo cuando el perfil ya está publicado.
export function canPreview(row) {
  return row?.status === 'published' && typeof row.slug === 'string' && row.slug.length > 0;
}

// Resumen legible de data (jsonb). Solo strings; nunca devuelve HTML.
export function summaryFields(row) {
  const d = row?.data && typeof row.data === 'object' ? row.data : {};
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const social = d.social && typeof d.social === 'object' ? d.social : {};
  return {
    bio: text(d.bio),
    place: [text(d.discipline), text(d.zone)].filter(Boolean).join(' · '),
    social: Object.entries(social)
      .filter(([, handle]) => text(handle))
      .map(([network, handle]) => `${network.charAt(0).toUpperCase()}${network.slice(1)}: ${text(handle)}`),
    website: safeHttpUrl(d.website),
  };
}

export function formatDate(iso) {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return '';
  return new Date(time).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}
