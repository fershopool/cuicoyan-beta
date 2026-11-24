// Lógica pura de los perfiles de artista y foro (slugs, filas, imágenes). Sin DOM ni red. Probada en tests/profiles-logic.test.mjs.

// Tipo de perfil de la app → tabla de Supabase y segmento de la ruta en el bucket.
export const PROFILE_KINDS = { artista: { table: 'artist_profiles', segment: 'artist' }, foro: { table: 'venue_profiles', segment: 'venue' } };
export const MAX_PER_KIND = 3;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const BUCKET = 'profile-media';
export const STATUS_LABELS = { draft: 'Borrador', pending: 'En revisión', published: 'Publicado', rejected: 'Rechazado' };

export function kindConfig(kind) {
  const config = PROFILE_KINDS[kind];
  if (!config) throw new Error('tipo-desconocido');
  return config;
}

// Nombre → parte legible del slug: sin acentos, minúsculas, guiones. Nunca vacío.
export function slugify(text) {
  const slug = String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '');
  return slug || 'perfil';
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
export function randomSuffix(random = Math.random, length = 4) {
  let out = '';
  for (let i = 0; i < length; i += 1) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return out;
}

// Slug único por construcción: nombre + 4 caracteres aleatorios.
export function makeSlug(name, random = Math.random) {
  return `${slugify(name)}-${randomSuffix(random)}`;
}

// Fila de Supabase → objeto de la app.
export function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name || '',
    status: row.status,
    reviewNote: row.review_note || '',
    data: row.data && typeof row.data === 'object' ? row.data : {},
    avatarPath: row.avatar_path || null,
    coverPath: row.cover_path || null,
    submittedAt: row.submitted_at || null,
    publishedAt: row.published_at || null,
  };
}

// Campos de la app → columnas. Las rutas de imagen solo se envían si se pasan (undefined = no tocar).
export function toRowFields({ name, data, avatarPath, coverPath }) {
  const fields = { name: String(name || '').trim(), data: data && typeof data === 'object' ? data : {} };
  if (avatarPath !== undefined) fields.avatar_path = avatarPath || null;
  if (coverPath !== undefined) fields.cover_path = coverPath || null;
  return fields;
}

// '' si la imagen sirve; si no, el mensaje para la persona.
export function validateImage({ type, size } = {}) {
  if (!IMAGE_TYPES[type]) return 'Usa una imagen JPG, PNG o WebP.';
  if (!(size > 0)) return 'La imagen está vacía.';
  if (size > MAX_IMAGE_BYTES) return 'La imagen pesa más de 2 MB. Reduce su tamaño e inténtalo de nuevo.';
  return '';
}

// Nombre de archivo único (cambia en cada subida, así no se sirve una imagen vieja desde caché).
export function imageFileName(label, type, now = Date.now()) {
  return `${label}-${now}.${IMAGE_TYPES[type] || 'bin'}`;
}

// Ruta en el bucket: <uid>/<artist|venue>/<profile_id>/<archivo>. La primera carpeta es la del dueño (exigida por RLS).
export function storagePath(uid, kind, profileId, filename) {
  const { segment } = kindConfig(kind);
  const safeName = String(filename || '').replace(/[^A-Za-z0-9._-]/g, '-');
  if (!uid || !profileId || !safeName) throw new Error('ruta-invalida');
  return `${uid}/${segment}/${profileId}/${safeName}`;
}

// Solo se puede enviar a revisión un borrador o un perfil rechazado.
export const canSubmit = (status) => status === 'draft' || status === 'rejected';
export const canCreate = (count) => count < MAX_PER_KIND;
