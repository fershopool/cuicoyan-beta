import { toRemoteFavorite, fromRemoteRows, mergeFavorites } from './supabase-logic.js';
import { isConfigured, fetchFavorites, upsertFavorite, deleteFavorite } from './supabase.service.js';

// Sin sesión: favoritos en localStorage, como antes. Con sesión: además se espejan en public.favorites.
const KEY = 'cuicoyan:v1:favorites';
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
  if (row) (exists ? deleteFavorite(row) : upsertFavorite(row)).catch(() => { /* sin red: queda en local hasta la siguiente sincronización */ });
  return !exists;
}

export const clearFavorites = () => write([]);

// Con sesión: une lo local con lo remoto y sube lo que falte. Devuelve true si cambió la lista local.
export async function syncFavorites(userId) {
  if (!userId || !isConfigured()) return false;
  const remote = fromRemoteRows(await fetchFavorites(userId));
  remoteUserId = userId;
  const before = JSON.stringify(read());
  const { merged, toUpload } = mergeFavorites(read(), remote);
  await Promise.all(toUpload.map((item) => upsertFavorite(toRemoteFavorite(userId, item)).catch(() => {})));
  write(merged);
  return JSON.stringify(merged) !== before;
}

export function endFavoritesSession() { remoteUserId = null; }
