import { el, $, announce } from './utils/dom.js';
import { routeForPath, routes, withBase } from './config/routes.js';
import { readUrlState, goWithState } from './utils/url-state.js';
import { getEvents, getArtists, getVenues, getCategories, getEvent, getArtist, getVenue, getVenueById, getCalls, getHelp, loadRemoteEvents, loadRemoteEvent, loadRemoteSpaces, loadRemoteArtists } from './services/content.service.js';
import { searchItems } from './services/search.service.js';
import { getFavorites, isFavorite, toggleFavorite } from './services/favorites.service.js';
import { renderAccountPage } from './components/account-page.js';
import { getPreferences, savePreferences, clearPreferences } from './services/preferences.service.js';
import { renderShell, renderFooter } from './components/shell.js';
import { eventCard, artistCard, venueCard, eventImageUrl } from './components/cards.js';
import { icon, emblem } from './components/icons.js';
import { mapView } from './components/map.js';
import { renderArtistsPage, renderFavoritesPage, renderMapPage, renderArtistProfile, renderVenueProfile, renderEventDetail, renderEventsPage, renderVenuesPage, renderExplorePage, mapBlock } from './components/app-pages.js';
import { joinForm } from './components/join-form.js';
import { renderProfileEditor } from './components/profile-editor.js';
import { renderVenueEditor } from './components/venue-editor.js';
import { renderKindPicker } from './components/profile-kind-picker.js';
import { TEST_EDIT_ACCESS } from './config/test-access.js';
import { apiRequest, invitationParams, loginUrl, logout, startInvitation } from './services/auth.service.js';
import { ApiError, messageFor } from './services/auth-errors.js';
import { adminStatus, registerPasskey, stepUp, listContactRequests, setContactStatus, createInvitation, approveContactRequest, inviteApprovedRequest, ollinListText, listAccounts, setAccountStatus, listInvitations, revokeInvitation } from './services/admin.service.js';


const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = new URL('./styles/app.css', import.meta.url);
document.head.append(stylesheet);
const mockupStyles = document.createElement('link');
mockupStyles.rel = 'stylesheet';
mockupStyles.href = new URL('./styles/mockup.css', import.meta.url);
document.head.append(mockupStyles);
const editorStyles = document.createElement('link');
editorStyles.rel = 'stylesheet';
editorStyles.href = new URL('./styles/profile-editor.css', import.meta.url);
document.head.append(editorStyles);
const pickerStyles = document.createElement('link');
pickerStyles.rel = 'stylesheet';
pickerStyles.href = new URL('./styles/profile-picker.css', import.meta.url);
document.head.append(pickerStyles);
const venueEditorStyles = document.createElement('link');
venueEditorStyles.rel = 'stylesheet';
venueEditorStyles.href = new URL('./styles/venue-editor.css', import.meta.url);
document.head.append(venueEditorStyles);

let events = getEvents();
let artists = getArtists();
let venues = getVenues();
const categories = getCategories();

function pageFrame({ eyebrow, title, description, children, className = '' }) {
  const main = el('main', { id: 'contenido' }, [el('section', { className: `page-hero ${className}` }, [el('div', { className: 'container page-hero-inner' }, [el('span', { className: 'eyebrow', text: eyebrow }), el('h1', { text: title }), description ? el('p', { className: 'muted', text: description }) : null])]), ...children]);
  $('#app').replaceWith(main);
  return main;
}

function sectionHeading(eyebrow, title, description) { return el('div', { className: 'section-heading' }, [eyebrow ? el('span', { className: 'eyebrow', text: eyebrow }) : null, el('h2', { text: title }), description ? el('p', { text: description }) : null]); }
function section(className, children) { return el('section', { className: `section ${className || ''}` }, [el('div', { className: 'container' }, children)]); }
function linkButton(label, href, secondary = false) { return el('a', { className: `button${secondary ? ' secondary' : ''}`, href, text: label }); }
function demoNotice(text = 'Los registros con esta etiqueta son demostrativos y deben verificarse antes de publicar.') { return el('p', { className: 'notice', text }); }

function renderHome() {
  const search = el('form', { className: 'search-box', attrs: { role: 'search' } }, [el('label', { className: 'sr-only', htmlFor: 'home-search', text: 'Buscar en Cuicoyan' }), el('input', { id: 'home-search', name: 'q', type: 'search', placeholder: 'Busca eventos, artistas o lugares', autocomplete: 'off' }), el('button', { className: 'button', type: 'submit', text: 'Buscar' })]);
  search.addEventListener('submit', (event) => { event.preventDefault(); goWithState(routes.explorar, { q: $('#home-search', search).value }); });
  const heroTitle = el('h1', {}, ['Descubre la cultura que está pasando', el('span', { className: 'hero-emphasis', text: ' cerca de ti.' })]);
  const scene = el('div', { className: 'home-scene', attrs: { 'aria-hidden': 'true' } }, ['todos', 'huapango', 'teatro'].flatMap((name) => ['light', 'dark'].map((mode) => el('img', { className: `scene-img scene-${name} mode-${mode}`, src: withBase(`/src/assets/mockup/hero-${name}-${mode}.webp`), alt: '', decoding: 'async' }))));
  const brand = el('div', { className: 'home-brand' }, [emblem('home-emblem'), el('div', { className: 'home-brand-copy' }, [el('h1', { text: 'CDMX Cuicoyan' }), el('p', { text: 'Donde la ciudad encuentra su escenario.' })]), el('a', { className: 'sparkle-button', href: routes.explorar, attrs: { 'aria-label': 'Descubrir y explorar' } }, [icon('sparkles', { size: 30 })])]);
  search.prepend(icon('search', { size: 26, className: 'search-icon' }));
  const hero = el('section', { className: 'hero' }, [scene, brand, el('div', { className: 'container hero-grid' }, [el('div', { className: 'hero-copy' }, [el('span', { className: 'eyebrow', text: 'Cultura viva en CDMX' }), heroTitle, el('p', { text: 'Eventos, artistas, foros y experiencias culturales de CDMX, reunidos para que encuentres tu próximo plan.' }), search, el('div', { className: 'hero-actions' }, [linkButton('Explorar Cuicoyan', routes.explorar), linkButton('Soy artista o foro', '#para-creadores', true)]), el('p', { className: 'muted hero-tagline', text: 'Donde la ciudad encuentra su escenario.' }), el('div', { className: 'quick-links', attrs: { 'aria-label': 'Accesos rápidos' } }, [['Cerca de ti','cerca'],['Este fin de semana','fin-de-semana'],['Gratis','libre'],['Para ir en familia','familia']].map(([label, value]) => el('a', { className: 'chip', href: `${routes.explorar}?intencion=${value}`, text: label }))) ]), el('div', { className: 'hero-art' }, [el('div', { className: 'hero-art-card' }, [el('img', { className: 'hero-art-image', src: withBase('/src/assets/cuicoyan/hero-cdmx.webp'), alt: 'Collage editorial de CDMX con Bellas Artes, flores, textiles y un instrumento de cuerda.', fetchpriority: 'high' }), el('span', { className: 'hero-art-word', text: 'CULTURA VIVA · CDMX', attrs: { 'aria-hidden': 'true' } })])])])]);
  const scenes = { huapango: 'huapango', teatro: 'teatro' };
  const eventList = el('div', { className: 'ev-list', attrs: { 'aria-live': 'polite' } });
  const eventCount = el('a', { className: 'count-link', href: routes.eventos });
  const home = { category: categories.some((c) => c.slug === readUrlState().categoria) ? readUrlState().categoria : 'todos' };
  const chips = categories.map((category) => { const chip = el('button', { className: 'cat-chip', type: 'button', dataset: { cat: category.slug }, style: `--chip-color:var(--${category.color === 'brand' ? 'primary' : category.color})` }, [icon(category.slug === 'todos' ? 'all' : category.slug, { size: 24, className: 'cat-icon' }), el('span', { text: category.label })]); chip.addEventListener('click', () => { home.category = category.slug; paintHome(); announce(`Categoría ${category.label}`); }); return chip; });
  function paintHome() {
    const shown = home.category === 'todos' ? events : events.filter((event) => (event.categorySlugs || []).includes(home.category));
    eventList.replaceChildren(...(shown.length ? shown.slice(0, 4).map(eventCard) : [el('div', { className: 'empty-state' }, [el('h3', { text: 'Aún no hay eventos en esta categoría' }), el('p', { className: 'muted', text: 'Prueba otra disciplina o revisa toda la agenda.' })])]));
    eventCount.replaceChildren(`${shown.length} evento${shown.length === 1 ? '' : 's'}`, icon('chevron', { size: 18 }));
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.cat === home.category)));
    const mainNode = document.getElementById('contenido'); if (mainNode) { mainNode.dataset.scene = scenes[home.category] || 'todos'; mainNode.dataset.cat = home.category; }
  }
  const categorySection = section('home-cats', [el('div', { className: 'section-heading' }, [el('span', { className: 'eyebrow', text: 'Explora a tu manera' }), el('h2', { text: '¿Qué te gustaría vivir?' }), el('p', { className: 'only-desktop', text: 'Empieza por lo que te mueve. Puedes cambiar de categoría, fecha o zona en cualquier momento.' })]), el('div', { className: 'cat-row', attrs: { role: 'group', 'aria-label': 'Categorías culturales' } }, chips), el('div', { className: 'intentions only-desktop' }, [['Cerca de ti','cerca'],['Este fin de semana','fin-de-semana'],['Entrada libre','libre'],['Para ir en familia','familia'],['Tradición','tradicion'],['Escena independiente','independiente']].map(([label,value]) => el('a', { className: 'chip', href: `${routes.explorar}?intencion=${value}`, text: label }))), el('p', { className: 'only-desktop', style: 'margin-top:1rem' }, [el('a', { className: 'button ghost', href: `${routes.explorar}#categorias`, text: 'Ver todas las categorías →' })])]);
  const eventsSection = section('home-agenda', [el('div', { className: 'agenda-head' }, [el('div', { className: 'section-heading' }, [el('span', { className: 'eyebrow', text: 'Agenda local' }), el('h2', {}, [el('span', { className: 'only-app', text: 'Próximos eventos' }), el('span', { className: 'only-desktop', text: 'Planes para encontrarte con la ciudad.' })]), el('p', { className: 'only-desktop', text: 'Explora una selección de música, danza, teatro y encuentros que están por suceder.' })]), eventCount]), eventList, el('p', { className: 'demo-note', text: 'Los registros de esta agenda son demostrativos y deben verificarse antes de publicar.' }), el('div', { className: 'only-desktop', style: 'margin-top:1.4rem' }, [linkButton('Ver todos los eventos', routes.eventos, true)])]);
  const homeMap = mapBlock(onMap().slice(0, 4), 'venue-alicia');
  const mapSection = section('paper home-map', [sectionHeading('Mapa cultural', 'La cultura también se descubre caminando.', 'Ubica foros, eventos y espacios culturales por zona. Empieza en CDMX y acerca el mapa a tu barrio.'), el('div', { className: 'map-layout' }, [el('div', { className: 'place-rows' }, [...homeMap.rows, linkButton('Abrir mapa cultural', routes.mapa)]), homeMap.shell])]);
  const artistsSection = section('', [sectionHeading('Personas y colectivos', 'Artistas que están creando.', 'Conoce las voces, cuerpos, ideas y proyectos que mantienen en movimiento la cultura de la ciudad.'), demoNotice(), el('div', { className: 'grid grid-4' }, artists.slice(0, 4).map(artistCard)), el('div', { style: 'margin-top:1.4rem' }, [linkButton('Conocer artistas', routes.artistas, true)])]);
  const venuesSection = section('alt', [sectionHeading('Espacios culturales', 'Foros que hacen ciudad.', 'Encuentra escenarios, centros culturales y espacios independientes; conoce su programación y cómo llegar.'), demoNotice(), el('div', { className: 'cards' }, venues.slice(0, 3).map(venueCard)), el('div', { style: 'margin-top:1.4rem' }, [linkButton('Explorar foros', routes.foros, true)])]);
  const benefitCard = (label, title, copy, bullets, href, cta) => el('article', { className: 'benefit' }, [el('span', { className: 'badge', text: label }), el('h3', { text: title }), el('p', { className: 'muted', text: copy }), el('ul', {}, bullets.map((item) => el('li', { text: item }))), linkButton(cta, href, true)]);
  const benefitsSection = section('', [
    sectionHeading('Para quienes hacen cultura', 'Cuicoyan también es un lugar para tu proyecto.', 'Construye una presencia clara, conecta tu programación con nuevos públicos y forma parte del mapa cultural de la ciudad.'),
    el('div', { id: 'para-creadores', className: 'benefit-grid' }, [
      benefitCard('Artistas y colectivos', 'Haz resonar tu trabajo', 'Reúne tu perfil, disciplinas, publicaciones y próximas fechas para que el público descubra tu trabajo en contexto.', ['Perfil cultural propio', 'Fechas conectadas con eventos y foros', 'Mayor facilidad para que te encuentren'], `${routes.unete}?rol=artista`, 'Quiero registrar mi proyecto'),
      benefitCard('Foros y espacios', 'Muestra dónde ocurre', 'Presenta tu espacio, zona y programación en un lugar diseñado para conectar con públicos diversos.', ['Ficha clara del espacio', 'Programación relacionada', 'Presencia en el mapa cultural'], `${routes.unete}?rol=foro`, 'Quiero sumar mi espacio'),
    ]),
  ]);
  const purposeSection = section('paper', [sectionHeading('El lugar del canto', 'Una ciudad se reconoce en lo que comparte.', 'Cuicoyan reúne las historias, encuentros y escenarios que hacen visible la cultura cotidiana de CDMX. La exploración empieza en un evento, una voz o un lugar; la comunidad hace el resto.')]);
  const finalSection = section('', [el('div', { className: 'final-cta' }, [el('div', { className: 'prose' }, [el('span', { className: 'eyebrow', style: 'color:#fff', text: 'Súmate a la escena' }), el('h2', { text: 'Encuentra tu próximo escenario.' }), el('p', { text: 'Explora contenidos demostrativos hoy y ayúdanos a construir una agenda cultural clara, cercana y viva.' })]), linkButton('Explorar Cuicoyan', routes.explorar)])]);
  $('#app').replaceWith(el('main', { id: 'contenido', className: 'home' }, [hero, categorySection, eventsSection, mapSection, artistsSection, venuesSection, benefitsSection, purposeSection, finalSection]));
  paintHome();
}

function renderExplore() {
  const state = readUrlState();
  renderExplorePage({ results: searchItems([...events, ...artists, ...venues], state), categories, state, navigate: (next) => goWithState(routes.explorar, next), eventCard, events });
}

function eventMatchesState(event, state) {
  const query = state.q.toLowerCase().trim();
  const searchable = `${event.title || ''} ${event.description || ''} ${event.venueName || ''} ${event.venueZone || ''} ${(event.categorySlugs || []).join(' ')}`.toLowerCase();
  if (query && !searchable.includes(query)) return false;
  if (state.zone && event.venueZone !== state.zone) return false;
  if (state.categoria && !(event.categorySlugs || []).includes(state.categoria)) return false;
  if (state.date !== 'all' && event.startsAt) {
    const startsAt = new Date(event.startsAt);
    const today = new Date();
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(day);
    if (state.date === 'today') end.setDate(end.getDate() + 1);
    if (state.date === 'weekend') { day.setDate(day.getDate() + (6 - day.getDay() + 7) % 7); end.setTime(day.getTime()); end.setDate(end.getDate() + 2); }
    if (state.date === 'month') { day.setDate(1); end.setMonth(end.getMonth() + 1); }
    if (startsAt < day || startsAt >= end) return false;
  }
  return true;
}

function renderEvents() {
  const state = { date: 'all', zone: '', categoria: '', ...readUrlState() };
  const zones = [...new Set(venues.map((venue) => venue.zone).filter(Boolean))];
  renderEventsPage({ items: events.filter((item) => eventMatchesState(item, state)), zones, categories, state, navigate: (next) => goWithState(routes.eventos, next), eventCard });
}
function renderArtists() { renderArtistsPage(artists, events); }
function renderVenues() { renderVenuesPage(venues); }

function renderDetail(type) {
  const slug = window.location.pathname.split('/').filter(Boolean).at(-1);
  const item = type === 'event' ? (events.find((entry) => entry.slug === slug) || getEvent(slug)) : type === 'artist' ? getArtist(slug) : getVenue(slug);
  if (!item && type !== 'event' && !remoteCatalogReady) {
    // Enlace directo a un artista o foro remoto: esperar a que cargue el catálogo antes de decidir 404.
    pageFrame({ eyebrow: type === 'artist' ? 'Artista' : 'Foro', title: 'Cargando…', description: '', children: [] });
    void remoteCatalog.then(() => { if (window.location.pathname.endsWith(`/${slug}`)) renderCurrentRoute(); });
    return;
  }
  if (!item) {
    if (type === 'event') { pageFrame({ eyebrow: 'Evento', title: 'Cargando evento…', description: '', children: [] }); void loadRemoteEvent(slug).then((remote) => { if (!window.location.pathname.endsWith(`/${slug}`)) return; remote ? renderCurrentRoute() : renderNotFound(); }); return; }
    return renderNotFound();
  }
  if (type === 'event') return renderEventDetail(item, { artists });
  if (type === 'artist') return renderArtistProfile(item, { events });
  return renderVenueProfile(item, { events });
}

// Los foros que desmarcan «publicar» en su editor no aparecen en el mapa.
function onMap() { return venues.filter((venue) => venue.mapVisible !== false); }
function renderMap() { renderMapPage(onMap()); }

function renderFavorites() { renderFavoritesPage({ events, artists, venues }); }

function renderOnboarding() { const selected = new Set(getPreferences().interests); const form = el('form', { className: 'onboarding' }, [el('span', { className: 'eyebrow', text: 'Preferencias locales' }), el('h1', { text: '¿Qué te gustaría vivir?' }), el('p', { className: 'muted', text: 'Elige intereses para preparar tu exploración. No pedimos correo ni creamos una cuenta.' }), el('div', { className: 'interest-grid' }, categories.slice(1).map((category) => el('label', {}, [el('input', { type: 'checkbox', name: 'interest', value: category.slug, checked: selected.has(category.slug) }), el('span', { text: category.label })]))), el('div', { className: 'hero-actions' }, [el('button', { className: 'button', type: 'submit', text: 'Guardar intereses' }), el('a', { className: 'button secondary', href: routes.explorar, text: 'Omitir' })]), el('button', { className: 'button ghost', type: 'button', text: 'Borrar datos locales' })]); form.addEventListener('submit', (event) => { event.preventDefault(); savePreferences({ interests: [...form.querySelectorAll('input:checked')].map((input) => input.value) }); announce('Intereses guardados en este navegador'); window.location.href = routes.explorar; }); form.querySelector('.button.ghost').addEventListener('click', () => { clearPreferences(); announce('Datos locales borrados'); form.reset(); }); $('#app').replaceWith(el('main', { id: 'contenido' }, [form])); }

// MVP beta: sin registro de artistas ni foros, las páginas de alta muestran este aviso (TEST_EDIT_ACCESS=false).
function comingSoon(eyebrow, title) {
  return pageFrame({ eyebrow, title, description: "Próximamente: registro de artistas y foros.", children: [section("", [el("p", { className: "notice", text: "Próximamente: registro de artistas y foros." }), linkButton("Volver al inicio", routes.home, true)])] });
}

function renderCreators() { if (!TEST_EDIT_ACCESS) return comingSoon("Para quienes hacen cultura", "Tu proyecto también encuentra su escenario."); return pageFrame({ eyebrow: 'Para quienes hacen cultura', title: 'Tu proyecto también encuentra su escenario.', description: 'Una explicación del espacio de participación, sin promesas de alcance, comisión o resultados garantizados.', children: [section('', [el('div', { className: 'benefit-grid' }, [el('article', { className: 'benefit' }, [el('h2', { text: 'Artistas y colectivos' }), el('p', { text: 'Una presencia clara para reunir disciplinas, publicaciones y próximas fechas.' }), el('ul', {}, ['Perfil cultural propio','Eventos y foros relacionados','Información editable cuando exista un canal aprobado'].map((x) => el('li', { text: x }))), el('a', { className: 'button', href: `${routes.unete}?rol=artista`, text: 'Quiero registrar mi proyecto' })]), el('article', { className: 'benefit' }, [el('h2', { text: 'Foros y espacios' }), el('p', { text: 'Una ficha para mostrar qué sucede en tu espacio y cómo se conecta con la ciudad.' }), el('ul', {}, ['Ficha del espacio','Presencia en el mapa conceptual','Programación relacionada'].map((x) => el('li', { text: x }))), el('a', { className: 'button', href: `${routes.unete}?rol=foro`, text: 'Quiero sumar mi espacio' })])]), demoNotice()]) ] }); }
function renderJoin() {
  if (!TEST_EDIT_ACCESS) return comingSoon("Participa", "Únete a Cuicoyan.");
  const titles = { foro: 'Suma tu espacio a Cuicoyan.', artista: 'Haz resonar tu proyecto.' };
  const steps = [['1', 'Llena el formulario', 'Cuéntanos quién eres y qué haces. Toma unos 3 minutos.'], ['2', 'Revisamos tu registro', 'El equipo verifica la información antes de publicar nada.'], ['3', 'Te escribimos', 'Recibirás respuesta en el correo que compartas.']];
  const aside = el('aside', { className: 'join-aside' }, [el('span', { className: 'badge', text: 'Registro gratuito' }), el('h2', { text: '¿Cómo funciona?' }), el('ol', { className: 'join-steps' }, steps.map(([n, title, copy]) => el('li', {}, [el('span', { text: n, attrs: { 'aria-hidden': 'true' } }), el('div', {}, [el('strong', { text: title }), el('p', { className: 'muted', text: copy })])]))), el('p', { className: 'muted', text: 'No creamos una cuenta ni publicamos tus datos de contacto. Solo usamos tu información para revisar tu registro.' })]);
  const initial = new URLSearchParams(window.location.search).get('rol');
  const main = pageFrame({ eyebrow: 'Participa', title: titles[initial] || 'Únete a Cuicoyan.', description: 'Registra tu proyecto o tu espacio y forma parte del mapa cultural de CDMX.', children: [section('', [el('div', { className: 'join-layout' }, [aside, joinForm(initial, (role) => { const url = new URL(window.location.href); url.searchParams.set('rol', role); history.replaceState(null, '', url); $('.page-hero h1').textContent = titles[role]; })])])] });
  return main;
}
// Panel de error accesible: texto fijo (nunca detalle del servidor), role="alert" y una acción clara.
function authErrorPanel(error, retry) {
  const kind = error?.kind || 'generic';
  const actions = [];
  if (kind === 'session' || (kind === 'idp' && error.phase === 'expired')) actions.push(el('a', { className: 'button', text: 'Iniciar sesión', attrs: { href: loginUrl() } }));
  if (kind === 'idp' && retry) actions.push(el('button', { className: 'button', type: 'button', text: 'Reintentar', onclick: retry }));
  return el('div', { className: 'detail-panel' }, [el('p', { className: 'notice', text: messageFor(kind, error?.phase), attrs: { role: 'alert' } }), ...actions]);
}
let invitationToken = '';
function renderInvitation() {
  const state = el('div', { id: 'invitation-state', className: 'detail-panel', attrs: { 'aria-live': 'polite' } }, [el('p', { className: 'muted', text: 'Validando invitación…' })]);
  const main = pageFrame({ eyebrow: 'Invitación privada', title: 'Activa tu acceso a Cuicoyan.', description: 'Inicia sesión con tu cuenta Ollin para activar tu acceso. Nunca te pediremos una contraseña en esta página.', children: [section('', [state])] });
  // Lee el fragmento y lo quita de la URL. Solo en memoria: la pantalla se repinta cuando llegan datos remotos
  // y la segunda lectura ya no encontraría el fragmento.
  const token = (invitationToken ||= invitationParams().token);
  if (!token) { state.replaceChildren(authErrorPanel({ kind: 'invitation' })); return main; }
  const button = el('button', { className: 'button', type: 'button', text: 'Continuar con Ollin' });
  const start = async () => {
    button.disabled = true;
    try {
      const redirect = await startInvitation(token);
      window.location.assign(redirect);
    } catch (requestError) {
      button.disabled = false;
      state.replaceChildren(authErrorPanel(asApiError(requestError)));
    }
  };
  button.addEventListener('click', start);
  state.replaceChildren(el('p', { text: 'Tu invitación está lista.' }), button);
  return main;
}
// Panel de administración (Fase 4c). Todo texto del servidor va con textContent (helper `el`). Sin innerHTML.
const ADMIN_STATUS_LABELS = { received: 'Recibida', contacted: 'Contactada', approved: 'Aprobada · esperando alta de Ollin', converted: 'Convertida', closed: 'Cerrada', spam: 'Spam' };
const ADMIN_KIND_LABELS = { artista: 'Artista', foro: 'Foro' };
const ADMIN_ROLE_LABELS = { owner: 'Propietario', editor: 'Editor', admin: 'Administrador', reviewer: 'Revisor' };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const asApiError = (error) => (error instanceof ApiError ? error : new ApiError('generic'));
const formatAdminDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value ?? '') : date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }); };

function renderAdmin() {
  const state = el('div', { id: 'admin-state', className: 'admin-state', attrs: { 'aria-live': 'polite' } });
  pageFrame({ eyebrow: 'Equipo Cuicoyan', title: 'Panel de administración.', description: 'Solicitudes e invitaciones. Las acciones sensibles requieren verificación con passkey.', children: [section('', [state])] });
  void loadAdmin(state);
}

async function loadAdmin(state) {
  state.replaceChildren(el('p', { className: 'muted', text: 'Verificando acceso…' }));
  let status;
  try { status = await adminStatus(); } catch (error) { state.replaceChildren(authErrorPanel(asApiError(error), () => loadAdmin(state))); return; }
  if (!status.admin) { state.replaceChildren(el('p', { className: 'notice', text: 'Esta cuenta no tiene acceso de administración.', attrs: { role: 'alert' } })); return; }
  if (status.credentials === 0) { state.replaceChildren(adminGate(state, 'Aún no hay ninguna passkey de administración para esta cuenta.', 'Registrar passkey de administración', () => registerPasskey())); return; }
  if (!status.verified) { state.replaceChildren(adminGate(state, 'Confirma tu identidad con tu passkey de administración para continuar.', 'Verificar con passkey', () => stepUp())); return; }
  state.replaceChildren(adminPanel());
}

function adminGate(state, text, label, action) {
  const feedback = el('div', { attrs: { 'aria-live': 'polite' } });
  const button = el('button', { className: 'button', type: 'button', text: label });
  button.addEventListener('click', async () => {
    button.disabled = true;
    feedback.replaceChildren();
    try { await action(); await loadAdmin(state); } catch (error) { button.disabled = false; feedback.replaceChildren(authErrorPanel(asApiError(error))); }
  });
  return el('div', { className: 'detail-panel' }, [el('p', { text }), button, feedback]);
}

function adminPanel() {
  const filter = el('select', { id: 'admin-filter', attrs: { 'aria-label': 'Filtrar solicitudes por estado' } }, [el('option', { value: '', text: 'Todos los estados' }), ...Object.entries(ADMIN_STATUS_LABELS).map(([value, text]) => el('option', { value, text }))]);
  const box = el('div', { attrs: { 'aria-live': 'polite' } });
  const loadRequests = async () => {
    box.replaceChildren(el('p', { className: 'muted', text: 'Cargando solicitudes…' }));
    try {
      const rows = await listContactRequests({ status: filter.value || undefined, limit: 50 });
      if (!rows.length) { box.replaceChildren(el('p', { className: 'muted', text: 'No hay solicitudes con este filtro.' })); return; }
      box.replaceChildren(el('div', { className: 'admin-table-wrap' }, [el('table', { className: 'admin-table' }, [
        el('thead', {}, [el('tr', {}, ['Nombre', 'Correo', 'Tipo', 'Estado', 'Fecha', 'Mensaje', 'Cambiar estado'].map((text) => el('th', { attrs: { scope: 'col' }, text })))]),
        el('tbody', {}, rows.map((row) => adminRequestRow(row, { onApproved }))),
      ])]));
    } catch (error) { box.replaceChildren(authErrorPanel(asApiError(error), loadRequests)); }
  };
  filter.addEventListener('change', loadRequests);

  const ollinButton = el('button', { className: 'button secondary', type: 'button', text: 'Copiar lista para Ollin' });
  const ollinBox = el('div', { attrs: { 'aria-live': 'polite' } });
  ollinButton.addEventListener('click', async () => {
    ollinButton.disabled = true;
    ollinBox.replaceChildren();
    try {
      const text = ollinListText(await listContactRequests({ status: 'approved', limit: 100 }));
      if (!text) { ollinBox.replaceChildren(el('p', { className: 'muted', text: 'No hay solicitudes aprobadas pendientes de alta.' })); return; }
      const count = text.split('\n').length;
      const message = `${count} ${count === 1 ? 'alta copiada' : 'altas copiadas'}. Envíalas a Ollin.`;
      try {
        await navigator.clipboard.writeText(text);
        ollinBox.replaceChildren(el('p', { text: message }));
        announce(message);
      } catch {
        const area = el('textarea', { readOnly: true, value: text, attrs: { rows: String(Math.min(count + 1, 12)), 'aria-label': 'Lista de altas para Ollin' } });
        ollinBox.replaceChildren(el('p', { className: 'notice', text: 'No se pudo copiar automáticamente. Copia el texto manualmente.' }), area);
        area.select();
      }
    } catch (error) { ollinBox.replaceChildren(authErrorPanel(asApiError(error), loadRequests)); }
    finally { ollinButton.disabled = false; }
  });

  const kind = el('select', { id: 'inv-kind' }, [el('option', { value: 'member', text: 'Miembro de un perfil' }), el('option', { value: 'platform', text: 'Plataforma (administración)' })]);
  const profile = el('input', { id: 'inv-profile', type: 'text', autocomplete: 'off', attrs: { placeholder: '00000000-0000-0000-0000-000000000000', spellcheck: 'false' } });
  const profileField = el('div', { className: 'pe-field' }, [el('label', { htmlFor: 'inv-profile', text: 'Perfil (UUID)' }), profile]);
  kind.addEventListener('change', () => { profileField.hidden = kind.value !== 'member'; });
  const role = el('select', { id: 'inv-role' }, Object.entries(ADMIN_ROLE_LABELS).map(([value, text]) => el('option', { value, text })));
  const email = el('input', { id: 'inv-email', type: 'email', autocomplete: 'off', attrs: { required: '' } });
  const result = el('div', { attrs: { 'aria-live': 'polite' } });
  const submit = el('button', { className: 'button', type: 'submit', text: 'Crear invitación' });
  const form = el('form', { className: 'admin-invite-form' }, [
    el('div', { className: 'pe-field' }, [el('label', { htmlFor: 'inv-kind', text: 'Tipo' }), kind]),
    profileField,
    el('div', { className: 'pe-field' }, [el('label', { htmlFor: 'inv-role', text: 'Rol' }), role]),
    el('div', { className: 'pe-field' }, [el('label', { htmlFor: 'inv-email', text: 'Correo de la persona invitada' }), email]),
    submit,
  ]);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    result.replaceChildren();
    const isMember = kind.value === 'member';
    if (isMember && !UUID_PATTERN.test(profile.value.trim())) { result.replaceChildren(el('p', { className: 'notice', text: 'Escribe un perfil válido (UUID).', attrs: { role: 'alert' } })); return; }
    submit.disabled = true;
    try {
      const data = await createInvitation({ kind: kind.value, profile_id: isMember ? profile.value.trim() : undefined, role: role.value, email: email.value.trim() });
      email.value = '';
      void invitations.load();
      const minutes = Math.max(1, Math.round((Number(data.expires_in) || 0) / 60));
      const copy = el('button', { className: 'button secondary', type: 'button', text: 'Copiar enlace' });
      const link = el('input', { id: 'inv-url', type: 'text', readOnly: true, value: data.url, attrs: { 'aria-label': 'Enlace de invitación' } });
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(link.value); announce('Enlace copiado'); } catch { link.select(); announce('Selecciona el enlace y cópialo manualmente'); }
      });
      result.replaceChildren(el('div', { className: 'detail-panel' }, [el('p', { text: 'Invitación creada.' }), link, copy, el('p', { className: 'notice', text: `Se muestra una sola vez. Caduca en ${minutes} min.` })]));
    } catch (error) {
      const apiError = asApiError(error);
      result.replaceChildren(apiError.kind === 'generic' ? el('p', { className: 'notice', text: 'No se pudo crear la invitación. Revisa los datos e inténtalo de nuevo.', attrs: { role: 'alert' } }) : authErrorPanel(apiError));
    } finally { submit.disabled = false; }
  });
  const approvalBox = el('div', { attrs: { 'aria-live': 'polite' } });
  const onApproved = () => {
    approvalBox.replaceChildren(el('div', { className: 'detail-panel' }, [el('p', { text: 'Aprobada. Envía a Ollin la lista de altas y, cuando confirmen la cuenta, crea la invitación.' })]));
    void loadRequests();
  };
  void loadRequests();
  const accounts = adminAccounts();
  const invitations = adminInvitations();
  return el('div', { className: 'admin-panel' }, [
    el('div', { className: 'detail-panel' }, [el('h2', { text: 'Solicitudes de contacto' }), el('div', { className: 'pe-field' }, [el('label', { htmlFor: 'admin-filter', text: 'Estado' }), filter]), ollinButton, ollinBox, approvalBox, box]),
    el('div', { className: 'detail-panel' }, [el('h2', { text: 'Invitar' }), form, result]),
    accounts.node,
    invitations.node,
  ]);
}

const APPROVABLE_STATUSES = ['received', 'contacted'];
const ADMIN_ERROR_MESSAGES = { cannot_change_self: 'No puedes cambiar tu propia cuenta.', slug_taken: 'Ese identificador ya existe, elige otro.', not_approvable: 'Esta solicitud ya fue atendida.' };
const ACCOUNT_STATUS_LABELS = { active: 'Activa', suspended: 'Suspendida' };
const INVITATION_KIND_LABELS = { member: 'Miembro de un perfil', platform: 'Plataforma' };
const INVITATION_STATE_LABELS = { pendiente: 'Pendiente', aceptada: 'Aceptada', revocada: 'Revocada', vencida: 'Vencida' };
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const adminNotice = (text) => el('p', { className: 'notice', text, attrs: { role: 'alert' } });
// Códigos de error del servidor (lista cerrada) con mensaje fijo; el resto cae al panel genérico.
const adminErrorNode = (error) => (ADMIN_ERROR_MESSAGES[error?.code] ? adminNotice(ADMIN_ERROR_MESSAGES[error.code]) : authErrorPanel(asApiError(error)));
const slugFromName = (value) => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
const adminTable = (headers, rows) => el('div', { className: 'admin-table-wrap' }, [el('table', { className: 'admin-table' }, [
  el('thead', {}, [el('tr', {}, headers.map((text) => el('th', { attrs: { scope: 'col' }, text })))]),
  el('tbody', {}, rows),
])]);

const EDITABLE_STATUSES = ['received', 'contacted', 'closed', 'spam'];
const inviteErrorNode = (error) => (error?.code === 'not_approved' ? adminNotice('Esta solicitud ya no está pendiente de invitación.') : adminErrorNode(error));

function adminRequestRow(row, { onApproved }) {
  const statusCell = el('td', { text: ADMIN_STATUS_LABELS[row.status] || row.status || '' });
  const approveButton = el('button', { className: 'button secondary', type: 'button', text: 'Aprobar' });
  const approveBox = el('div', { className: 'admin-approve', hidden: true }, [approveFormFor(row, { onApproved })]);
  const inviteButton = el('button', { className: 'button', type: 'button', text: 'Crear invitación' });
  const inviteBox = el('div', { className: 'admin-approve', attrs: { 'aria-live': 'polite' }, hidden: true });
  const syncApprove = () => {
    approveButton.hidden = !APPROVABLE_STATUSES.includes(row.status);
    approveBox.hidden = approveButton.hidden || approveBox.hidden;
    inviteButton.hidden = row.status !== 'approved';
    inviteBox.hidden = inviteButton.hidden || inviteBox.hidden;
  };
  approveButton.addEventListener('click', () => { approveBox.hidden = !approveBox.hidden; });
  const showInvite = (data) => {
    const days = Math.max(1, Math.round((Number(data.expires_in) || 0) / 86400));
    const link = el('input', { type: 'text', readOnly: true, value: data.url, attrs: { 'aria-label': 'Enlace de invitación' } });
    const copy = el('button', { className: 'button secondary', type: 'button', text: 'Copiar enlace' });
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(link.value); announce('Enlace copiado'); } catch { link.select(); announce('Selecciona el enlace y cópialo manualmente'); }
    });
    inviteBox.hidden = false;
    inviteBox.replaceChildren(el('p', { text: 'Invitación creada. Enlace:' }), link, copy, el('p', { className: 'notice', text: `Se muestra una sola vez. Caduca en ${days} días. Envíala tú al correo del solicitante.` }));
  };
  inviteButton.addEventListener('click', async () => {
    if (!window.confirm('¿Ollin ya confirmó la cuenta y el rol de esta persona?')) return;
    inviteButton.disabled = true;
    inviteBox.replaceChildren();
    try {
      const data = await inviteApprovedRequest(row.id);
      row.status = 'converted';
      statusCell.textContent = ADMIN_STATUS_LABELS.converted;
      select.disabled = true;
      syncApprove();
      showInvite(data);
    } catch (error) { inviteBox.hidden = false; inviteBox.replaceChildren(inviteErrorNode(error)); } finally { inviteButton.disabled = false; }
  });
  // El select solo ofrece estados que se pueden poner a mano; si la fila está en otro (approved/converted), se muestra como opción deshabilitada.
  const statusOptions = EDITABLE_STATUSES.map((value) => el('option', { value, text: ADMIN_STATUS_LABELS[value] }));
  if (!EDITABLE_STATUSES.includes(row.status)) { const current = el('option', { value: row.status, text: ADMIN_STATUS_LABELS[row.status] || row.status }); current.disabled = true; statusOptions.unshift(current); }
  const select = el('select', { attrs: { 'aria-label': `Cambiar estado de la solicitud de ${row.requester_name || row.email || ''}` } }, statusOptions);
  select.value = row.status;
  select.addEventListener('change', async () => {
    const previous = row.status;
    select.disabled = true;
    try {
      const updated = await setContactStatus(row.id, select.value);
      row.status = updated.status;
      statusCell.textContent = ADMIN_STATUS_LABELS[updated.status] || updated.status;
      syncApprove();
      announce('Estado actualizado');
    } catch (error) { select.value = previous; announce(asApiError(error).message); } finally { select.disabled = false; }
  });
  syncApprove();
  return el('tr', {}, [
    el('td', { text: row.requester_name || '' }), el('td', { text: row.email || '' }), el('td', { text: ADMIN_KIND_LABELS[row.requested_kind] || row.requested_kind || '' }),
    statusCell, el('td', { text: formatAdminDate(row.created_at) }), el('td', { className: 'admin-msg', text: row.message || '' }),
    el('td', {}, [select, approveButton, inviteButton, approveBox, inviteBox]),
  ]);
}

// Mini formulario de aprobación: el slug propuesto sale del nombre y es editable. La URL se devuelve una sola vez.
function approveFormFor(row, { onApproved }) {
  const slug = el('input', { id: `ap-slug-${row.id}`, type: 'text', value: slugFromName(row.requester_name), autocomplete: 'off', spellcheck: false, attrs: { maxlength: '120' } });
  const name = el('input', { id: `ap-name-${row.id}`, type: 'text', value: row.requester_name || '', autocomplete: 'off', attrs: { maxlength: '160' } });
  const feedback = el('div', { attrs: { 'aria-live': 'polite' } });
  const submit = el('button', { className: 'button', type: 'submit', text: 'Crear enlace de invitación' });
  const form = el('form', { className: 'admin-invite-form' }, [
    el('div', { className: 'pe-field' }, [el('label', { htmlFor: slug.id, text: 'Identificador del perfil' }), slug]),
    el('div', { className: 'pe-field' }, [el('label', { htmlFor: name.id, text: 'Nombre del perfil' }), name]),
    submit, feedback,
  ]);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.replaceChildren();
    const slugValue = slug.value.trim();
    const nameValue = name.value.trim();
    if (slugValue.length < 2 || slugValue.length > 120 || !SLUG_PATTERN.test(slugValue)) { feedback.replaceChildren(adminNotice('Escribe un identificador válido: minúsculas, números y guiones.')); return; }
    if (!nameValue || nameValue.length > 160) { feedback.replaceChildren(adminNotice('Escribe un nombre de 1 a 160 caracteres.')); return; }
    submit.disabled = true;
    try {
      const data = await approveContactRequest(row.id, { slug: slugValue, display_name: nameValue });
      onApproved(data);
    } catch (error) { feedback.replaceChildren(adminErrorNode(error)); } finally { submit.disabled = false; }
  });
  return form;
}

function adminAccounts() {
  const feedback = el('div', { attrs: { 'aria-live': 'polite' } });
  const box = el('div', { attrs: { 'aria-live': 'polite' } });
  const load = async () => {
    feedback.replaceChildren();
    box.replaceChildren(el('p', { className: 'muted', text: 'Cargando cuentas…' }));
    try {
      const rows = await listAccounts({ limit: 50 });
      if (!rows.length) { box.replaceChildren(el('p', { className: 'muted', text: 'No hay cuentas.' })); return; }
      box.replaceChildren(adminTable(['Nombre', 'Correo', 'Estado', 'Rol de plataforma', 'Último acceso', 'Acción'], rows.map((row) => accountRow(row, { onChange: load, feedback }))));
    } catch (error) { box.replaceChildren(authErrorPanel(asApiError(error), load)); }
  };
  void load();
  return { node: el('div', { className: 'detail-panel' }, [el('h2', { text: 'Cuentas' }), feedback, box]), load };
}

function accountRow(row, { onChange, feedback }) {
  const suspended = row.status === 'suspended';
  const button = el('button', { className: 'button secondary', type: 'button', text: suspended ? 'Reactivar' : 'Suspender' });
  button.addEventListener('click', async () => {
    if (!suspended && !window.confirm('¿Suspender esta cuenta? Se cerrarán sus sesiones.')) return;
    button.disabled = true;
    feedback.replaceChildren();
    try {
      await setAccountStatus(row.profile_id, suspended ? 'active' : 'suspended');
      announce('Estado de la cuenta actualizado');
      await onChange();
    } catch (error) { button.disabled = false; feedback.replaceChildren(adminErrorNode(error)); }
  });
  return el('tr', {}, [
    el('td', { text: row.display_name || '' }), el('td', { text: row.invited_email || '' }),
    el('td', { text: ACCOUNT_STATUS_LABELS[row.status] || row.status || '' }),
    el('td', { text: ADMIN_ROLE_LABELS[row.platform_role] || row.platform_role || '—' }),
    el('td', { text: row.last_seen_at ? formatAdminDate(row.last_seen_at) : '—' }),
    el('td', {}, [button]),
  ]);
}

function invitationStateOf(row) {
  if (row.consumed_at) return 'aceptada';
  if (row.revoked_at) return 'revocada';
  if (new Date(row.expires_at).getTime() <= Date.now()) return 'vencida';
  return 'pendiente';
}

function adminInvitations() {
  const feedback = el('div', { attrs: { 'aria-live': 'polite' } });
  const box = el('div', { attrs: { 'aria-live': 'polite' } });
  const load = async () => {
    feedback.replaceChildren();
    box.replaceChildren(el('p', { className: 'muted', text: 'Cargando invitaciones…' }));
    try {
      const rows = await listInvitations({ limit: 50 });
      if (!rows.length) { box.replaceChildren(el('p', { className: 'muted', text: 'No hay invitaciones.' })); return; }
      box.replaceChildren(adminTable(['Correo', 'Tipo', 'Rol', 'Estado', 'Caduca', 'Acción'], rows.map((row) => invitationRow(row, { onChange: load, feedback }))));
    } catch (error) { box.replaceChildren(authErrorPanel(asApiError(error), load)); }
  };
  void load();
  return { node: el('div', { className: 'detail-panel' }, [el('h2', { text: 'Invitaciones' }), feedback, box]), load };
}

function invitationRow(row, { onChange, feedback }) {
  const state = invitationStateOf(row);
  const revoke = state === 'pendiente' ? el('button', { className: 'button secondary', type: 'button', text: 'Revocar' }) : null;
  if (revoke) {
    revoke.addEventListener('click', async () => {
      revoke.disabled = true;
      feedback.replaceChildren();
      try { await revokeInvitation(row.id); announce('Invitación revocada'); await onChange(); }
      catch (error) { revoke.disabled = false; feedback.replaceChildren(adminErrorNode(error)); }
    });
  }
  return el('tr', {}, [
    el('td', { text: row.invited_email || '' }), el('td', { text: INVITATION_KIND_LABELS[row.kind] || row.kind || '' }),
    el('td', { text: ADMIN_ROLE_LABELS[row.role] || row.role || '' }), el('td', { text: INVITATION_STATE_LABELS[state] }),
    el('td', { text: formatAdminDate(row.expires_at) }), el('td', {}, [revoke]),
  ]);
}

function renderProfile() {
  const statusLabels = { draft: 'Borrador', pending_review: 'En revisión', published: 'Publicado', rejected: 'Rechazado', suspended: 'Suspendido' };
  const mount = (main) => { ($('#contenido') || $('#app')).replaceWith(main); };
  mount(el('main', { id: 'contenido', className: 'app-page' }, [el('div', { className: 'app-wrap' }, [el('p', { className: 'muted', text: 'Cargando tu perfil…' })])]));
  void apiRequest('/api/cuicoyan/me/profile').then((body) => {
    const profile = body?.data?.profiles?.[0];
    if (!profile) throw new Error('Sin perfil');
    // Primer paso: la persona elige artista o foro. La elección viaja en ?tipo= para sobrevivir a recargas.
    const tipo = new URLSearchParams(window.location.search).get('tipo');
    if (tipo !== 'artista' && tipo !== 'foro') {
      mount(renderKindPicker({ onPick: (kind) => { history.replaceState(null, '', `${routes.perfil}?tipo=${kind}`); renderProfile(); } }));
      return;
    }
    const switchLink = el('a', { href: routes.perfil, text: 'Cambiar tipo de perfil' });
    if (tipo === 'foro') {
      // ponytail: el guardado remoto del foro aún no existe; por ahora solo borrador local.
      // TODO: conectar guardado remoto de foros (API) y quitar el aviso y los ajustes de abajo.
      const venue = { slug: 'nuevo-foro', name: '', description: '', categories: [], zone: '', address: '' };
      const foroSwitch = el('div', { className: 'profile-kind-switch' }, [switchLink, el('p', { className: 'profile-kind-notice', text: 'El perfil de foro se guarda como borrador en este navegador por ahora.' })]);
      const page = renderVenueEditor({ venue, switcher: foroSwitch });
      page.querySelector('.demo-note')?.remove(); // dice «Sin sesión activa», falso con sesión
      page.querySelector('.pe-head-actions a')?.remove(); // enlace a un perfil público que aún no existe
      mount(page);
      return;
    }
    const artist = { slug: profile.id, name: profile.display_name, bio: (profile.description || '').slice(0, 160), longBio: profile.description || '', website: profile.website_url || '', email: profile.contact_email || '' };
    const canSubmit = profile.status === 'draft' || profile.status === 'rejected';
    mount(renderProfileEditor({
      artist, profileId: profile.id, remote: true, status: statusLabels[profile.status] || profile.status,
      switcher: el('p', { className: 'profile-kind-switch' }, [switchLink]),
      onRemoteSave: (d) => apiRequest('/api/cuicoyan/me/profile', { method: 'PATCH', body: JSON.stringify({ profile_id: profile.id, display_name: d.name, description: d.longBio, website_url: d.website, contact_email: d.email }) }),
      onSubmitReview: canSubmit ? async () => { try { await apiRequest('/api/cuicoyan/me/profile/submit', { method: 'POST', body: JSON.stringify({ profile_id: profile.id }) }); announce('Perfil enviado a revisión'); renderProfile(); } catch (error) { announce(messageFor(error?.kind || 'generic', error?.phase)); } } : null,
      onLogout: async () => { await logout(); window.location.href = routes.home; },
    }));
  }).catch((error) => {
    // Sin sesión o sin API: editores de demostración (artista / foro) de cualquier registro. ponytail: quitar al conectar la base de datos.
    // Sin sesión (401) se ofrece iniciar sesión; los editores de demostración quedan solo como respaldo si la API no responde.
    if (!TEST_EDIT_ACCESS || error?.kind === 'session') {
      const panel = error?.kind ? authErrorPanel(error, renderProfile) : authErrorPanel({ kind: 'session' });
      mount(el('main', { id: 'contenido', className: 'app-page' }, [el('div', { className: 'app-wrap' }, [el('h1', { text: 'Edición no disponible' }), panel, linkButton('Volver al inicio', routes.home)])]));
      return;
    }
    const query = new URLSearchParams(window.location.search);
    const kind = query.get('tipo') === 'foro' ? 'foro' : 'artista';
    const list = kind === 'foro' ? venues : artists;
    const record = list.find((item) => item.slug === query.get('id')) || list.find((item) => item.slug === (kind === 'foro' ? 'foro-alicia' : 'raices-del-viento')) || list[0];
    const go = (type, id) => { window.location.href = `${routes.perfil}?tipo=${type}${id ? `&id=${encodeURIComponent(id)}` : ''}`; };
    const picker = el('select', { id: 'pe-record', onchange: (event) => go(kind, event.target.value) }, list.map((item) => el('option', { value: item.slug, text: item.name })));
    picker.value = record.slug;
    const switcher = el('div', { className: 'pe-switch-row' }, [
      el('nav', { className: 'pe-switch', attrs: { 'aria-label': 'Tipo de perfil de prueba' } }, [['artista', 'Artista'], ['foro', 'Foro cultural']].map(([value, label]) => el('a', { href: `${routes.perfil}?tipo=${value}`, text: label, attrs: value === kind ? { 'aria-current': 'page' } : {} }))),
      el('div', { className: 'pe-field' }, [el('label', { htmlFor: 'pe-record', text: kind === 'foro' ? 'Foro a editar' : 'Artista a editar' }), picker]),
    ]);
    // El editor parte de los datos originales (`_base`), no de los ya editados.
    const original = record._base || record;
    mount(kind === 'foro' ? renderVenueEditor({ venue: original, switcher }) : renderProfileEditor({ artist: original, profileId: record.slug, remote: false, switcher }));
  });
}
function renderCalls() { const calls = getCalls(); return pageFrame({ eyebrow: 'Oportunidades', title: 'Convocatorias culturales.', description: 'Una lista de ejemplo preparada para recibir información verificada.', children: [section('', [demoNotice(), el('div', { className: 'grid grid-3' }, calls.map((call) => el('article', { className: 'detail-panel' }, [el('span', { className: 'demo-label', text: 'Demostración' }), el('h3', { text: call.title }), el('p', { className: 'muted', text: call.description }), el('strong', { text: call.status }), el('button', { className: 'button secondary', type: 'button', disabled: true, text: 'Postulación próximamente' })])))]) ] }); }
function renderInfo(kind) { const content = { sobre: ['Sobre Cuicoyan', 'Una plataforma cultural para descubrir, conectar y compartir la vida cultural de CDMX.', 'Cuicoyan reúne eventos, artistas, foros y territorio en una experiencia de exploración clara. Esta entrega es un staging estático: no representa una operación activa ni afirma alianzas, cifras o infraestructura.'], ayuda: ['Centro de ayuda', 'Respuestas breves para recorrer el prototipo.', ''], accesibilidad: ['Accesibilidad', 'El sitio está construido con la accesibilidad como criterio de diseño.', 'Trabajamos para ofrecer navegación por teclado, foco visible, contraste AA, alternativa textual del mapa y respeto a reduced motion. El canal para reportar barreras queda pendiente de configuración.'], privacidad: ['Aviso de privacidad', 'Documento de staging pendiente de validación legal.', 'Esta versión no crea cuentas ni incorpora analítica. Si llenas un formulario de registro, tus datos se envían por correo al equipo de Cuicoyan (mediante el servicio FormSubmit) solo para revisar tu solicitud; no se publican. Tema, intereses y favoritos se guardan localmente en tu navegador y puedes borrarlos desde onboarding. Antes de publicar se requiere responsable, versión y texto legal aprobado.'], terminos: ['Términos y convivencia', 'Texto de staging pendiente de aprobación.', 'El contenido demostrativo no constituye una cartelera, promesa de disponibilidad ni contrato de compra. No hay pagos, reservas, boletos, cuentas ni publicaciones remotas en esta entrega.'] }; const [title, desc, body] = content[kind]; const children = [section('', [kind === 'ayuda' ? el('div', { className: 'faq' }, getHelp().map((item) => el('details', {}, [el('summary', { text: item.question }), el('p', { text: item.answer })]))) : el('div', { className: 'prose' }, [demoNotice(), el('p', { text: body }), kind === 'privacidad' || kind === 'terminos' ? el('p', { className: 'muted', text: 'Versión de staging · sin publicación legal definitiva.' }) : null])])]; return pageFrame({ eyebrow: kind === 'sobre' ? 'El lugar del canto' : 'Información', title, description: desc, children }); }
function renderNotFound() { return pageFrame({ eyebrow: '404', title: 'Esta ruta no está disponible.', description: 'Regresa a Cuicoyan para continuar explorando.', children: [section('', [el('a', { className: 'button', href: routes.home, text: 'Volver al inicio' })]) ] }); }

// Cada pantalla monta su <main> sobre #app. Al repintar (p. ej. cuando llegan datos remotos) se parte de una
// página limpia: sin esto #app ya no existe, el contenido no se reemplaza y la cabecera se duplica.
function resetPage() {
  document.body.querySelectorAll(':scope > .skip-link, :scope > .site-header, :scope > .app-dock, :scope > .bg-flora, :scope > #site-live, :scope > .site-footer').forEach((node) => node.remove());
  const main = document.querySelector('body > main#contenido');
  if (main) main.replaceWith(Object.assign(document.createElement('div'), { id: 'app' }));
}

function mountApp(main) { ($('#contenido') || $('#app')).replaceWith(main); }

function renderCurrentRoute() {
  const scrollY = window.scrollY;
  resetPage();
  const route = routeForPath();
  renderShell(route);
  switch (route) {
    case 'home': renderHome(); break; case 'explorar': renderExplore(); break; case 'eventos': renderEvents(); break; case 'evento-detalle': renderDetail('event'); break; case 'artistas': renderArtists(); break; case 'artista-detalle': renderDetail('artist'); break; case 'foros': renderVenues(); break; case 'foro-detalle': renderDetail('venue'); break; case 'mapa': renderMap(); break; case 'favoritos': renderFavorites(); break; case 'onboarding': renderOnboarding(); break; case 'creadores': renderCreators(); break; case 'unete': renderJoin(); break; case 'invitacion': renderInvitation(); break; case 'admin': renderAdmin(); break; case 'cuenta': renderAccountPage(mountApp); break; case 'perfil': if (TEST_EDIT_ACCESS) renderProfile(); else comingSoon("Mi perfil", "Mi perfil"); break; case 'convocatorias': renderCalls(); break; case 'sobre': renderInfo('sobre'); break; case 'ayuda': renderInfo('ayuda'); break; case 'accesibilidad': renderInfo('accesibilidad'); break; case 'privacidad': renderInfo('privacidad'); break; case 'terminos': renderInfo('terminos'); break; default: renderNotFound();
  }
  showLoginErrorNotice();
  renderFooter();
  if (scrollY > 0) window.scrollTo(0, scrollY);
}

// Vuelta del login con error (?login=error en cualquier ruta). Sin motivo: el servidor no lo revela.
function showLoginErrorNotice() {
  if (new URLSearchParams(window.location.search).get('login') !== 'error') return;
  const main = document.querySelector('main#contenido');
  if (!main) return;
  main.prepend(el('p', { className: 'notice', attrs: { role: 'alert' } }, [
    'No pudimos iniciar tu sesión. Si aún no tienes acceso, solicítalo en ',
    el('a', { href: routes.unete, text: 'Únete' }),
    ' o pide una invitación al equipo de Cuicoyan.',
  ]));
}

// Al terminar la sincronización de favoritos con la cuenta, se repinta la ruta para que los corazones y /favoritos/ coincidan.
window.addEventListener('cuicoyan:favorites-sync', () => renderCurrentRoute());

let remoteCatalogReady = false;
const remoteArtistsLoad = loadRemoteArtists().then((remoteArtists) => {
  if (!remoteArtists) return;
  artists = remoteArtists;
  renderCurrentRoute();
}).catch(() => {
  // Artist fixtures remain visible when API is unavailable.
});
const remoteVenuesLoad = loadRemoteSpaces().then((remoteSpaces) => {
  if (!remoteSpaces) return;
  venues = remoteSpaces;
  renderCurrentRoute();
}).catch(() => {
  // Venue fixtures remain visible when API is unavailable.
});
const remoteCatalog = Promise.all([remoteArtistsLoad, remoteVenuesLoad]).then(() => { remoteCatalogReady = true; });

renderCurrentRoute();
void loadRemoteEvents().then((remoteEvents) => {
  if (!remoteEvents) return;
  events = remoteEvents;
  renderCurrentRoute();
}).catch(() => {
  // Fixtures remain visible when API is unavailable.
});
