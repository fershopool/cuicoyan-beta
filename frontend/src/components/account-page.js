// Página /cuenta/: nombre visible (public.profiles) y favoritos. Sin configuración muestra solo lo local.
import { el, announce } from '../utils/dom.js';
import { routes, withBase } from '../config/routes.js';
import { icon } from './icons.js';
import { getFavorites } from '../services/favorites.service.js';
import { isConfigured, getSession, signInWithGoogle, fetchProfile, saveProfile } from '../services/supabase.service.js';
import { displayNameFrom, avatarFrom } from '../services/supabase-logic.js';
import { isAdmin, listPending, decide } from '../services/profiles-admin.service.js';
import { NOTE_MAX, validateDecision, summaryFields, canPreview, formatDate } from '../services/profiles-admin-logic.js';
import { listMine } from '../services/profiles-remote.service.js';
import { getEvent, getEvents, getArtist, getArtistById, getVenue, getVenueById } from '../services/content.service.js';
import { kindTitle, statusBadge, profileQuery, createState, favoriteTitle, favoritesNotice } from '../services/account-logic.js';

const TYPE_LABELS = { event: 'Evento', artist: 'Artista', venue: 'Foro' };
const TYPE_ROUTES = { event: routes.evento, artist: routes.artista, venue: routes.foro };
const BENEFITS = [
  ['heart', 'Guarda tus favoritos en todos tus dispositivos'],
  ['sparkles', 'Crea el perfil de tu proyecto artístico o de tu foro (se publica tras una revisión)'],
  ['user', 'Tu nombre y foto de Google, sin contraseñas nuevas'],
];

// `mount` reemplaza el contenido de la página (lo pasa main.js).
export function renderAccountPage(mount) {
  const body = el('div', { className: 'app-wrap' }, [el('p', { className: 'muted', text: 'Cargando tu cuenta…' })]);
  mount(el('main', { id: 'contenido', className: 'app-page' }, [body]));
  paint(body).catch(() => body.replaceChildren(page([el('p', { className: 'notice', text: 'No pudimos cargar tu cuenta. Inténtalo más tarde.', attrs: { role: 'alert' } })])));
}

async function paint(body) {
  if (!isConfigured()) {
    body.replaceChildren(page([el('p', { className: 'notice', text: 'El inicio de sesión no está disponible en esta versión. Tus favoritos se guardan en este navegador.' }), favoritesSection({ configured: false, signedIn: false })]));
    return;
  }
  const session = await getSession().catch(() => null);
  if (!session) {
    body.replaceChildren(page([welcomeCard(), favoritesSection({ configured: true, signedIn: false })]));
    return;
  }
  const profile = await fetchProfile(session.user.id).catch(() => null);
  const admin = await isAdmin(); // sin admin no existe la sección y no se consulta la lista
  body.replaceChildren(page([profileForm(session, profile), profilesSection(), ...(admin ? [reviewSection()] : []), favoritesSection({ configured: true, signedIn: true })]));
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

// Sin sesión: tarjeta de bienvenida con beneficios y botón de Google. Solo texto y SVG creados con DOM.
function welcomeCard() {
  return el('section', { className: 'account-welcome', attrs: { 'aria-labelledby': 'account-welcome-title' } }, [
    el('img', { className: 'account-welcome-logo', src: withBase('/public/cuicoyan-logo.png'), alt: '', width: 72, height: 72, decoding: 'async' }),
    el('h2', { id: 'account-welcome-title', text: 'Tu espacio en Cuicoyan' }),
    el('ul', { className: 'account-benefits' }, BENEFITS.map(([name, text]) => el('li', {}, [icon(name, { size: 22 }), el('span', { text })]))),
    el('button', { className: 'button account-google', type: 'button', onclick: signIn }, [googleMark(), el('span', { text: 'Continuar con Google' })]),
    el('p', { className: 'account-welcome-note muted' }, [
      'Solo usamos tu nombre, correo y foto de Google para tu cuenta. Lee la ',
      el('a', { href: routes.privacidad, text: 'privacidad' }),
      ' y los ',
      el('a', { href: routes.terminos, text: 'términos' }),
      '.',
    ]),
  ]);
}

// Logo «G» de Google en SVG inline, creado con createElementNS (sin innerHTML).
function googleMark() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'google-g');
  svg.setAttribute('viewBox', '0 0 48 48');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  [
    ['M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.4-.4-3.5z', '#FFC107'],
    ['M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z', '#FF3D00'],
    ['M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z', '#4CAF50'],
    ['M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z', '#1976D2'],
  ].forEach(([d, fill]) => {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', fill);
    svg.appendChild(path);
  });
  return svg;
}

// Con sesión: perfiles de artista y foro propios, con estado, nota de revisión y acceso a edición.
function profilesSection() {
  const list = el('div', { className: 'account-profiles-list', attrs: { 'aria-live': 'polite' } }, [el('p', { className: 'muted', text: 'Cargando tus perfiles…' })]);
  const createRow = el('div', { className: 'account-create-row' });
  const load = async () => {
    try {
      const [artists, venues] = await Promise.all([listMine('artista'), listMine('foro')]);
      const rows = [...artists.map((item) => ({ ...item, kind: 'artista' })), ...venues.map((item) => ({ ...item, kind: 'foro' }))];
      list.replaceChildren(...(rows.length
        ? rows.map(profileCard)
        : [el('div', { className: 'empty-state account-empty' }, [el('h3', { text: 'Aún no tienes perfiles' }), el('p', { className: 'muted', text: 'Crea el de tu proyecto artístico o el de tu foro. Se publican tras una revisión.' })])]));
      createRow.replaceChildren(...createButtons(artists.length, venues.length));
    } catch {
      list.replaceChildren(el('p', { className: 'notice', text: 'No pudimos cargar tus perfiles. Inténtalo más tarde.', attrs: { role: 'alert' } }));
      createRow.replaceChildren(...createButtons(0, 0));
    }
  };
  load();
  return el('section', { className: 'section-block account-profiles', attrs: { 'aria-labelledby': 'account-profiles-title' } }, [
    el('h2', { id: 'account-profiles-title', text: 'Mis perfiles' }),
    list,
    createRow,
  ]);
}

function profileCard(profile) {
  const badge = statusBadge(profile.status);
  return el('article', { className: 'account-profile-card' }, [
    el('div', { className: 'account-profile-head' }, [
      el('div', { className: 'account-profile-text' }, [
        el('strong', { text: profile.name || 'Sin nombre' }),
        el('small', { className: 'muted', text: kindTitle(profile.kind) }),
      ]),
      el('span', { className: 'account-badge', dataset: { tone: badge.tone }, text: badge.label }),
    ]),
    profile.reviewNote ? el('p', { className: 'account-profile-note', text: `Nota de revisión: ${profile.reviewNote}` }) : null,
    el('a', { className: 'button secondary account-profile-edit', href: `${routes.perfil}${profileQuery(profile.kind, profile.id)}`, text: 'Editar' }),
  ]);
}

// Dos botones grandes. Con 3 perfiles de un tipo, el botón se deshabilita y se explica por qué.
function createButtons(artistCount, venueCount) {
  return [['artista', artistCount], ['foro', venueCount]].map(([kind, count]) => {
    const state = createState(count);
    const label = kind === 'artista' ? 'Crear perfil de artista' : 'Crear perfil de foro';
    const button = state.full
      ? el('button', { className: 'button account-create', type: 'button', disabled: true, text: label })
      : el('a', { className: 'button account-create', href: `${routes.perfil}${profileQuery(kind)}`, text: label });
    return el('div', { className: 'account-create-item' }, [button, state.notice ? el('p', { className: 'muted account-create-notice', text: state.notice }) : null]);
  });
}

// Nombre legible de un favorito: busca el contenido por id o slug; si no existe, usa el id.
function favoriteLookup(type, id) {
  if (type === 'event') return getEvent(id) || getEvents().find((item) => item.id === id) || null;
  if (type === 'artist') return getArtistById(id) || getArtist(id) || null;
  if (type === 'venue') return getVenueById(id) || getVenue(id) || null;
  return null;
}

function favoritesSection({ configured, signedIn }) {
  const items = getFavorites();
  const list = items.length
    ? el('ul', { className: 'account-favorites' }, items.map(({ type, id }) => {
      const found = favoriteLookup(type, id);
      const href = found?.slug && TYPE_ROUTES[type] ? TYPE_ROUTES[type](found.slug) : routes.favoritos;
      return el('li', {}, [
        el('a', { href, text: favoriteTitle(found, id) }),
        el('small', { className: 'muted', text: ` · ${TYPE_LABELS[type] || 'Elemento'}` }),
      ]);
    }))
    : el('p', { className: 'muted', text: 'Aún no tienes favoritos. Explora eventos, artistas y foros.' });
  const notice = favoritesNotice({ configured, signedIn, count: items.length });
  return el('section', { className: 'section-block' }, [
    el('h2', { text: 'Mis favoritos' }),
    list,
    notice ? el('p', { className: 'muted account-favorites-notice', text: notice }) : null,
    el('a', { className: 'button secondary', href: routes.favoritos, text: 'Ver todos mis favoritos' }),
  ]);
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
