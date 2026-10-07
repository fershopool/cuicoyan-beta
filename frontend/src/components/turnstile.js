import { el } from '../utils/dom.js';
import { environment } from '../config/environment.js';

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading;
function load() {
  loading ||= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement('script');
    s.src = SRC; s.async = true; s.onload = () => resolve(window.turnstile); s.onerror = reject;
    document.head.append(s);
  });
  return loading;
}

// Widget accesible de Turnstile. Sin site key configurada no se muestra (el servidor rechaza sin token).
// Devuelve { node, token(), reset() }; los errores se muestran con un texto fijo.
export function turnstileWidget() {
  const note = el('p', { className: 'form-status muted', attrs: { role: 'status', 'aria-live': 'polite' } });
  const box = el('div', { className: 'turnstile-box', attrs: { 'aria-label': 'Verificación de seguridad' } });
  const node = el('div', { className: 'field wide' }, [box, note]);
  let value = ''; let id;
  const siteKey = environment.turnstileSiteKey;
  if (siteKey) load().then((t) => {
    id = t.render(box, {
      sitekey: siteKey, language: 'es', theme: 'auto',
      callback: (tok) => { value = tok; note.textContent = ''; },
      'expired-callback': () => { value = ''; },
      'error-callback': () => { value = ''; note.textContent = 'No pudimos cargar la verificación. Inténtalo de nuevo.'; },
    });
  }).catch(() => { note.textContent = 'No pudimos cargar la verificación. Inténtalo de nuevo.'; });
  return { node, token: () => value, reset: () => { value = ''; if (id !== undefined) window.turnstile?.reset(id); } };
}
