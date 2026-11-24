// Revisión de perfiles para administradoras. Las tablas no tienen acceso directo para admin: RLS decide. Sin configuración devuelve valores vacíos.
import { getClient } from './supabase.service.js';
import { tableFor, buildPendingList, validateDecision, LIST_LIMIT } from './profiles-admin-logic.js';

const COLUMNS = 'id, owner_id, slug, name, status, data, review_note, submitted_at, published_at';

// rpc public.is_admin(). Cualquier error o falta de configuración cuenta como no admin.
export async function isAdmin() {
  try {
    const sb = await getClient();
    if (!sb) return false;
    const { data, error } = await sb.rpc('is_admin');
    return !error && data === true;
  } catch {
    return false;
  }
}

// Perfiles en espera de revisión de ambas tablas, más antiguos primero. Lanza si Supabase falla.
export async function listPending() {
  const sb = await getClient();
  if (!sb) return [];
  const pendingOf = (table) => sb.from(table).select(COLUMNS).eq('status', 'pending')
    .order('submitted_at', { ascending: true, nullsFirst: false }).limit(LIST_LIMIT);
  const [artists, venues] = await Promise.all([pendingOf('artist_profiles'), pendingOf('venue_profiles')]);
  if (artists.error) throw artists.error;
  if (venues.error) throw venues.error;
  return buildPendingList(artists.data || [], venues.data || []);
}

// Aprueba (published) o rechaza (rejected) un perfil pendiente. Solo cambia status y review_note.
export async function decide(kind, id, decision, note) {
  const check = validateDecision(kind, decision, note);
  if (!check.ok) throw new Error(check.error);
  const sb = await getClient();
  if (!sb) throw new Error('sin-configurar');
  const { data, error } = await sb.from(tableFor(kind))
    .update({ status: decision, review_note: check.note })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('perfil-no-encontrado');
  return true;
}
