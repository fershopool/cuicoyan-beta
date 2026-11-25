// Página /perfil/: con sesión de Google crea y edita el perfil de artista o foro en Supabase; sin sesión pide iniciar sesión.
import { el, announce } from '../utils/dom.js';
import { routes } from '../config/routes.js';
import { isConfigured, getSession, signInWithGoogle, signOut } from '../services/supabase.service.js';
import { clearFavorites, endFavoritesSession } from '../services/favorites.service.js';
import { listMine, createProfile, saveProfile, submitForReview, uploadImage, publicUrl } from '../services/profiles-remote.service.js';
import { STATUS_LABELS, MAX_PER_KIND, canSubmit, canCreate, imageFileName } from '../services/profiles-logic.js';
import { defaultDraft, normalizeDraft, getDraft } from '../services/profile-draft.service.js';
import { renderKindPicker } from './profile-kind-picker.js';
import { renderProfileEditor } from './profile-editor.js';
import { renderVenueEditor } from './venue-editor.js';

const KIND_LABEL = { artista: 'artista', foro: 'foro' };

function page(children) {
  return el('main', { id: 'contenido', className: 'app-page' }, [el('div', { className: 'app-wrap' }, children)]);
}

// `mount` reemplaza el contenido de la página (lo pasa main.js). Se llama de nuevo para repintar.
export async function renderProfilePage(mount) {
  mount(page([el('p', { className: 'muted', text: 'Cargando tu perfil…' })]));
  let session = null;
  try { session = await getSession(); } catch { session = null; }
  if (!session) { mount(loginPage()); return; }

  const query = new URLSearchParams(window.location.search);
  const kind = query.get('tipo');
  if (kind !== 'artista' && kind !== 'foro') {
    mount(renderKindPicker({ onPick: (picked) => { history.replaceState(null, '', `${routes.perfil}?tipo=${picked}`); renderProfilePage(mount); } }));
    return;
  }
  let list;
  try { list = await listMine(kind); } catch { mount(errorPage('No pudimos cargar tus perfiles. Inténtalo más tarde.')); return; }
  const id = query.get('id');
  const profile = list.find((item) => item.id === id);
  if (!profile) { mount(listPage(kind, list, { missing: Boolean(id), mount })); return; }
  try { mount(await editorPage(kind, profile, mount)); } catch { mount(errorPage('No pudimos abrir tu perfil. Inténtalo más tarde.')); }
}

function loginPage() {
  const body = isConfigured()
    ? [el('p', { className: 'muted', text: 'Inicia sesión con Google para crear tu perfil' }), el('button', { className: 'button', type: 'button', text: 'Iniciar sesión con Google', onclick: signIn })]
    : [el('p', { className: 'notice', text: 'El inicio de sesión no está disponible en esta versión.' })];
  return page([el('span', { className: 'eyebrow', text: 'Mi perfil' }), el('h1', { text: 'Crea tu perfil' }), ...body]);
}

function signIn() {
  signInWithGoogle(`${window.location.origin}${routes.perfil}`).catch(() => announce('No pudimos iniciar tu sesión. Inténtalo de nuevo.'));
}

function errorPage(message) {
  return page([el('h1', { text: 'Mi perfil' }), el('p', { className: 'notice', text: message, attrs: { role: 'alert' } }),
    el('p', {}, [el('button', { className: 'button', type: 'button', text: 'Reintentar', onclick: () => window.location.reload() }), ' ', el('a', { className: 'button secondary', href: routes.cuenta, text: 'Ir a Mi cuenta' })])]);
}

// Lista de perfiles del tipo elegido y formulario para crear un borrador nuevo.
function listPage(kind, list, { missing, mount }) {
  const label = KIND_LABEL[kind];
  const full = !canCreate(list.length);
  const error = el('p', { className: 'pe-error form-error', attrs: { role: 'alert' } });
  const nameInput = el('input', { id: 'pp-name', type: 'text', name: 'name', maxLength: 160, required: true, disabled: full, attrs: { autocomplete: 'off' } });
  const submit = el('button', { className: 'button', type: 'submit', text: 'Crear borrador', disabled: full });
  const form = el('form', { className: 'pe-form', attrs: { novalidate: '' } }, [
    el('div', { className: 'pe-field wide' }, [el('label', { htmlFor: 'pp-name', text: kind === 'foro' ? 'Nombre del foro' : 'Nombre público' }), nameInput]),
    error,
    el('div', { className: 'pe-savebar' }, [submit]),
  ]);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    const name = nameInput.value.trim();
    if (!name) { error.textContent = 'Escribe el nombre público.'; nameInput.focus(); return; }
    submit.disabled = true;
    try {
      const created = await createProfile(kind, { name, data: defaultDraft(kind, { name }) });
      history.replaceState(null, '', `${routes.perfil}?tipo=${kind}&id=${created.id}`);
      announce('Borrador creado');
      await renderProfilePage(mount);
    } catch (failure) {
      error.textContent = createMessage(failure, kind);
      submit.disabled = full;
    }
  });
  const items = list.map((item) => el('li', {}, [
    el('a', { href: `${routes.perfil}?tipo=${kind}&id=${item.id}`, text: item.name || 'Sin nombre' }),
    el('span', { className: 'muted', text: ` · ${STATUS_LABELS[item.status] || item.status}` }),
  ]));
  return page([
    el('header', { className: 'app-head' }, [el('div', {}, [el('span', { className: 'eyebrow', text: 'Mi perfil' }), el('h1', { text: list.length ? `Tus perfiles de ${label}` : `Crea tu perfil de ${label}` })])]),
    el('p', { className: 'profile-kind-switch' }, [el('a', { href: routes.perfil, text: 'Cambiar tipo de perfil' })]),
    missing ? el('p', { className: 'notice', text: 'No encontramos ese perfil en tu cuenta.' }) : null,
    items.length ? el('ul', { className: 'profile-list' }, items) : null,
    full ? el('p', { className: 'notice', text: `Ya tienes ${MAX_PER_KIND} perfiles de ${label}. Es el máximo por tipo.` }) : null,
    form,
  ]);
}

function createMessage(error, kind) {
  if (error?.message === 'limite-alcanzado') return `Ya tienes ${MAX_PER_KIND} perfiles de ${KIND_LABEL[kind]}. Es el máximo por tipo.`;
  if (error?.message === 'sin-sesion') return 'Tu sesión venció. Inicia sesión de nuevo.';
  console.error('crear perfil', error);
  return 'No pudimos crear el perfil. Inténtalo de nuevo.';
}

// Editor del perfil elegido. `saved` = lo que está en la base; `working` = respaldo local no enviado.
async function editorPage(kind, profile, mount) {
  const id = profile.id;
  const record = kind === 'foro'
    ? { slug: id, name: profile.name, description: '', categories: [], zone: '', address: '' }
    : { slug: id, name: profile.name, bio: '', longBio: '', discipline: '', tagline: '', website: '', email: '', categorySlugs: [] };
  const saved = normalizeDraft(kind, record, profile.data);
  // Las imágenes no viajan en `data`: se muestran desde su ruta en el bucket.
  if (profile.coverPath) saved.cover.image = await publicUrl(profile.coverPath);
  if (profile.avatarPath) saved.avatar.image = await publicUrl(profile.avatarPath);
  const working = getDraft(kind, id, record);

  const save = async (draft) => {
    try {
      const coverPath = await imagePath(kind, id, 'cover', draft.cover.image, profile.coverPath);
      const avatarPath = await imagePath(kind, id, 'avatar', draft.avatar.image, profile.avatarPath);
      // La galería (foros) se sube al bucket y en `data` queda su URL: en base64 no cabe en la columna.
      for (const [i, src] of (draft.gallery || []).entries()) {
        if (src.startsWith('data:')) draft.gallery[i] = await publicUrl(await imagePath(kind, id, `gallery-${i}`, src));
      }
      const data = { ...draft, cover: { ...draft.cover, image: '' }, avatar: { ...draft.avatar, image: '' } };
      await saveProfile(kind, id, { name: draft.name, data, avatar_path: avatarPath, cover_path: coverPath });
      // La imagen ya subida queda como URL: el siguiente guardado no la vuelve a subir.
      if (avatarPath) draft.avatar.image = await publicUrl(avatarPath);
      if (coverPath) draft.cover.image = await publicUrl(coverPath);
      Object.assign(profile, { name: draft.name, avatarPath, coverPath });
      // Editar un perfil publicado lo regresa a revisión: repintar el estado.
      if (profile.status === 'published') setTimeout(() => renderProfilePage(mount), 0);
    } catch (failure) {
      if (profile.status === 'pending') throw new Error('Tu perfil está en revisión y no admite cambios por ahora.');
      throw new Error(saveMessage(failure));
    }
  };
  const submit = async () => {
    if (document.querySelector('.pe-status.dirty')) {
      const warning = document.querySelector('.profile-status');
      warning?.querySelector('.form-error')?.remove();
      warning?.append(el('p', { className: 'form-error', text: 'Tienes cambios sin guardar. Pulsa «Guardar cambios» antes de enviar.', attrs: { role: 'alert' } }));
      return;
    }
    try { await submitForReview(kind, id); announce('Perfil enviado a revisión'); }
    catch { announce('No pudimos enviar tu perfil. Inténtalo de nuevo.'); return; }
    renderProfilePage(mount);
  };
  const note = statusBanner(profile, Boolean(working), submit);
  const switcher = el('p', { className: 'profile-kind-switch' }, [el('a', { href: routes.perfil, text: 'Cambiar tipo de perfil' })]);
  const args = { saved, working, note, switcher, onRemoteSave: save };
  if (kind === 'foro') return renderVenueEditor({ venue: record, ...args });
  const onLogout = async () => { await signOut(); endFavoritesSession(); clearFavorites(); window.location.href = routes.home; };
  return renderProfileEditor({ artist: record, profileId: id, onLogout, ...args });
}

// Devuelve la ruta a guardar: nueva si hay imagen recién elegida (data:), la misma si no cambió, null si se quitó.
async function imagePath(kind, id, label, value, currentPath) {
  if (!value) return null;
  if (!String(value).startsWith('data:')) return currentPath || null;
  return uploadImage(kind, id, dataUrlToBlob(value), imageFileName(label, dataUrlType(value)));
}

function dataUrlType(dataUrl) {
  return /^data:([^;,]+)/.exec(dataUrl)?.[1] || '';
}

function dataUrlToBlob(dataUrl) {
  const [head, body = ''] = dataUrl.split(',');
  const bytes = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: dataUrlType(head) });
}

function saveMessage(failure) {
  const message = failure?.message || '';
  if (/2 MB|JPG, PNG|vacía/.test(message)) return message;
  if (message === 'perfil-no-encontrado') return 'No encontramos este perfil en tu cuenta.';
  if (message === 'sin-sesion') return 'Tu sesión venció. Inicia sesión de nuevo.';
  return 'No pudimos guardar en la base de datos.';
}

function statusBanner(profile, hasWorking, onSubmit) {
  const children = [el('p', {}, [el('strong', { text: `Estado: ${STATUS_LABELS[profile.status] || profile.status}` })])];
  if (profile.status === 'rejected' && profile.reviewNote) children.push(el('p', { text: `Motivo de la revisión: ${profile.reviewNote}` }));
  if (profile.status === 'pending') children.push(el('p', { className: 'muted', text: 'Tu perfil está en revisión antes de publicarse. Hasta que se apruebe o rechace no se pueden guardar cambios (salvo administradoras).' }));
  if (profile.status === 'published') children.push(el('p', { className: 'muted', text: 'Si editas un perfil publicado, vuelve a revisión.' }));
  if (hasWorking) children.push(el('p', { className: 'muted', text: 'Tienes cambios que no llegaron a la base. Se guardaron en este navegador; guarda de nuevo para enviarlos.' }));
  if (canSubmit(profile.status)) children.push(el('button', { className: 'button secondary', type: 'button', text: 'Enviar a revisión', onclick: onSubmit }));
  return el('section', { className: 'notice profile-status', attrs: { role: 'status' } }, children);
}
