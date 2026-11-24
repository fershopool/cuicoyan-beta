// Lee public/config.js (window.CUICOYAN_CONFIG, cargado con <script> antes que los módulos).
const raw = (typeof window !== 'undefined' && window.CUICOYAN_CONFIG) || {};

export const supabaseConfig = Object.freeze({
  supabaseUrl: String(raw.supabaseUrl || '').trim(),
  supabaseAnonKey: String(raw.supabaseAnonKey || '').trim(),
});
