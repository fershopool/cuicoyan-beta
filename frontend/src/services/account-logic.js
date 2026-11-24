// Lógica pura de la página /cuenta/: títulos de tipo, insignias de estado, enlaces a /perfil/ y favoritos. Sin DOM ni red. Probada en tests/account-logic.test.mjs.
import { STATUS_LABELS, canCreate } from './profiles-logic.js';

const KIND_TITLES = { artista: 'Artista', foro: 'Foro' };
const STATUS_TONES = { draft: 'draft', pending: 'pending', published: 'published', rejected: 'rejected' };

export const kindTitle = (kind) => KIND_TITLES[kind] || 'Perfil';

// Insignia: texto y tono (clase CSS) según el estado del perfil. Estado desconocido = borrador.
export function statusBadge(status) {
  return { label: STATUS_LABELS[status] || STATUS_LABELS.draft, tone: STATUS_TONES[status] || 'draft' };
}

// Query de /perfil/: sin id abre el formulario de creación; con id abre el editor de ese perfil.
export function profileQuery(kind, id) {
  return id ? `?tipo=${kind}&id=${encodeURIComponent(id)}` : `?tipo=${kind}`;
}

// Estado del botón «Crear perfil» según cuántos perfiles de ese tipo hay (límite de 3).
export function createState(count) {
  const full = !canCreate(count);
  return { full, notice: full ? 'Ya tienes 3 perfiles de este tipo, que es el máximo.' : '' };
}

// Título legible de un favorito. `found` es el contenido resuelto (evento: title; artista/foro: name) o null.
export function favoriteTitle(found, fallbackId) {
  const title = found?.title || found?.name;
  return typeof title === 'string' && title.trim() ? title.trim() : String(fallbackId ?? '');
}

// Aviso bajo «Mis favoritos»: solo si hay favoritos locales, login disponible y sin sesión.
export function favoritesNotice({ configured, signedIn, count }) {
  return configured && !signedIn && count > 0 ? 'Se guardarán en tu cuenta cuando inicies sesión.' : '';
}
