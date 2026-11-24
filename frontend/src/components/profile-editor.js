// Editor de perfil de artista: portada, foto grande que sobresale, estilos y datos, con vista previa en vivo.
import { el } from '../utils/dom.js';
import { routes } from '../config/routes.js';
import { icon } from './icons.js';
import { getCategories } from '../services/content.service.js';
import { defaultDraft } from '../services/profile-draft.service.js';
import { createEditor, lookCards, socialFields, required, urlOk, emailOk } from './profile-kit.js';

export { profileHero } from './profile-kit.js';

// `saved`: borrador de la base; `working`: cambios locales no enviados (respaldo). `note`: banner de estado.
export function renderProfileEditor({ artist, profileId, note, switcher, saved, working, onRemoteSave, onLogout }) {
  const categories = getCategories().filter((c) => c.slug !== 'todos');
  return createEditor({
    kind: 'artista', slug: profileId, record: artist, base: defaultDraft('artista', artist), saved, working,
    heading: { eyebrow: 'Mi perfil', title: 'Edita tu perfil' }, backHref: routes.artistas,
    publicHref: null, switcher, remote: true, onRemoteSave, note,
    build: (kit, draft) => {
      const { text, choices, card, toggle } = kit;
      return [
        card('flower', 'Identidad', [text('name', 'Nombre público', { max: 160, check: required('El nombre') }), text('discipline', 'Disciplina', { placeholder: 'Danza, Música, Teatro…', max: 60 }), text('tagline', 'Etiqueta corta', { placeholder: 'Tradición, Cantautora…', max: 60 }), text('bio', 'Presentación breve', { area: true, max: 160, rows: 2 }), text('longBio', 'Biografía', { area: true, max: 5000, rows: 7 }),
          choices('Disciplinas en tu perfil', categories.map((c) => [c.slug, c.label]), (v) => draft.categories.includes(v), (v) => { draft.categories = draft.categories.includes(v) ? draft.categories.filter((c) => c !== v) : [...draft.categories, v]; })]),
        ...lookCards(kit, draft),
        card('users', 'Contacto y redes', [text('website', 'Sitio web', { type: 'url', max: 500, placeholder: 'https://', check: urlOk }), text('email', 'Correo público', { type: 'email', max: 320, check: emailOk }), ...socialFields(kit)]),
        card('settings', 'Secciones visibles', [toggle('sections.bio', 'Biografía'), toggle('sections.dates', 'Próximas fechas'), toggle('sections.posts', 'Publicaciones')]),
      ];
    },
    extraCards: [el('section', { className: 'pe-card' }, [el('div', { className: 'block-title' }, [el('h2', {}, [icon('user', { size: 24 }), 'Cuenta'])]), el('div', { className: 'pe-account' }, [el('button', { className: 'button ghost', type: 'button', text: 'Cerrar sesión en este navegador', onclick: onLogout })])])],
  });
}
