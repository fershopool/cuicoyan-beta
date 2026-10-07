# Auditoría Cuicoyan · Fase 1: inventario del estado actual

> Alcance: solo lectura de código, datos y mockups. **Nada se ejecutó en navegador todavía** (eso es la Fase 2). Lo marcado «hecho» sale de leer código o datos con `archivo:línea`; lo marcado «por confirmar» necesita ejecutarse.
> Fecha: 2026-10-02 · Rama `main` (árbol limpio) · 33 commits · 2 503 archivos versionados, 1 202 de ellos en `dist/`.

## 0. Decisiones de producto confirmadas (por la persona responsable)

| # | Decisión |
|---|---|
| 1 | Audiencia primaria: **público** (descubrir, seguir, guardar). Artistas y foros después. |
| 2 | «Red social» = **seguir + guardar + RSVP** como núcleo. Feed, comunidades/reseñas y mensajes se auditan pero marcados «requiere backend». |
| 3 | Sin fecha: hoja de ruta por fases con esfuerzo S/M/L. |
| 4 | Dependencias externas futuras: solo servicios gestionados tras una capa de servicio. **Mapa propio** (cartografía local, sin terceros). |
| 5 | Sin restricciones legales definidas; se registran como riesgo y decisión abierta (menores, contenido sensible, LFPDPPP). |

## 1. Resumen del estado actual

- **Qué es hoy:** un directorio estático con perfiles editables localmente. JavaScript nativo en módulos ES, sin framework ni dependencias de ejecución (`frontend/package.json` no declara `dependencies`).
- **Tamaño:** 2 142 líneas de JS propio (muchas líneas muy largas), 1 581 de CSS, 6 JSON de 7.9 KB en total, 32 HTML de una línea, 46 MB de cartografía local (`cdmx.pmtiles` 22.9 MB).
- **Datos reales vs. demostrativos:** todo el contenido es demostrativo (`isDemo: true`, `contentStatus: "demo"`), salvo `help.json` (`approved`). No hay cuentas, publicaciones, comentarios, seguidores, mensajes, notificaciones ni RSVP en el código.
- **Lo que sí funciona de verdad (hecho):** favoritos locales, preferencias de tema, búsqueda/filtros sobre JSON, mapa local MapLibre + PMTiles, editores de perfil de artista y foro con borrador local, formulario «Únete» que envía correo vía FormSubmit.
- **Lo que está preparado pero apagado (hecho):** lectura de API `/api/cuicoyan/*` (`content.service.js:126-209`), sesión Supabase y editor remoto (`main.js:183-198`, `auth.service.js`). Sin URL configurada (`site-base.js:2-5` vacío) no se activa.

## 2. Pantallas y rutas

Ruta → módulo: `config/routes.js:18-27` y `main.js:221-228`. Todas las rutas comparten un solo `main.js` y 32 HTML idénticos de una línea (`src/pages/**`), uno por ruta y por slug de las fixtures.

| Ruta | Render | Qué hace hoy | Real / demo | Datos |
|---|---|---|---|---|
| `/` | `main.js:50` | Hero, buscador (→ `/explorar/`), chips de categoría que filtran 4 eventos, bloque de mapa, 4 artistas, 3 foros, CTA creadores | Filtro de categoría, buscador y mapa reales; contenido demo | JSON estático; remoto opcional |
| `/explorar/` | `main.js:90`, `app-pages.js:296` | Búsqueda por `q`, `categoria`, `intencion` sobre eventos+artistas+foros, agrupada por tipo | Real sobre fixtures, con fallos (ver §7) | JSON; estado en URL (`url-state.js`) |
| `/eventos/` | `main.js:114`, `app-pages.js:272` | Filtros texto, fecha, zona, categoría | Parcial: fecha y zona no funcionan con fixtures (ver §7) | JSON; API opcional |
| `/eventos/<slug>/` | `main.js:122`, `app-pages.js:247` | Ficha: hechos, categorías, guardar favorito, «Ver en mapa», artistas relacionados | Favorito real; «Reservar/calendario/compartir» deshabilitado (`app-pages.js:264`) | JSON + caché remota 5 min (`content.service.js:24-47`) |
| `/artistas/` | `app-pages.js:78` | Historias, pestañas «Conocer más»/«Mi tribu», búsqueda, filtro por disciplina | «Mi tribu» = solo favoritos filtrados (`app-pages.js:100`); no hay seguimiento ni feed | JSON + borradores + favoritos |
| `/artistas/<slug>/` | `app-pages.js:200` | Hero (con portada propia si hay borrador), biografía, próximas fechas, botón «Editar perfil» | Perfil demo; sin redes, contacto ni métricas (`app-pages.js:208`) | JSON + `localStorage` |
| `/foros/` | `app-pages.js:287` | Lista con búsqueda y enlace a mapa | Real sobre fixtures | JSON + borradores; API opcional |
| `/foros/<slug>/` | `app-pages.js:234` | Hero, «Sobre el espacio», información (horario, contacto, accesibilidad, servicios), minimapa decorativo, galería, fechas | Información real solo si hay borrador local; si no, «Por confirmar» (`app-pages.js:240`) | JSON + borrador |
| `/mapa/` | `app-pages.js:177`, `map.js` | Mapa MapLibre local, pines, popup, filtro por categoría, lista lateral | Mapa real; **todos los puntos son conceptuales** (`venues.json`, `profile-draft.service.js:27-34`) | PMTiles, GeoJSON, coordenadas aproximadas |
| `/favoritos/` | `app-pages.js:115` | Lista por tipo, banner, sugerencias si está vacío | Real, solo local | `cuicoyan:v1:favorites` |
| `/onboarding/intereses/` | `main.js:140` | Casillas de intereses, «Borrar datos locales» | Guarda `interests`, **nadie los lee** (ver §7) | `cuicoyan:v1:preferences` |
| `/para-creadores/` | `main.js:142` | Explicación y enlaces a `/unete/` | Texto estático | — |
| `/unete/` | `main.js:143`, `join-form.js` | Formulario por rol (artista/foro), validación, honeypot, folio, envío | **Real**: POST a FormSubmit con correo del equipo (`environment.js:40`, `join-form.js:173`) | Red externa |
| `/convocatorias/` | `main.js:217` | 2 tarjetas demo, botón «Postulación próximamente» deshabilitado | Demo | `convocatorias.json` |
| `/sobre-cuicoyan/`, `/ayuda/`, `/accesibilidad/`, `/privacidad/`, `/terminos/` | `main.js:218` | Texto estático; ayuda con FAQ de `help.json` | Textos de «staging pendientes de validación legal» | `help.json` |
| `/invitacion/` | `main.js:151` | Valida `invitation_id`, pide contraseña, acepta invitación | Requiere Supabase + API; **inerte sin configuración** | `sessionStorage`, API |
| `/perfil/` | `main.js:183` | Con sesión: editor remoto del perfil. Sin sesión y con `TEST_EDIT_ACCESS`: editores de prueba de cualquier registro | Editor demo + borrador local | API / `localStorage` |
| 404 | `main.js:219` | «Esta ruta no está disponible» | Real | — |

Elementos transversales: cabecera, menú móvil, dock inferior de 4 accesos y pie en `components/shell.js:24-95`; selector de tema claro/oscuro/sistema (`shell.js:68-76`); anuncio a lectores de pantalla (`utils/dom.js:22`).

## 3. Módulos

| Módulo | Líneas | Responsabilidad | Observación |
|---|---|---|---|
| `main.js` | 244 | Arranque, estado global de eventos/foros, render de rutas | Concentra 14 pantallas y la lógica de filtros (`main.js:95-112`) |
| `components/app-pages.js` | 305 | Pantallas de app: artistas, favoritos, mapa, fichas, eventos, explorar | Mezcla vista, filtros y reglas de imágenes por slug (`app-pages.js:26,119,237,252`) |
| `components/cards.js` | 108 | Tarjetas, botón de favorito, fechas | Mapas slug→imagen codificados (`cards.js:9,19-24,57`) |
| `components/map.js` | 192 | Motor MapLibre, estilo, marcadores, filtro | Importa coordenadas de `profile-draft.service.js:4` |
| `components/shell.js` | 95 | Cabecera, dock, pie, tema | Inserta el pie con «Contenido demostrativo» fijo (`shell.js:92`) |
| `components/profile-kit.js` | 215 | Kit de formulario, hero, validaciones, subida de imagen, armazón de editor | Validadores reutilizables (`:13-17`) |
| `components/profile-editor.js` / `venue-editor.js` | 30 / 145 | Editores de artista y foro | El de foro incluye mini mapa, horarios, galería (hasta 6 fotos) |
| `components/join-form.js` | 190 | Formularios de registro por rol | Definición declarativa de campos; envía a FormSubmit |
| `components/icons.js` | 67 | Iconos SVG y emblema | Usa `innerHTML` con rutas internas fijas (`:56`, `:65`) |
| `services/content.service.js` | 209 | Acceso a JSON, mapeo de API remota, caché | Punto único de lectura de contenido |
| `services/profile-draft.service.js` | 113 | Borradores, catálogos del editor, coordenadas, `withDraft` | Único acceso a `localStorage` de perfiles; también guarda catálogos de UI y coordenadas |
| `services/favorites.service.js` | 8 | Favoritos locales (`{type,id}`, máx. 100) | |
| `services/preferences.service.js` | 5 | Tema e intereses | |
| `services/search.service.js` | 11 | Búsqueda por texto, categoría, intención | |
| `services/auth.service.js` | 83 | Sesión Supabase (refresh, `setPassword`) y `apiRequest` | Activo solo con URL y clave configuradas |
| `services/external-channel.service.js` | 3 | URLs externas de contacto/alta | **Código muerto**: ningún módulo lo importa (grep verificado) |
| `config/*` | 27–44 | Rutas, entorno, base del sitio, estado de contenido, banderas de prueba | `site-base.js` lo sobrescribe la build (`prepare-dist.mjs:19`) |
| `utils/*` | 25/3/10 | `el()`, normalización, estado en URL | |
| `scripts/*.mjs` | 4 | `prepare-dist`, `dev-server`, `check-links`, `check-forbidden-content` | Sin pruebas ni lint |

## 4. Datos y almacenamiento

### JSON estático (`frontend/src/data/`)

| Archivo | Registros | Campos clave | Hechos verificados |
|---|---|---|---|
| `events.json` | 4 | `id, slug, title, dateLabel, venueId, categorySlugs, intentions, audience, priceLabel` | `dateLabel` es texto sin año; **no hay `startsAt`, `venueZone`, `artistIds`**. Un evento trae `venueName` distinto al nombre de su foro (`event-demo-cuentos` → «Teatro Esperanza Iris» vs «Espacio cultural por confirmar») |
| `artists.json` | 5 | `id, slug, name, discipline, tagline, bio, nextEventId, categorySlugs, tone` | Relación con eventos solo por `nextEventId` (1:1); `marea-roja` no tiene (`""`). `longBio` solo en 1 de 5 |
| `venues.json` | 5 | `id, slug, name, zone, description, categories (etiquetas), mapPoint{x,y,isConceptual}, address` | `categories` son etiquetas de texto; «Escena» y «Artes visuales» no existen en `categories.json`, así que `slugsOf` las descarta (`profile-draft.service.js:36`). Sin coordenadas reales; `plaza-de-la-conchita` y `espacio-demo` no tienen `address` |
| `categories.json` | 9 (con `todos`) | `slug, label, color, icon` | El campo `icon` es un carácter, pero la UI usa `icons.js` por slug |
| `convocatorias.json` | 2 | `title, description, status` | Ambas demo |
| `help.json` | 5 | `question, answer` | Dice «no cargan mapas externos» (coherente con mapa propio) |

### Almacenamiento del navegador

| Clave | Contenido | Servicio |
|---|---|---|
| `cuicoyan:v1:favorites` | `[{type,id}]`, máx. 100 | `favorites.service.js:1-8` |
| `cuicoyan:v1:preferences` | `{theme, interests}` | `preferences.service.js:2-5` |
| `cuicoyan:profile-draft:<artista\|foro>:<slug>` | Borrador completo, **imágenes como data-URL JPEG** | `profile-draft.service.js:6-93` |
| `sessionStorage cuicoyan:auth-session` | `access_token`, `refresh_token`, `expires_at` | `auth.service.js:3-24` |

`clearPreferences()` borra preferencias y favoritos pero **no** los borradores de perfil (`preferences.service.js:5`). El aviso de privacidad (`main.js:218`) menciona tema, intereses y favoritos, **no** los borradores, que pueden contener correo, teléfono y fotos.

### API opcional (solo si hay URL configurada y válida)

| Endpoint | Uso | Ref. |
|---|---|---|
| `GET /api/cuicoyan/events` (filtros `from,to,zone,category,q,limit`) | Sustituye eventos y vuelve a pintar | `content.service.js:126-160`, `main.js:231` |
| `GET /api/cuicoyan/events/<slug>` | Detalle remoto | `content.service.js:162-180` |
| `GET /api/cuicoyan/spaces` | Sustituye foros | `content.service.js:200-209`, `main.js:238` |
| `GET/PATCH /api/cuicoyan/me/profile`, `POST …/profile/submit`, `POST …/me/invitations/accept` | Perfil propio e invitaciones | `main.js:173,187,194,195` |
| Supabase Auth `/auth/v1/token`, `/auth/v1/user` | Refresh y contraseña | `auth.service.js:40,64` |

Servicios externos activos hoy: **FormSubmit** (`environment.js:40`). Todo lo demás está desactivado por configuración vacía.

## 5. Estilos

`styles/variables.css` (tokens claro/oscuro/sistema), `reset.css`, `global.css`, `app.css` (sitio de escritorio), `mockup.css` (capa «app» ≤ 900 px, se carga después), `profile-editor.css`. Se inyectan desde JS (`main.js:21-32`), no desde el HTML. Tema oscuro por `[data-theme]` más `prefers-color-scheme` para `system` (`variables.css:60`); `prefers-reduced-motion` global (`global.css:148`); puntos de quiebre 420/620/900/1180 px.

## 6. Diseñado (mockups) vs. implementado

Revisé 4 de 13 PNG con detalle (`Light/Perfil_ForoCultural`, `Perfil_Artista`, `Evento`, `Artistas`). Los demás (`Favoritos`, `MapaCultural`, `Inicio_*`, y `Dark/*`) se comparan en la Fase 2. **Dark solo cubre 4 pantallas**: Artistas e Inicio ×3.

| Mockup | Lo que muestra | Estado en código |
|---|---|---|
| `Perfil_Artista` | Hero con ave, biografía, próximas fechas, **sección «Publicaciones»** (video/foto) | Hero, biografía y fechas implementados. **Publicaciones: no existe.** El editor tiene un interruptor `sections.posts` (`profile-draft.service.js:62`, `profile-editor.js:25`) que no controla nada |
| `Evento` (en realidad una **publicación**) | Autor, «hace 2 h», imagen, texto, **me gusta (238), comentarios (17), compartir, guardar**, 2 comentarios con me gusta, evento enlazado, «Más publicaciones» | **No implementado.** La ficha de evento actual es otra cosa (`app-pages.js:247`) |
| `Artistas` (2 teléfonos) | Izq.: lista con favorito. Der.: **«Mi tribu» como feed** de publicaciones con ♥, comentarios, compartir y **botón «+»** | Izq.: implementado. Der.: «Mi tribu» solo filtra favoritos (`app-pages.js:100`); sin feed ni «+» |
| `Perfil_ForoCultural` | Hero, «Sobre el espacio», información con minimapa, próximas fechas, **«Publicaciones»** | Todo salvo Publicaciones. El minimapa de la ficha es decorativo (pin sobre fondo, `app-pages.js:241`), no un mapa real |
| Cabecera de los mockups | Campana de notificaciones y avatar de usuario (con contador); barra de estado «CARAVANA» | Sin campana ni avatar (`shell.js:34-45`). «CARAVANA» es la barra del sistema del mockup, no producto |
| Mapa de los mockups | Rotulado «mapbox» en el minimapa | La implementación usa mapa propio (MapLibre + PMTiles local), acorde con la decisión 4 |

Conclusión del cruce: **los mockups ya incluyen la capa social (feed, ♥, comentarios, compartir, guardar, notificaciones, perfil de usuario) que el código no tiene.** La Fase 3 parte de ahí.

## 7. Defectos de comportamiento detectados al leer (por confirmar en Fase 2)

Los ubico aquí porque definen qué es «real» hoy; la Fase 2 los clasifica por severidad.

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | El filtro **fecha** no hace nada con las fixtures: solo actúa si `event.startsAt` existe y ninguna fixture lo tiene | `main.js:101`, `events.json` (0 coincidencias) |
| 2 | El filtro **zona** vacía los resultados con fixtures: compara `event.venueZone`, que no existe | `main.js:99`, `events.json` (0 coincidencias) |
| 3 | La búsqueda en `/eventos/` busca en `venueName`/`venueZone`, ausentes en fixtures | `main.js:97` |
| 4 | Intenciones **«Cerca de ti»** y **«Este fin de semana»** nunca coinciden: ninguna fixture usa `cerca` ni `fin-de-semana`. Artistas y foros no tienen `intentions`, así que cualquier intención los excluye | `search.service.js:8`, JSON |
| 5 | **Intereses** del onboarding se guardan y nadie los usa | `main.js:140` (única lectura) |
| 6 | El enlace «Ver en mapa» genera `?foro=<slug>` pero el mapa **no lo lee** | `app-pages.js:241,262`; sin lectura en ningún `.js` |
| 7 | El interruptor «Publicaciones» del editor de artista no controla ninguna sección | `profile-draft.service.js:62` |
| 8 | «Borrar datos locales» no elimina los borradores de perfil (pueden incluir correo, teléfono y fotos) y el aviso de privacidad no los menciona | `preferences.service.js:5`, `main.js:218` |
| 9 | `vite.config.js` lista 19 páginas; hay 32 | `vite.config.js:7-26` |
| 10 | `dist/` está versionado (1 202 archivos) y no está en `.gitignore` | `git ls-files dist` |
| 11 | `help.json` afirma que el mapa «no solicita geolocalización», pero el editor de foro tiene «Usar mi ubicación» (acción explícita de quien edita) | `help.json`, `venue-editor.js:63-71` |

## 8. Registro de comentarios `ponytail:`

Búsqueda en `frontend/src`, `scripts`, `tests`, `docs`, `.github` y `*.md`: **5 comentarios en 5 archivos**. Los cuatro de acceso de prueba comparten el mismo desbloqueo.

| # | Ubicación | Límite conocido | Qué lo desbloquea |
|---|---|---|---|
| 1 | `config/test-access.js:1-3` | `TEST_EDIT_ACCESS = true` expone «Editar perfil», el enlace «Perfil» y el selector de cualquier registro sin sesión | Base de datos y sesión real; poner `false` o quitar |
| 2 | `components/shell.js:11` | Enlace «Perfil» del menú depende de esa bandera | Igual que #1 |
| 3 | `components/app-pages.js:211` | Botón «Editar perfil» en fichas de artista y foro, depende de esa bandera | Igual que #1 |
| 4 | `main.js:199` | Editores de demostración de **cualquier** registro cuando falla la API o no hay sesión | Conectar la base de datos (quitar la rama de respaldo) |
| 5 | `services/profile-draft.service.js:2-3` | Borradores en `localStorage` (clave `cuicoyan:profile-draft:<tipo>:<slug>`) | API: reemplazar solo `getDraft/saveDraft/removeDraft/listDrafts`. **Nota:** `listDrafts` ya es el único punto de lectura, pero `withDraft` sigue llamando de forma síncrona (`content.service.js:13-14`); una API asíncrona obligará a cambiar ese contrato |

## 9. Calidad y herramientas (estado)

- `package.json`: scripts `dev`, `build`, `preview`, `check:links`, `check:content`. **No hay `test`, `lint` ni formato.** `tests/` está vacío.
- CI (`.github/workflows/validate.yml`): `npm ci`, build, check:links, check:content. Sin pruebas ni accesibilidad automática.
- QA previa (`docs/qa/2026-09-17-inicial.md`): comandos pasaron; **axe, E2E de teclado/móvil y comparación visual quedaron pendientes** y siguen sin hacerse.
- SEO/compartir: `robots.txt` con `Disallow: /` y `noindex,nofollow` en cada HTML, **sin `og:*` ni `canonical`** en los HTML revisados; deliberado mientras el contenido sea demo (`docs/content-pending.md`).
- PWA: hay `site.webmanifest` (iconos 192/512), **no hay service worker** (sin coincidencias de `serviceWorker`); por lo tanto no hay modo sin conexión.
- Compartir/calendario: no hay `navigator.share` ni exportación `.ics`.
- Documentación: `README.md`, `docs/formulario-registro.md`, `docs/content-pending.md`, `docs/reference-inventory.md`; `general.md`, `pantalla.md`, `iteraciones.md` y la carpeta `stitch_cuicoyan_app_landing_page` quedan como referencia.

## 10. Lo que NO verifiqué en esta fase

- Comportamiento en navegador (consola, 375/1440 px, tema oscuro, mapa cargando el PMTiles): Fase 2.
- 9 de 13 mockups en detalle y la carpeta `stitch_*`.
- `app.css`, `mockup.css` y `global.css` más allá de la búsqueda de puntos de quiebre, tema y movimiento.
- Ejecución de `npm run build`, `check:links`, `check:content`.
