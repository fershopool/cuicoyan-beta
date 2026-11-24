import { supabaseConfig } from '../config/supabase-config.js';
import { configStatus } from './supabase-logic.js';

// supabase-js v2 fijado a una versión exacta; se carga solo si hay configuración.
export const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

let clientPromise = null;

export const status = () => configStatus(supabaseConfig);
export const isConfigured = () => status() === 'lista';

// Cliente perezoso. Sin configuración devuelve null y no toca la red.
function client() {
  if (!isConfigured()) return null;
  clientPromise ??= import(/* @vite-ignore */ SUPABASE_CDN)
    .then(({ createClient }) => createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseAnonKey, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }))
    .catch((error) => { clientPromise = null; throw error; });
  return clientPromise;
}

// Cliente de supabase-js (o null sin configuración). Lo usan los servicios de perfiles.
export const getClient = async () => client();

// Redirige a Google. `redirectTo` debe estar en la lista de URL permitidas del proyecto de Supabase.
export async function signInWithGoogle(redirectTo) {
  const sb = await client();
  if (!sb) return { status: 'sin-configurar' };
  const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  if (error) throw error;
  return { status: 'redirigiendo' };
}

export async function signOut() {
  const sb = await client();
  if (sb) await sb.auth.signOut();
}

// Sesión actual o null (también null sin configuración).
export async function getSession() {
  const sb = await client();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data?.session ?? null;
}

// Suscripción a cambios de sesión. Devuelve una función para cancelarla.
export function onAuthChange(callback) {
  let unsubscribe = () => {};
  client()?.then((sb) => {
    const { data } = sb.auth.onAuthStateChange((_event, session) => callback(session ?? null));
    unsubscribe = () => data.subscription.unsubscribe();
  }).catch(() => {});
  return () => unsubscribe();
}

// public.profiles (id, display_name, avatar_url). RLS: solo la propia fila.
export async function fetchProfile(userId) {
  const sb = await client();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').select('id, display_name, avatar_url').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveProfile(userId, { display_name, avatar_url = null }) {
  const sb = await client();
  if (!sb) throw new Error('sin-configurar');
  // update y no upsert: la fila la crea el trigger al registrarse y authenticated no tiene INSERT en profiles.
  const { data, error } = await sb.from('profiles').update({ display_name, avatar_url }).eq('id', userId).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('perfil-no-encontrado');
}

// public.favorites (user_id, item_type, item_slug). RLS: solo las propias filas.
export async function fetchFavorites(userId) {
  const sb = await client();
  if (!sb) return [];
  const { data, error } = await sb.from('favorites').select('item_type, item_slug').eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function upsertFavorite(row) {
  const sb = await client();
  if (!sb) return;
  const { error } = await sb.from('favorites').upsert(row, { onConflict: 'user_id,item_type,item_slug' });
  if (error) throw error;
}

export async function deleteFavorite(row) {
  const sb = await client();
  if (!sb) return;
  const { error } = await sb.from('favorites').delete().match({ user_id: row.user_id, item_type: row.item_type, item_slug: row.item_slug });
  if (error) throw error;
}
