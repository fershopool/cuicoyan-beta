// Diseño y datos editables del perfil de artista. Se guardan en este navegador (localStorage);
// ponytail: sin backend para portada/estilos. Al existir, enviar `draft` completo en el PATCH y quitar localStorage.
const key = (id) => `cuicoyan:profile-draft:${id}`;

export const COVER_TONES = {
  aurora: ['Aurora', 'var(--profile-hero)'],
  fiesta: ['Fiesta', 'linear-gradient(115deg,#FF9D2E,#F21F6D)'],
  noche: ['Noche', 'linear-gradient(115deg,#12163F,#8A3FFC)'],
  selva: ['Selva', 'linear-gradient(115deg,#00C7D4,#0B7A55)'],
  maiz: ['Cempasúchil', 'linear-gradient(115deg,#FFD66B,#E96F00)'],
  custom: ['Propio', ''],
};
export const FONTS = { moderna: ['Moderna', 'var(--font-app)'], editorial: ['Editorial', 'Georgia, "Times New Roman", serif'], redondeada: ['Redondeada', '"Trebuchet MS", ui-rounded, system-ui, sans-serif'] };
export const SOCIALS = [['instagram', 'Instagram', '@usuario'], ['facebook', 'Facebook', 'facebook.com/…'], ['tiktok', 'TikTok', '@usuario'], ['youtube', 'YouTube', 'youtube.com/@…']];

export function defaultDraft(artist = {}) {
  return {
    name: artist.name || '', discipline: artist.discipline || '', tagline: artist.tagline || '', bio: artist.bio || '', longBio: artist.longBio || artist.bio || '',
    website: artist.website || '', email: artist.email || '', social: { instagram: '', facebook: '', tiktok: '', youtube: '' }, categories: artist.categorySlugs || [],
    cover: { tone: 'aurora', c1: '#00C7D4', c2: '#F21F6D', angle: 115, image: '', pattern: true, height: 260 },
    avatar: { image: '', size: 168, shape: 'circle', ring: true },
    accent: '#E91662', font: 'moderna', sections: { bio: true, dates: true, posts: true },
  };
}

const merge = (base, extra) => Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? merge(v, extra?.[k]) : (extra?.[k] ?? v)]));

export function getProfileDraft(id, artist) {
  try { const raw = localStorage.getItem(key(id)); return raw ? merge(defaultDraft(artist), JSON.parse(raw)) : null; } catch { return null; }
}

export function saveProfileDraft(id, draft) {
  try { localStorage.setItem(key(id), JSON.stringify(draft)); return true; } catch { return false; }
}
