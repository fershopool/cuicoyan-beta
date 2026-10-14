import { el } from '../utils/dom.js';

const KINDS = [
  ['artista', 'Artista', 'Música, danza, teatro, artes visuales y otras disciplinas. Muestra tu obra, fechas y forma de contacto.'],
  ['foro', 'Foro cultural', 'Teatros, galerías, centros culturales y espacios donde se presentan artes vivas.'],
];

// Primer paso al crear o editar el perfil: la persona elige si será artista o foro.
export function renderKindPicker({ onPick }) {
  const cards = KINDS.map(([kind, title, description]) => el('button', {
    type: 'button', className: 'kind-card', attrs: { 'aria-describedby': `kind-${kind}-desc` }, onclick: () => onPick(kind),
  }, [
    el('span', { className: 'kind-card-title', text: title }),
    el('span', { className: 'kind-card-desc muted', id: `kind-${kind}-desc`, text: description }),
    el('span', { className: 'kind-card-cta', text: 'Elegir', attrs: { 'aria-hidden': 'true' } }),
  ]));
  return el('main', { id: 'contenido', className: 'app-page kind-picker-page' }, [el('div', { className: 'app-wrap' }, [
    el('header', { className: 'app-head' }, [el('div', {}, [
      el('span', { className: 'eyebrow', text: 'Mi perfil' }),
      el('h1', { text: '¿Qué perfil vas a crear?' }),
    ])]),
    el('div', { className: 'kind-grid' }, cards),
  ])]);
}
