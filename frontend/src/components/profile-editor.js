// Editor de perfil de artista: portada, foto grande que sobresale, estilos y datos, con vista previa en vivo.
import { el, $, announce } from '../utils/dom.js';
import { routes } from '../config/routes.js';
import { icon } from './icons.js';
import { avatar } from './cards.js';
import { getCategories } from '../services/content.service.js';
import { COVER_TONES, FONTS, SOCIALS, defaultDraft, getProfileDraft, saveProfileDraft } from '../services/profile-draft.service.js';

const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
const set = (o, p, v) => { const k = p.split('.'); const last = k.pop(); k.reduce((x, i) => x[i], o)[last] = v; };
const clone = (o) => JSON.parse(JSON.stringify(o));

// Reduce la imagen elegida para que quepa en el almacenamiento del navegador.
function readImage(file, maxSide, square) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = square ? Math.min(img.width, img.height) : null;
      const scale = Math.min(1, maxSide / (side || Math.max(img.width, img.height)));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round((square ? side : img.width) * scale); canvas.height = Math.round((square ? side : img.height) * scale);
      const sx = square ? (img.width - side) / 2 : 0; const sy = square ? (img.height - side) / 2 : 0;
      canvas.getContext('2d').drawImage(img, sx, sy, square ? side : img.width, square ? side : img.height, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url); resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}

const coverBackground = (c) => c.tone === 'custom' ? `linear-gradient(${c.angle}deg, ${c.c1}, ${c.c2})` : COVER_TONES[c.tone]?.[1] || COVER_TONES.aurora[1];

/** Portada + foto de perfil + textos. `update(draft)` repinta; se usa en la vista previa y en el perfil público. */
export function profileHero(artist, draft, { editable = false, onPickCover, onPickAvatar } = {}) {
  const cover = el('div', { className: 'pe-cover' }, [el('img', { className: 'pe-cover-img', alt: '', decoding: 'async' }), el('span', { className: 'pe-cover-pattern', attrs: { 'aria-hidden': 'true' } })]);
  const pick = (label, iconName, className, handler) => el('label', { className: `pe-pick ${className}` }, [icon(iconName, { size: 20 }), el('span', { text: label }), el('input', { type: 'file', accept: 'image/*', className: 'sr-only', onchange: (event) => { const file = event.target.files[0]; event.target.value = ''; if (file) handler(file); } })]);
  const face = el('span', { className: 'pe-avatar' });
  const eyebrow = el('span', { className: 'eyebrow', text: artist.eyebrow || 'Artes vivas · CDMX' });
  const name = el('h1'); const tags = el('p', { className: 'pe-tags' }); const short = el('p', { className: 'pe-short' });
  const node = el('section', { className: 'pe-hero' }, [
    el('div', { className: 'pe-cover-wrap' }, [cover, editable ? pick('Cambiar portada', 'image', 'pe-pick-cover', onPickCover) : null]),
    el('div', { className: 'pe-id' }, [el('div', { className: 'pe-avatar-wrap' }, [face, editable ? pick('Cambiar foto', 'plus', 'pe-pick-avatar', onPickAvatar) : null]), el('div', { className: 'pe-copy' }, [eyebrow, name, tags, short])]),
  ]);
  function update(d) {
    node.style.setProperty('--pe-cover-h', `${d.cover.height}px`);
    node.style.setProperty('--pe-avatar', `${d.avatar.size}px`);
    node.style.setProperty('--pe-accent', d.accent);
    node.style.setProperty('--pe-font', FONTS[d.font]?.[1] || FONTS.moderna[1]);
    cover.style.background = coverBackground(d.cover);
    const image = $('.pe-cover-img', cover); image.hidden = !d.cover.image; if (d.cover.image) image.src = d.cover.image; else image.removeAttribute('src');
    cover.classList.toggle('no-pattern', !d.cover.pattern);
    node.dataset.shape = d.avatar.shape; node.dataset.ring = String(d.avatar.ring);
    face.replaceChildren(d.avatar.image ? el('img', { className: 'avatar', src: d.avatar.image, alt: '' }) : avatar({ ...artist, name: d.name || artist.name || '?' }));
    name.textContent = d.name || 'Tu nombre artístico';
    tags.textContent = [d.discipline, d.tagline].filter(Boolean).join(' • ');
    short.textContent = d.bio;
  }
  update(draft);
  return { node, update };
}

const COLOR_PRESETS = ['#E91662', '#8A3FFC', '#009BA5', '#E96F00', '#0B7A55', '#1766B3'];

export function renderProfileEditor({ artist, profileId, remote, status, switcher, onRemoteSave, onSubmitReview, onLogout }) {
  const base = defaultDraft(artist);
  let saved = getProfileDraft(profileId, artist) || base;
  const draft = clone(saved);
  const hero = profileHero(artist, draft, {
    editable: true,
    onPickCover: (file) => readImage(file, 1600, false).then((src) => { draft.cover.image = src; changed(); }).catch((e) => announce(e.message)),
    onPickAvatar: (file) => readImage(file, 560, true).then((src) => { draft.avatar.image = src; changed(); }).catch((e) => announce(e.message)),
  });
  const refreshers = [];
  const savebarStatus = el('span', { className: 'pe-status', attrs: { role: 'status' }, text: 'Sin cambios' });
  const saveButton = el('button', { className: 'button', type: 'submit', text: 'Guardar cambios', disabled: true });
  const discardButton = el('button', { className: 'button ghost', type: 'button', text: 'Descartar', disabled: true });
  const isDirty = () => JSON.stringify(draft) !== JSON.stringify(saved);
  function changed() {
    hero.update(draft); refreshers.forEach((fn) => fn());
    const dirty = isDirty(); saveButton.disabled = discardButton.disabled = !dirty;
    savebarStatus.textContent = dirty ? 'Cambios sin guardar' : 'Sin cambios'; savebarStatus.classList.toggle('dirty', dirty);
  }

  const field = (label, control, wide) => el('label', { className: `pe-field${wide ? ' wide' : ''}` }, [el('span', { text: label }), control]);
  const text = (path, label, { area, max = 200, type = 'text', placeholder = '', rows = 4, wide } = {}) => {
    const control = el(area ? 'textarea' : 'input', { name: path, maxLength: max, placeholder, ...(area ? { rows } : { type }) });
    control.value = get(draft, path) || '';
    control.addEventListener('input', () => { set(draft, path, control.value); changed(); });
    refreshers.push(() => { if (document.activeElement !== control) control.value = get(draft, path) || ''; });
    return field(label, control, wide || area);
  };
  const range = (path, label, min, max, unit = 'px') => {
    const out = el('output'); const control = el('input', { type: 'range', min, max, step: 2, name: path });
    const sync = () => { control.value = get(draft, path); out.textContent = `${control.value}${unit}`; };
    control.addEventListener('input', () => { set(draft, path, Number(control.value)); changed(); });
    refreshers.push(sync); sync();
    return field(label, el('span', { className: 'pe-range' }, [control, out]));
  };
  const select = (path, label, options) => {
    const control = el('select', { name: path }, options.map(([value, name]) => el('option', { value, text: name })));
    control.value = get(draft, path); control.addEventListener('change', () => { set(draft, path, control.value); changed(); });
    refreshers.push(() => { control.value = get(draft, path); });
    return field(label, control);
  };
  const toggle = (path, label) => {
    const control = el('input', { type: 'checkbox', name: path }); control.checked = !!get(draft, path);
    control.addEventListener('change', () => { set(draft, path, control.checked); changed(); });
    refreshers.push(() => { control.checked = !!get(draft, path); });
    return el('label', { className: 'pe-toggle' }, [control, el('span', { text: label })]);
  };
  const color = (path, label) => { const control = el('input', { type: 'color', name: path }); control.value = get(draft, path); control.addEventListener('input', () => { set(draft, path, control.value); changed(); }); refreshers.push(() => { control.value = get(draft, path); }); return field(label, control); };
  // Botones con aria-pressed: `items` = [[valor, etiqueta, estilo?]]
  const choices = (label, items, isOn, pick, className = '') => {
    const buttons = items.map(([value, name, style]) => { const b = el('button', { type: 'button', className: `pe-chip ${className}`, style: style || undefined, title: name, text: className === 'swatch' ? '' : name, attrs: { 'aria-label': name } }); b.addEventListener('click', () => { pick(value); changed(); }); return [value, b]; });
    const sync = () => buttons.forEach(([value, b]) => b.setAttribute('aria-pressed', String(isOn(value))));
    refreshers.push(sync); sync();
    return el('div', { className: 'pe-field wide' }, [el('span', { text: label }), el('div', { className: 'pe-chips', attrs: { role: 'group', 'aria-label': label } }, buttons.map(([, b]) => b))]);
  };
  const card = (iconName, title, body, hint) => el('section', { className: 'pe-card' }, [el('div', { className: 'block-title' }, [el('h2', {}, [icon(iconName, { size: 24 }), title])]), hint ? el('p', { className: 'muted pe-hint', text: hint }) : null, el('div', { className: 'pe-grid' }, body)]);

  const customRow = el('div', { className: 'pe-grid pe-custom wide' }, [color('cover.c1', 'Color inicial'), color('cover.c2', 'Color final'), range('cover.angle', 'Ángulo', 0, 360, '°')]);
  refreshers.push(() => { customRow.hidden = draft.cover.tone !== 'custom'; });
  const clearCover = el('button', { type: 'button', className: 'button secondary', text: 'Quitar imagen de portada' });
  clearCover.addEventListener('click', () => { draft.cover.image = ''; changed(); });
  const clearAvatar = el('button', { type: 'button', className: 'button secondary', text: 'Quitar foto de perfil' });
  clearAvatar.addEventListener('click', () => { draft.avatar.image = ''; changed(); });
  refreshers.push(() => { clearCover.hidden = !draft.cover.image; clearAvatar.hidden = !draft.avatar.image; });

  const categories = getCategories().filter((c) => c.slug !== 'todos');
  const form = el('form', { className: 'pe-form', attrs: { novalidate: '' } }, [
    card('flower', 'Identidad', [text('name', 'Nombre público', { max: 160 }), text('discipline', 'Disciplina', { placeholder: 'Danza, Música, Teatro…', max: 60 }), text('tagline', 'Etiqueta corta', { placeholder: 'Tradición, Cantautora…', max: 60 }), text('bio', 'Presentación breve', { area: true, max: 160, rows: 2 }), text('longBio', 'Biografía', { area: true, max: 5000, rows: 7 }),
      choices('Disciplinas en tu perfil', categories.map((c) => [c.slug, c.label]), (v) => draft.categories.includes(v), (v) => { draft.categories = draft.categories.includes(v) ? draft.categories.filter((c) => c !== v) : [...draft.categories, v]; })]),
    card('image', 'Portada y foto', [
      choices('Fondo de portada', Object.entries(COVER_TONES).map(([value, [name, css]]) => [value, name, css ? `background:${css}` : 'background:conic-gradient(#F21F6D,#FF9D2E,#00C7D4,#8A3FFC,#F21F6D)']), (v) => draft.cover.tone === v, (v) => { draft.cover.tone = v; }, 'swatch'),
      customRow, range('cover.height', 'Altura de la portada', 160, 380), toggle('cover.pattern', 'Mostrar patrón decorativo'), clearCover,
      range('avatar.size', 'Tamaño de la foto', 110, 240), select('avatar.shape', 'Forma de la foto', [['circle', 'Círculo'], ['blob', 'Orgánica'], ['square', 'Cuadrada']]), toggle('avatar.ring', 'Aro de colores'), clearAvatar,
    ], 'Usa los botones sobre la vista previa para subir tus imágenes.'),
    card('sparkles', 'Estilo', [choices('Color de acento', COLOR_PRESETS.map((c) => [c, c, `background:${c}`]), (v) => draft.accent === v, (v) => { draft.accent = v; }, 'swatch'), color('accent', 'Color propio'), select('font', 'Tipografía del nombre', Object.entries(FONTS).map(([value, [name]]) => [value, name]))]),
    card('users', 'Contacto y redes', [text('website', 'Sitio web', { type: 'url', max: 500, placeholder: 'https://' }), text('email', 'Correo público', { type: 'email', max: 320 }), ...SOCIALS.map(([id, name, placeholder]) => text(`social.${id}`, name, { placeholder }))]),
    card('settings', 'Secciones visibles', [toggle('sections.bio', 'Biografía'), toggle('sections.dates', 'Próximas fechas'), toggle('sections.posts', 'Publicaciones')]),
    remote ? el('section', { className: 'pe-card' }, [el('div', { className: 'block-title' }, [el('h2', {}, [icon('user', { size: 24 }), 'Cuenta'])]), el('p', { className: 'muted', text: `Estado: ${status}` }), el('div', { className: 'pe-account' }, [onSubmitReview ? el('button', { className: 'button secondary', type: 'button', text: 'Enviar a revisión', onclick: onSubmitReview }) : null, el('button', { className: 'button ghost', type: 'button', text: 'Cerrar sesión en este navegador', onclick: onLogout })])]) : null,
    el('p', { className: 'pe-error form-error', attrs: { role: 'alert' } }),
    el('div', { className: 'pe-savebar' }, [savebarStatus, discardButton, saveButton]),
  ]);
  const errorBox = $('.pe-error', form);
  discardButton.addEventListener('click', () => { Object.assign(draft, clone(saved)); changed(); announce('Cambios descartados'); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); errorBox.textContent = ''; saveButton.disabled = true;
    try {
      if (!saveProfileDraft(profileId, draft)) throw new Error('No se pudo guardar: las imágenes pesan demasiado para este navegador.');
      if (remote) await onRemoteSave(draft);
      saved = clone(draft); changed(); savebarStatus.textContent = 'Guardado ✓'; announce('Perfil guardado');
    } catch (error) { errorBox.textContent = error.message || 'No se pudo guardar el perfil.'; saveButton.disabled = false; }
  });
  window.addEventListener('beforeunload', (event) => { if (isDirty()) event.preventDefault(); });
  changed();

  const main = el('main', { id: 'contenido', className: 'app-page profile-edit-page' }, [el('div', { className: 'app-wrap' }, [
    el('a', { className: 'back-link', href: routes.artistas }, [icon('back', { size: 24 }), el('span', { text: 'Regresar' })]),
    el('header', { className: 'app-head' }, [el('div', {}, [el('span', { className: 'eyebrow', text: 'Mi perfil' }), el('h1', { text: 'Edita tu perfil' })]), remote ? null : el('span', { className: 'badge', text: 'Modo demostración' })]),
    switcher || null,
    hero.node,
    remote ? null : el('p', { className: 'demo-note', text: 'Sin sesión activa: tus cambios se guardan solo en este navegador.' }),
    form,
  ])]);
  return main;
}
