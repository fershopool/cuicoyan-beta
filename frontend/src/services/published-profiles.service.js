// Perfiles públicos aprobados (status='published') desde Supabase. Sin sesión: lo permite la política RLS de anon.
// Sin configuración o ante cualquier error devuelve [] y no rompe la página.
import { getClient } from './supabase.service.js';
import { artistFromRow, venueFromRow } from './published-logic.js';

const COLUMNS = 'id,slug,name,status,data,avatar_path,cover_path,published_at';
const LIMIT = 200;
const BUCKET = 'profile-media';

async function fetchPublished(table, toItem) {
  try {
    const sb = await getClient();
    if (!sb) return [];
    const { data, error } = await sb.from(table).select(COLUMNS).eq('status', 'published').order('published_at', { ascending: false }).limit(LIMIT);
    if (error || !Array.isArray(data)) return [];
    const mediaUrl = (path) => sb.storage.from(BUCKET).getPublicUrl(path)?.data?.publicUrl || '';
    return data.map((row) => toItem(row, mediaUrl)).filter(Boolean);
  } catch {
    return [];
  }
}

export const fetchPublishedArtists = () => fetchPublished('artist_profiles', artistFromRow);
export const fetchPublishedVenues = () => fetchPublished('venue_profiles', venueFromRow);
