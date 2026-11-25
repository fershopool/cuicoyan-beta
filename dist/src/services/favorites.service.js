import { toRemoteFavorite, fromRemoteRows, mergeFavorites } from './supabase-logic.js';
import { isConfigured, fetchFavorites, upsertFavorite, deleteFavorite } from './supabase.service.js';

// Sin sesión: favoritos en localStorage, como antes. Con sesión: además se espejan en public.favorites.
const KEY = 'cuicoyan:v1:favorites';
const REMOVED = 'cuicoyan:v1:favorites-removed'; // borrados que no llegaron al servidor
const idOf = (item) => `${item.type}:${item.id}`;
function removed() { try { const value = JSON.parse(localStorage.getItem(REMOVED) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function setRemoved(value) { try { localStorage.setItem(REMOVED, JSON.stringify(value.slice(-500))); } catch { /* sin almacenamiento */ } }
let memory = [];
let remoteUserId = null; // solo en memoria

function read() { try { const value = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return memory; } }
function write(value) { memory = value; try { localStorage.setItem(KEY, JSON.stringify(value.slice(0, 500))); } catch { /* memoria temporal */ } }
export const getFavorites = () => read();
export const isFavorite = (type, id) => read().some((item) => item.type === type && item.id === id);

export function toggleFavorite(type, id) {
  const current = read();
  const exists = current.some((item) => item.type === type && item.id === id);
  const next = exists ? current.filter((item) => !(item.type === type && item.id === id)) : [...current, { type, id }];
  write(next);
  const row = remoteUserId ? toRemoteFavorite(remoteUserId, { type, id }) : null;
  setRemoved(removed().filter((key) => key !== idOf({ type, id })));
  // Sin red: el alta se sube en la siguiente sincronización; la baja se anota para repetirla.
  if (row) (exists ? deleteFavorite(row) : upsertFavorite(row)).catch(() => { if (exists) setRemoved([...removed(), idOf({ type, id })]); });
  return !exists;
}

export const clearFavorites = () => { write([]); setRemoved([]); };

// Con sesión: une lo local con lo remoto y sube lo que falte. Devuelve true si cambió la lista local.
export async function syncFavorites(userId) {
  if (!userId || !isConfigured()) return false;
  const all = fromRemoteRows(await fetchFavorites(userId));
  const gone = new Set(removed());
  const remote = all.filter((item) => !gone.has(idOf(item)));
  await Promise.all(all.filter((item) => gone.has(idOf(item))).map((item) => deleteFavorite(toRemoteFavorite(userId, item)).then(() => setRemoved(removed().filter((key) => key !== idOf(item)))).catch(() => {})));
  remoteUserId = userId;
  const before = JSON.stringify(read());
  const { merged, toUpload } = mergeFavorites(read(), remote);
  await Promise.all(toUpload.map((item) => upsertFavorite(toRemoteFavorite(userId, item)).catch(() => {})));
  write(merged);
  return JSON.stringify(merged) !== before;
}

export function endFavoritesSession() { remoteUserId = null; }
