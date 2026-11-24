// Página /cuenta/: nombre visible (public.profiles) y favoritos. Sin configuración muestra solo lo local.
import { el, announce } from '../utils/dom.js';
import { routes } from '../config/routes.js';
import { getFavorites } from '../services/favorites.service.js';
import { isConfigured, getSession, signInWithGoogle, fetchProfile, saveProfile } from '../services/supabase.service.js';
import { displayNameFrom, avatarFrom } from '../services/supabase-logic.js';
import { isAdmin, listPending, decide } from '../services/profiles-admin.service.js';
import { NOTE_MAX, validateDecision, summaryFields, canPreview, formatDate } from '../services/profiles-admin-logic.js';

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
  const admin = await isAdmin(); // sin admin no existe la sección y no se consulta la lista
  body.replaceChildren(page([profileForm(session, profile), ...(admin ? [reviewSection()] : []), favoritesSection()]));
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
  const avatar = avatarFrom(session);
  const card = el('div', { className: 'account-card' }, [
    avatar ? el('img', { className: 'account-card-avatar', src: avatar, alt: '', attrs: { referrerpolicy: 'no-referrer' } }) : null,
    el('div', { className: 'account-card-text' }, [
      el('strong', { text: profile?.display_name || displayNameFrom(session) }),
      session.user?.email ? el('small', { className: 'muted', text: session.user.email }) : null,
    ]),
  ]);
  return el('section', { className: 'section-block' }, [el('h2', { text: 'Perfil' }), card, form]);
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

// Solo para administradoras: perfiles pendientes con aprobar o rechazar.
function reviewSection() {
  const list = el('div', { className: 'admin-review-list' });
  const load = async () => {
    list.replaceChildren(el('p', { className: 'muted', text: 'Cargando perfiles pendientes…' }));
    try {
      const rows = await listPending();
      list.replaceChildren(...(rows.length
        ? rows.map((row) => reviewCard(row, load))
        : [el('p', { className: 'muted', text: 'No hay perfiles pendientes de revisión.' })]));
    } catch {
      list.replaceChildren(el('p', { className: 'notice', text: 'No pudimos cargar los perfiles pendientes.', attrs: { role: 'alert' } }));
    }
  };
  load();
  return el('section', { className: 'section-block admin-review', attrs: { 'aria-labelledby': 'admin-review-title' } }, [
    el('h2', { id: 'admin-review-title', text: 'Revisión de perfiles' }),
    el('p', { className: 'muted', text: 'Solo visible para administradoras. Aprueba o rechaza los perfiles enviados.' }),
    list,
  ]);
}

let reviewSeq = 0;

function reviewCard(row, reload) {
  const id = ++reviewSeq;
  const summary = summaryFields(row);
  const name = row.name || 'Sin nombre';
  const message = el('p', { className: 'muted admin-review-message', attrs: { role: 'status' } });
  const noteInput = el('textarea', { id: `review-note-${id}`, maxLength: NOTE_MAX, rows: 2 });
  const buttons = [
    el('button', { className: 'button', type: 'button', text: 'Aprobar', onclick: () => act('published') }),
    el('button', { className: 'button secondary', type: 'button', text: 'Rechazar', onclick: () => act('rejected') }),
  ];

  async function act(decision) {
    const check = validateDecision(row.kind, decision, noteInput.value);
    if (!check.ok) { message.textContent = check.error; return; }
    const question = decision === 'published' ? `¿Publicar «${name}»?` : `¿Rechazar «${name}»?`;
    if (!window.confirm(question)) return;
    buttons.forEach((button) => { button.disabled = true; });
    message.textContent = 'Guardando…';
    try {
      await decide(row.kind, row.id, decision, noteInput.value);
      announce(decision === 'published' ? `Perfil «${name}» publicado` : `Perfil «${name}» rechazado`);
      await reload();
    } catch {
      message.textContent = 'No pudimos guardar la decisión. Inténtalo de nuevo.';
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  const details = [];
  if (summary.bio) details.push(reviewRow('Presentación', summary.bio));
  if (summary.place) details.push(reviewRow('Disciplina y zona', summary.place));
  if (summary.social.length) details.push(reviewRow('Redes', summary.social.join(' · ')));
  if (summary.website) {
    details.push(reviewRow('Web', el('a', { href: summary.website, text: summary.website, attrs: { target: '_blank', rel: 'noopener noreferrer' } })));
  }

  const previewHref = canPreview(row) ? (row.kind === 'artista' ? routes.artista(row.slug) : routes.foro(row.slug)) : null;

  return el('article', { className: 'admin-review-card' }, [
    el('div', { className: 'admin-review-head' }, [
      el('h3', { text: name }),
      el('small', { className: 'muted', text: `${row.kindLabel} · enviado ${formatDate(row.submitted_at) || 'sin fecha'}` }),
    ]),
    details.length ? el('dl', { className: 'admin-review-data' }, details) : null,
    previewHref ? el('a', { className: 'button secondary', href: previewHref, text: 'Ver vista previa', attrs: { rel: 'noopener noreferrer' } }) : null,
    el('div', { className: 'admin-review-form' }, [
      el('label', { htmlFor: `review-note-${id}`, text: 'Nota para la persona (obligatoria para rechazar, mínimo 10 caracteres)' }),
      noteInput,
      el('div', { className: 'admin-review-actions' }, buttons),
      message,
    ]),
  ]);
}

function reviewRow(label, value) {
  return el('div', { className: 'admin-review-row' }, [
    el('dt', { text: label }),
    el('dd', {}, [value]),
  ]);
}
