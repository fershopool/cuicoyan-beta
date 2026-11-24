// Lógica pura (sin DOM ni red) de la sesión y de los favoritos. Probada en tests/supabase-logic.test.mjs.

// Tipos locales (app) → valores de public.favorites.item_type.
export const REMOTE_TYPES = { event: 'evento', artist: 'artista', venue: 'foro' };
const LOCAL_TYPES = Object.fromEntries(Object.entries(REMOTE_TYPES).map(([local, remote]) => [remote, local]));

const isLocalHost = (hostname) => ['localhost', '127.0.0.1', '[::1]'].includes(hostname);

// 'sin-configurar' si falta la URL o la clave anónima, o la URL no es https (o localhost). Nunca lanza.
export function configStatus({ supabaseUrl = '', supabaseAnonKey = '' } = {}) {
  if (!supabaseUrl || !supabaseAnonKey) return 'sin-configurar';
  try {
    const url = new URL(supabaseUrl);
    return url.protocol === 'https:' || (url.protocol === 'http:' && isLocalHost(url.hostname)) ? 'lista' : 'sin-configurar';
  } catch {
    return 'sin-configurar';
  }
}

const keyOf = ({ type, id }) => `${type}:${id}`;

function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Fila de public.favorites para un favorito local; null si el tipo no se sincroniza.
export function toRemoteFavorite(userId, { type, id } = {}) {
  const itemType = REMOTE_TYPES[type];
  if (!userId || !itemType || typeof id !== 'string' || !id) return null;
  return { user_id: userId, item_type: itemType, item_slug: id };
}

// Filas de public.favorites → favoritos locales { type, id }. Descarta filas con tipo desconocido.
export function fromRemoteRows(rows = []) {
  const items = rows
    .map((row) => ({ type: LOCAL_TYPES[row?.item_type], id: row?.item_slug }))
    .filter((item) => item.type && typeof item.id === 'string' && item.id);
  return unique(items);
}

// Une favoritos locales y remotos. `toUpload` son los locales que aún no están en el servidor.
export function mergeFavorites(local = [], remote = []) {
  const localItems = unique(local);
  const remoteKeys = new Set(unique(remote).map(keyOf));
  return {
    merged: unique([...localItems, ...remote]),
    toUpload: localItems.filter((item) => !remoteKeys.has(keyOf(item))),
  };
}

// Nombre visible inicial: nombre de la cuenta de Google, o correo, o un texto neutro.
export function displayNameFrom(session) {
  const meta = session?.user?.user_metadata || {};
  return String(meta.full_name || meta.name || session?.user?.email || 'Mi cuenta').trim();
}

export function avatarFrom(session) {
  const meta = session?.user?.user_metadata || {};
  const url = String(meta.avatar_url || meta.picture || '');
  return /^https:\/\//.test(url) ? url : '';
}
