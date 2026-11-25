// Lógica pura (sin red ni DOM) para convertir filas publicadas de Supabase al formato de item de las páginas.
// Todo texto y URL viene de usuarios: se recorta, se limpia de controles y de < >, y solo se aceptan http/https.
// Probada en tests/published-logic.test.mjs.
import categories from '../data/categories.json' with { type: 'json' };
import { defaultDraft, COVER_TONES } from './profile-draft.service.js';

const CONTROL_CHARS = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g;
const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;
const ID = /^[A-Za-z0-9-]{1,64}$/;
const MEDIA_PATH = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,254}$/;
const SOCIAL_KEYS = ['instagram', 'facebook', 'tiktok', 'youtube'];
const CDMX_LIKE = { lat: [-90, 90], lng: [-180, 180] };

export function cleanText(value, max = 300) {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL_CHARS, ' ').replace(/[<>]/g, '').replace(/[ \t]+/g, ' ').trim().slice(0, max);
}

export function safeHttpUrl(value) {
  const raw = cleanText(value, 500);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

function cleanList(value, max = 20, itemMax = 60) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, itemMax)).filter(Boolean).slice(0, max);
}

function cleanSocial(value) {
  const social = asObject(value);
  return Object.fromEntries(SOCIAL_KEYS.map((key) => [key, cleanText(social[key], 200)]).filter(([, text]) => text));
}

const labelOf = (slug) => categories.find((item) => item.slug === slug)?.label || slug;

// Ruta relativa del bucket público 'profile-media'. Sin '..', sin barra inicial.
export function safeMediaPath(value) {
  return typeof value === 'string' && MEDIA_PATH.test(value) && !value.includes('..') ? value : '';
}

function mediaUrlFrom(path, mediaUrl) {
  const safe = safeMediaPath(path);
  if (!safe || typeof mediaUrl !== 'function') return '';
  return safeHttpUrl(mediaUrl(safe));
}

function validRow(row) {
  return row && typeof row === 'object' && row.status === 'published' && typeof row.id === 'string' && ID.test(row.id)
    && typeof row.slug === 'string' && SLUG.test(row.slug) && cleanText(row.name, 120) !== '';
}

const HEX = /^#[0-9a-f]{6}$/i;
// Copia de `raw` solo lo que tenga el mismo tipo que el valor por defecto (el jsonb lo escribe el usuario).
function sameShape(base, raw) {
  if (Array.isArray(base)) return Array.isArray(raw) ? raw.filter((v) => typeof v === 'string') : base;
  if (base && typeof base === 'object') return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, sameShape(v, asObject(raw)[k])]));
  if (typeof base === 'string' && HEX.test(base)) return HEX.test(raw) ? raw : base; // colores: acaban en CSS
  if (base === '' && typeof raw === 'number') return raw; // lat/lng
  return typeof raw === typeof base ? raw : base;
}

// Diseño y datos que eligió la persona, para pintar su ficha pública. Las imágenes solo salen del bucket.
function publicDraft(kind, row, mediaUrl) {
  const draft = sameShape(defaultDraft(kind, { name: cleanText(row.name, 120) }), row.data);
  if (!Object.hasOwn(COVER_TONES, draft.cover.tone)) draft.cover.tone = 'aurora';
  draft.cover.image = mediaUrlFrom(row.cover_path, mediaUrl);
  draft.avatar.image = mediaUrlFrom(row.avatar_path, mediaUrl);
  if (draft.gallery) {
    const bucket = typeof mediaUrl === 'function' ? mediaUrl('x').slice(0, -1) : '';
    draft.gallery = draft.gallery.filter((url) => bucket.startsWith('https://') && url.startsWith(bucket));
  }
  return draft;
}

// Fila de public.artist_profiles -> item de artista. Devuelve null si la fila no es válida.
export function artistFromRow(row, mediaUrl) {
  if (!validRow(row)) return null;
  const data = asObject(row.data);
  return {
    id: `sb-${row.id}`,
    slug: row.slug,
    name: cleanText(row.name, 120),
    discipline: cleanText(data.discipline, 80),
    tagline: cleanText(data.tagline, 160),
    bio: cleanText(data.bio, 600),
    longBio: cleanText(data.longBio, 4000),
    nextEventId: '',
    categorySlugs: cleanList(data.categories, 20, 40),
    website: safeHttpUrl(data.website),
    social: cleanSocial(data.social),
    tone: 'pink',
    contentStatus: 'published',
    isDemo: false,
    source: 'comunidad',
    draft: publicDraft('artista', row, mediaUrl),
    avatarUrl: mediaUrlFrom(row.avatar_path, mediaUrl),
    coverUrl: mediaUrlFrom(row.cover_path, mediaUrl),
    photo: mediaUrlFrom(row.avatar_path, mediaUrl) || undefined, // lo lee cards.js avatar()
  };
}

// Coordenadas válidas (lat/lng) o null. Se guardan como [lng, lat], igual que el resto del mapa.
export function coordinatesFromMap(map) {
  const data = asObject(map);
  const lat = Number(data.lat);
  const lng = Number(data.lng);
  if (data.lat === '' || data.lng === '' || data.lat == null || data.lng == null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > CDMX_LIKE.lat[1] || Math.abs(lng) > CDMX_LIKE.lng[1]) return null;
  return [lng, lat];
}

// Fila de public.venue_profiles -> item de foro. Devuelve null si la fila no es válida.
export function venueFromRow(row, mediaUrl) {
  if (!validRow(row)) return null;
  const data = asObject(row.data);
  const map = asObject(data.map);
  const slugs = cleanList([map.category, ...(Array.isArray(map.extra) ? map.extra : [])], 10, 40);
  const coordinates = coordinatesFromMap(map);
  return {
    id: `sb-${row.id}`,
    slug: row.slug,
    name: cleanText(row.name, 120),
    zone: cleanText(data.zone, 80) || 'CDMX',
    description: cleanText(data.bio, 600) || 'Espacio publicado en Cuicoyan.',
    longBio: cleanText(data.longBio, 4000),
    address: cleanText(data.address, 200),
    categories: slugs.map(labelOf),
    categorySlugs: slugs,
    coordinates,
    mapVisible: map.visible !== false,
    mapIcon: cleanText(map.icon, 40) || 'flower',
    mapColor: /^#[0-9a-f]{6}$/i.test(map.color) ? map.color : undefined,
    // Sin coordenadas el punto es conceptual (centro del mapa) hasta verificar la ubicación.
    mapPoint: { x: 50, y: 50, isConceptual: !coordinates },
    website: safeHttpUrl(data.website),
    social: cleanSocial(data.social),
    contentStatus: 'published',
    isDemo: false,
    source: 'comunidad',
    draft: publicDraft('foro', row, mediaUrl),
    avatarUrl: mediaUrlFrom(row.avatar_path, mediaUrl),
    coverUrl: mediaUrlFrom(row.cover_path, mediaUrl),
    photo: mediaUrlFrom(row.cover_path, mediaUrl) || mediaUrlFrom(row.avatar_path, mediaUrl) || undefined, // lo lee venueImageUrl()
  };
}
