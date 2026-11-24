// Página /cuenta/: nombre visible (public.profiles) y favoritos. Sin configuración muestra solo lo local.
import { el, announce } from '../utils/dom.js';
import { routes } from '../config/routes.js';
import { getFavorites } from '../services/favorites.service.js';
import { isConfigured, getSession, signInWithGoogle, fetchProfile, saveProfile } from '../services/supabase.service.js';
import { displayNameFrom, avatarFrom } from '../services/supabase-logic.js';

const TYPE_LABELS = { event: 'Evento', artist: 'Artista', venue: 'Foro' };
const TYPE_ROUTES = { event: routes.evento, artist: routes.artista, venue: routes.foro };

// `mount` reemplaza el contenido de la página (lo pasa main.js).
export function renderAccountPage(mount) {
  const body = el('div', { className: 'app-wrap' }, [el('p', { className: 'muted', text: 'Cargando tu cuenta…' })]);
  mount(el('main', { id: 'contenido', className: 'app-page' }, [body]));
  paint(body).catch(() => body.replaceChildren(page([el('p', { className: 'notice', text: 'No pudimos cargar tu cuenta. Inténtalo más tarde.', attrs: { role: 'alert' } })])));
}

async function paint(body) {
  if (!isConfigured()) {
    body.replaceChildren(page([el('p', { className: 'notice', text: 'El inicio de sesión no está disponible en esta versión. Tus favoritos se guardan en este navegador.' }), favoritesSection()]));
    return;
  }
  const session = await getSession().catch(() => null);
  if (!session) {
    body.replaceChildren(page([
      el('p', { className: 'muted', text: 'Inicia sesión con Google para guardar tu nombre y tus favoritos en tu cuenta.' }),
      el('button', { className: 'button', type: 'button', text: 'Iniciar sesión con Google', onclick: signIn }),
      favoritesSection(),
    ]));
    return;
  }
  const profile = await fetchProfile(session.user.id).catch(() => null);
  body.replaceChildren(page([profileForm(session, profile), favoritesSection()]));
}

function signIn() {
  signInWithGoogle(`${window.location.origin}${routes.cuenta}`).catch(() => announce('No pudimos iniciar tu sesión. Inténtalo de nuevo.'));
}

function page(children) {
  return el('div', {}, [el('header', { className: 'app-head' }, [el('div', {}, [el('span', { className: 'eyebrow', text: 'Cuenta' }), el('h1', { text: 'Mi cuenta' })])]), ...children]);
}

function profileForm(session, profile) {
  const input = el('input', { id: 'account-name', type: 'text', maxLength: 80, required: true, value: profile?.display_name || displayNameFrom(session), attrs: { autocomplete: 'nickname' } });
  const status = el('p', { className: 'muted', attrs: { role: 'status' } });
  const form = el('form', {
    className: 'account-form',
    onsubmit: async (event) => {
      event.preventDefault();
      const name = input.value.trim();
      if (!name) { status.textContent = 'Escribe un nombre visible.'; return; }
      try {
        await saveProfile(session.user.id, { display_name: name, avatar_url: avatarFrom(session) || null });
        status.textContent = 'Nombre guardado.';
        announce('Nombre guardado');
      } catch {
        status.textContent = 'No pudimos guardar tu nombre. Inténtalo de nuevo.';
      }
    },
  }, [
    el('label', { htmlFor: 'account-name', text: 'Nombre visible' }),
    input,
    el('button', { className: 'button', type: 'submit', text: 'Guardar nombre' }),
    status,
  ]);
  return el('section', { className: 'section-block' }, [el('h2', { text: 'Perfil' }), form]);
}

function favoritesSection() {
  const items = getFavorites();
  const list = items.length
    ? el('ul', { className: 'account-favorites' }, items.map(({ type, id }) => el('li', {}, [
      el('a', { href: TYPE_ROUTES[type]?.(id) || routes.favoritos, text: id }),
      el('small', { className: 'muted', text: ` · ${TYPE_LABELS[type] || 'Elemento'}` }),
    ])))
    : el('p', { className: 'muted', text: 'Aún no tienes favoritos. Explora eventos, artistas y foros.' });
  return el('section', { className: 'section-block' }, [el('h2', { text: 'Mis favoritos' }), list, el('a', { className: 'button secondary', href: routes.favoritos, text: 'Ver todos mis favoritos' })]);
}
