// Perfiles de artista y foro en Supabase (public.artist_profiles / public.venue_profiles y bucket profile-media).
// RLS limita todo al dueño; el servicio solo arma las consultas. Lógica pura en profiles-logic.js.
import { getClient, getSession, onAuthChange } from './supabase.service.js';
import { kindConfig, makeSlug, fromRow, toRowFields, validateImage, storagePath, canCreate, BUCKET } from './profiles-logic.js';

async function client() {
  const sb = await getClient();
  if (!sb) throw new Error('sin-configurar');
  return sb;
}

async function ownerId(sb) {
  const { data } = await sb.auth.getSession();
  const uid = data?.session?.user?.id;
  if (!uid) throw new Error('sin-sesion');
  return uid;
}

export async function listMine(kind) {
  const { table } = kindConfig(kind);
  const sb = await client();
  const { data, error } = await sb.from(table).select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function getMine(kind, id) {
  const { table } = kindConfig(kind);
  const sb = await client();
  const { data, error } = await sb.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return fromRow(data);
}

// Crea un borrador. El límite de 3 por tipo también lo aplica la base; aquí se evita el viaje inútil.
export async function createProfile(kind, { name, data }) {
  const { table } = kindConfig(kind);
  const current = await listMine(kind);
  if (!canCreate(current.length)) throw new Error('limite-alcanzado');
  const sb = await client();
  const uid = await ownerId(sb);
  const row = { owner_id: uid, slug: makeSlug(name), status: 'draft', ...toRowFields({ name, data }) };
  const { data: created, error } = await sb.from(table).insert(row).select('*').single();
  if (error) throw error;
  return fromRow(created);
}

export async function saveProfile(kind, id, { name, data, avatar_path, cover_path }) {
  const { table } = kindConfig(kind);
  const sb = await client();
  const fields = toRowFields({ name, data, avatarPath: avatar_path, coverPath: cover_path });
  const { data: updated, error } = await sb.from(table).update(fields).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  if (!updated) throw new Error('perfil-no-encontrado');
  return fromRow(updated);
}

// Pasa a revisión. Editar un perfil publicado lo regresa a 'pending' en la base (trigger/RLS).
export async function submitForReview(kind, id) {
  const { table } = kindConfig(kind);
  const sb = await client();
  const { data, error } = await sb.from(table).update({ status: 'pending', submitted_at: new Date().toISOString() }).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('perfil-no-encontrado');
}

// Sube un Blob al bucket y devuelve su ruta (la que se guarda en avatar_path / cover_path).
export async function uploadImage(kind, profileId, blob, filename) {
  const problem = validateImage({ type: blob?.type, size: blob?.size });
  if (problem) throw new Error(problem);
  const sb = await client();
  const uid = await ownerId(sb);
  const path = storagePath(uid, kind, profileId, filename);
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, upsert: true, cacheControl: '3600' });
  if (error) throw error;
  return path;
}

export async function publicUrl(path) {
  if (!path) return '';
  const sb = await client();
  return sb.storage.from(BUCKET).getPublicUrl(path).data?.publicUrl || '';
}

// Marca <html data-session="si|no"> para mostrar u ocultar los enlaces que requieren sesión (CSS).
const markSession = (session) => {
  if (typeof document !== 'undefined') document.documentElement.dataset.session = session ? 'si' : 'no';
};
export function watchSessionFlag() {
  getSession().then(markSession).catch(() => markSession(null));
  onAuthChange(markSession);
}
