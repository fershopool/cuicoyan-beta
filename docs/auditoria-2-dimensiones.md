# Auditoría Cuicoyan · Fase 2: auditoría por dimensiones

> Fecha: 2026-10-02 · Rama `main` · Solo análisis: no se modificó código, datos ni configuración.
> Base: [`auditoria-1-inventario.md`](auditoria-1-inventario.md). Decisiones 1–5 y supuestos (a)–(c) vigentes; nada los contradijo.
> Marcas: **[V]** verificado en navegador o por comando · **[C]** verificado leyendo código/datos · **[S]** suposición, sin verificar.
> Severidad: crítica / alta / media / baja. Esfuerzo: S / M / L. «Req. backend» = no se diseña aquí.

## 1. Verificación ejecutada

| Comprobación | Resultado |
|---|---|
| `npm run build` | OK. «32 rutas HTML». **Efecto colateral [V]:** reescribe `dist/` versionado: modifica 7 archivos y crea 6 que el repo no tiene (`profile-editor.js`, `profile-kit.js`, `venue-editor.js`, `test-access.js`, `profile-draft.service.js`, `profile-editor.css`). Restauré `dist/` con `git checkout`/`git clean`; el árbol quedó limpio |
| `npm run check:links` | OK (1 213 archivos). **No comprueba enlaces** (ver Q2) |
| `npm run check:content` | OK (7 patrones prohibidos ausentes) |
| Navegador, 33 URL (32 páginas + 1 inexistente), 375 y 1440 px | **0 desbordes horizontales**, 0 imágenes rotas (un `<img hidden>` vacío en `/perfil/` es falso positivo). Consola revisada en 12 rutas: 0 errores JS; 2 × «404 recurso» por página; identifiqué `GET /favicon.ico` (el HTML fuente no trae iconos hasta que `shell.js:56-61` los inyecta; el HTML de `dist` sí). El segundo 404 no pude identificarlo |
| Tema claro y oscuro | Revisados home, artistas, ficha de artista, foro, evento, favoritos, mapa, editor de foro. Sin defectos visuales graves. Oscuro por `data-theme` y por sistema |
| Mockups | Vistos 10 de 13: Light/{Favoritos, MapaCultural, Inicio_normal, Inicio_Huapango}, Dark/{Inicio_normal, Artistas} más los 4 de la Fase 1. **No vi** `Light/Inicio_Teatro`, `Dark/Inicio_Huapango` ni `Dark/Inicio_Teatro`; se asumen variantes por categoría de `Inicio_normal` **[S]** |
| Estado de prueba | Usé `http://127.0.0.1:4173` (origen sin datos) para no tocar los borradores existentes en `localhost:4173`. Ya había un servidor de desarrollo en el puerto 4173 (PID 66416) y lo reutilicé. Limpié mi `localStorage` al terminar |

**No verificado:** axe/Lighthouse, lector de pantalla, recorrido completo con teclado, zoom 200–400 %, dispositivos reales, los 3 mockups no vistos, la carpeta `stitch_*`, `docs/qa/*`, consola en las rutas no listadas (legales, convocatorias, invitación). Contraste: la sonda automática solo midió texto sobre fondos sólidos (~56 de ~170 elementos por página); lo que va sobre degradados o imágenes queda sin medir.

## 2. Semáforo por dimensión

| # | Dimensión | | Resumen |
|---|---|---|---|
| 1 | Funcionalidad y flujos | 🔴 | Descubrir → perfil → guardar funciona; **asistir y compartir están deshabilitados**, no hay seguir, y 4 filtros fallan |
| 2 | Capacidades de red social | 🔴 | De 12 capacidades ninguna está completa. Existen en parte: perfiles de artista/foro, búsqueda y guardar (local). El resto: ausente |
| 3 | Contenido y datos | 🔴 | Sin fechas legibles por máquina ni relaciones entre entidades: bloquea filtros, calendario y feed |
| 4 | Arquitectura frontend | 🟡 | Punto único de lectura de contenido bien aislado; HTML por slug, repintado roto con API y 43 peticiones sin empaquetar |
| 5 | UX/UI y mockups | 🟡 | Alta fidelidad en lo que existe; faltan campana, avatar, feed y «+». Sin mockups de escritorio |
| 6 | Accesibilidad | 🟡 | Buena base (salto, landmarks, foco, movimiento reducido); brechas de contraste, tamaño de objetivo y pestañas |
| 7 | SEO y compartir | 🟡 | `noindex` deliberado. Sin Open Graph; contenido solo por JS: no compartirá bien al abrir |
| 8 | Seguridad y privacidad | 🟡 | XSS poco probable (2 `innerHTML` estáticos); riesgo real en privacidad y consentimiento |
| 9 | Calidad y mantenibilidad | 🔴 | Sin pruebas, `dist/` versionado y desfasado, líneas de hasta 2 161 caracteres |

## 3. Defectos de la Fase 1: confirmados o descartados

Todos confirmados. Ninguno descartado.

| # | Defecto | Estado | Evidencia (incluye cómo se comprobó) | Sev. | Esf. |
|---|---|---|---|---|---|
| 1 | Filtro de fecha inerte | **Confirmado [V]** | `/eventos/?date=today`, `weekend`, `month` → 4 de 4 eventos. `main.js:101` exige `startsAt`; ninguna fixture lo tiene | alta | M |
| 2 | Filtro de zona vacía resultados | **Confirmado [V]** | `?zone=Roma+Norte` y `?zone=CDMX` → 0. `main.js:99` compara `venueZone`, inexistente. Las 5 opciones del selector devuelven 0 | alta | S |
| 3 | Búsqueda de eventos ignora el foro | **Confirmado [V]** | `?q=casa del lago` → 0 y `?q=roma` → 0, aunque «Sones del barrio» ocurre en Casa del Lago. `?q=sones` → 1 y `?q=teatro` → 1 (coincide por categoría). `main.js:97` | media | S |
| 4 | Intenciones «Cerca de ti» y «Fin de semana» | **Confirmado [V]** | `/explorar/?intencion=cerca` y `=fin-de-semana` → 0; `libre` y `familia` sí (familia → 3 eventos). Artistas y foros no tienen `intentions`, así que cualquier intención los excluye (`search.service.js:8`; `content.service.js:115` fija `[]`). Chips en `app-pages.js:300` | media | M |
| 5 | Intereses no se usan | **Confirmado [C]** | Única lectura: precarga del propio formulario (`main.js:140`). Ni home ni `/explorar/` los consultan, y tras guardar redirige a `/explorar/` sin efecto | media | M |
| 6 | `?foro=` ignorado por el mapa | **Confirmado [V]** | `/mapa/?foro=plaza-de-la-conchita`, `casa-del-lago-cultural` y `zzz` → siempre «Foro Alicia». Valor por defecto fijo en `map.js:146`; ningún `.js` lee `foro`. «Ver en mapa» (`app-pages.js:241,262`) cae siempre en Alicia | alta | S |
| 7 | Interruptor «Publicaciones» sin efecto | **Confirmado [C]** | `sections.posts` se guarda (`profile-draft.service.js:62`, `profile-editor.js:25`) pero `app-pages.js:208` solo lee `bio` y `dates` | baja | S |
| 8 | «Borrar datos locales» no borra borradores | **Confirmado [V]** | Con un borrador, favoritos y preferencias sembrados: tras pulsar, desaparecen preferencias y favoritos y **la clave `cuicoyan:profile-draft:*` permanece**. `clearPreferences` solo borra 2 claves (`preferences.service.js:5`). El aviso (`main.js:218`) y el README («no se almacenan datos personales») omiten los borradores | alta | S |
| 9 | `vite.config.js` desfasado | **Confirmado [C]** | 19 entradas (`:7-26`) frente a 32 páginas. La build real no lo usa (`prepare-dist.mjs`) | baja | S |
| 10 | `dist/` versionado | **Confirmado [V]** | 1 202 archivos; `.gitignore` solo ignora `.DS_Store`, `node_modules`, `.env*`. **Además está desfasado**: la build produce 7 diferencias y 6 archivos nuevos (los editores). Si el sitio publicado sale de esta copia, no tendría los editores **[S]**: no sé cómo se copia a `cuicoyan-site` | alta | S |
| 11 | `help.json` niega geolocalización | **Confirmado [C]** | `help.json`: «no solicita geolocalización». `venue-editor.js:65-66` usa `navigator.geolocation` (solo tras «Usar mi ubicación»). Hay que reescribir el texto y decidir su política antes de «cerca de mí» | baja | S |
| – | `external-channel.service.js` muerto | **Confirmado [C]** | 0 importadores; solo él usa `externalContactUrl`/`externalJoinUrl` de `environment.js` | baja | S |

## 4. Hallazgos por dimensión

### 4.1 Funcionalidad y flujos 🔴

Flujo evaluado: descubrir → ver perfil → seguir/guardar → asistir → compartir.

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| F1 | alta | M | **Callejón sin salida al asistir.** En la ficha de evento, «Reservar, comprar, añadir al calendario y compartir» están en un panel «Acciones no disponibles aún» con botón «Próximamente» deshabilitado. No hay RSVP, `.ics`, enlace copiable ni `navigator.share` **[V]** | `app-pages.js:264`; lectura de la página `/eventos/sones-del-barrio/` |
| F2 | alta | S | **El evento no enlaza a su foro.** «Lugar: Casa del Lago Cultural · Chapultepec» es texto plano. Enlaces de la ficha: «Regresar», «Ver en mapa», artista relacionado. Nada lleva a `/foros/<slug>/` **[V]** | `app-pages.js:247-270` |
| F3 | media | S | «Ver todas» en «Próximas fechas» de un artista lleva a `/eventos/` sin filtro, no a los eventos de ese artista **[V]** | `app-pages.js:200-210` |
| F4 | media | M | **No existe 404 de la app.** Sin `404.html` en `src/pages/` ni en `dist/`. El servidor local devuelve `<h1>404</h1>` pelado (`/ruta-inexistente/`, `/eventos/zzz/`, `/artistas/zzz/`) **[V]**. `renderNotFound` (`main.js:219`) es inalcanzable: el navegador nunca carga `main.js` en una URL sin HTML. En GitHub Pages saldría la 404 genérica **[S]** | `main.js:219`, `routes.js:18-27` |
| F5 | media | S | Fallos remotos son silenciosos: `.catch(() => {})` deja fixtures sin avisar | `main.js:231-243` |
| F6 | media | M | Eventos de muestra son sábados de **agosto 2026**; hoy es 2026-10-02. «Próximos eventos» lista fechas pasadas sin marcarlas | `events.json` (`dateLabel`) |
| F7 | baja | S | Capitalización inconsistente: «Sáb 8 **De** Ago» en tarjetas y ficha, «sáb 8 **de** ago» en explorar y artistas. Los mockups también escriben «De» | `cards.js:50-57` |
| F8 | — | — | **Fortalezas [V]:** favoritos (guardar/quitar con `aria-pressed` y anuncio «Evento guardado en favoritos»), estados vacíos de Favoritos («Aún no guardas nada» + «Para empezar»), de «Mi tribu» («Tu tribu está por empezar»), de eventos («No encontramos eventos») y de explorar («Limpiar filtros»), estado en URL (`?q=&categoria=&intencion=`) | `favorites.service.js`, `url-state.js` |

Carga: las fixtures se leen sincrónicamente al importar (`main.js:34-36`), por lo que no hay estado de carga de contenido; el único visible es «Cargando cartografía local…» en el mapa **[V]**. Con API habría que añadirlos (ver A2).

### 4.2 Capacidades de red social 🔴

| Capacidad | Hoy | Frontend puede resolver | Requiere backend |
|---|---|---|---|
| Identidad y perfiles | Perfiles públicos de artista y foro + editor local (`profile-editor.js`, `venue-editor.js`). **Sin perfil de usuario ni avatar** (el mockup tiene avatar con contador en la cabecera; `shell.js:34-45` no) | Pantalla «Mi perfil local» (intereses, preferencias, listas) | Cuenta, login, perfil público de usuario |
| Relaciones (seguir/colectivos) | **No hay «seguir».** El ♥ guarda; «Mi tribu» son favoritos filtrados (`app-pages.js:100`) | Lista «Siguiendo» local, interfaz y estados vacíos | Seguidores, contadores, sincronía entre dispositivos |
| Publicaciones y feed | **Inexistente.** Los mockups (Perfil_Artista, Perfil_Foro, Artistas/«Mi tribu», Evento) lo muestran; el interruptor «Publicaciones» no controla nada (def. 7) | Maquetación, tarjeta de publicación, estados vacíos, capa de servicio aislada | Crear, almacenar y servir publicaciones; medios |
| Interacción | Guardar ✓ (local). Reacciones, comentarios ✗. **Compartir ✗** | Compartir (`navigator.share` + copiar enlace) y guardar completos | Reacciones y comentarios con persistencia |
| Mensajería | Ausente | Solo la interfaz | Todo lo demás |
| Notificaciones | Ausente (la campana del mockup no existe) | Centro de avisos **local** (p. ej. «tu evento es mañana» desde la agenda personal) | Push, correo, avisos de terceros |
| Descubrimiento y recomendaciones | Búsqueda, categorías e «intenciones» (2 de 5 rotas); intereses guardados sin uso (def. 5) | Recomendaciones locales por intereses, favoritos y categorías; «cerca de mí» con mapa propio | Recomendación colaborativa |
| Comunidad (grupos, reseñas de foros) | Ausente | Solo interfaz | Todo |
| Asistencia (RSVP, calendario, recordatorios) | Ausente (F1) | «Voy / Me interesa» local, agenda personal, **exportar `.ics`**, vista de mes | Conteo de asistentes, recordatorios push/correo |
| Reputación y verificación | Solo `contentStatus` (`demo`/`approved`) y `isDemo` en los JSON | Insignia «Perfil verificado» como campo del dato | Proceso de verificación |
| Reportes y moderación | Ausente | Formulario «Reportar» vía el canal que se elija (parcial) | Cola de moderación, acciones |
| Privacidad y bloqueo | Solo borrado local, incompleto (def. 8) | Panel «Mis datos locales» (ver, exportar, borrar) | Bloqueo, privacidad por perfil, eliminación en servidor |

### 4.3 Contenido y datos 🔴

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| D1 | alta | M | **Fechas solo como texto** («Sáb 8 de agosto · 6:00 p. m.»), sin año, sin `startsAt/endsAt` ni zona horaria. Imposibilita filtros reales, orden, «pasado», `.ics`, JSON-LD y «este fin de semana» | `events.json`; `main.js:101` |
| D2 | alta | S | **Relaciones pobres.** Artista→evento solo por `nextEventId` (1:1; `marea-roja` = `""`). El evento no trae `artistIds`. El foro no lista sus eventos. Un evento trae `venueName` que contradice a su foro (`event-demo-cuentos`: «Teatro Esperanza Iris» frente a «Espacio cultural por confirmar») | `events.json`, `artists.json`, `venues.json` |
| D3 | media | S | **Taxonomía incoherente.** `venues.categories` son etiquetas de texto; «Escena» y «Artes visuales» no existen en `categories.json` y se descartan en silencio | `venues.json`; `profile-draft.service.js:36` |
| D4 | media | S | **Contenido corto.** `bio` igual a `tagline` en 4 de 5 artistas; `longBio` en 1 de 5; `address` falta en 2 de 5 foros; sin campos de contacto/redes aunque el editor los admite | `artists.json`, `venues.json` |
| D5 | media | M | **Sin campo de imagen.** Las imágenes se resuelven por slug/id en código; un registro nuevo no tendría imagen | `cards.js:9,18-24,26-27` |
| D6 | media | S | **Datos dentro de servicios.** Coordenadas conceptuales por id viven en el servicio de borradores | `profile-draft.service.js:27-34` |
| D7 | media | M | `intentions` solo en eventos; «cerca» y «fin-de-semana» son conceptos **derivados** (ubicación, fecha) que se guardan como etiquetas | `app-pages.js:300`; `search.service.js:8` |
| D8 | baja | S | Los mockups muestran «8 eventos» y «7 perfiles»; hay 4 y 5. `categories.json.icon` es un carácter que la UI no usa | `categories.json` |
| D9 | — | — | **Fortaleza [C]:** `isDemo`, `contentStatus` y `source` en cada registro; contenido siempre marcado como demostrativo | JSON |

### 4.4 Arquitectura frontend 🟡

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| A1 | alta | L | **Un HTML por slug (32 archivos) y sin respaldo SPA.** Cada entidad nueva exige un HTML nuevo. Incompatible con perfiles, publicaciones o eventos creados en tiempo de ejecución. Vía de salida solo en frontend: un `404.html`/`index.html` de respaldo con enrutador cliente, o rutas por parámetro, más generación de HTML estático por slug en la build (también necesaria para SEO, ver E4) | `routes.js:18-27`, `src/pages/**` |
| A2 | alta | M | **Repintado roto con API.** Las pantallas montan con `$('#app').replaceWith(...)`; tras la primera, `#app` ya no existe. `renderCurrentRoute()` se vuelve a llamar al llegar eventos o espacios remotos: `renderShell` vuelve a anteponer cabecera, dock y salto sin limpiar, y `$('#app')` es `null` (TypeError) que el `.catch(() => {})` traga. **Latente**: solo aparece al configurar `/api/cuicoyan` (no reproducible aquí) **[C]** | `main.js:41,86,140,221-244`, `app-pages.js:14`, `shell.js:47-50` |
| A3 | media | M | **Aislamiento del acceso a datos: parcial.** Contenido: un solo punto de lectura (`content.service.js:13-14`) ✓. Borradores: 1 servicio con 4 funciones ✓ pero **síncrono** (`withDraft`, `profile-draft.service.js:99`), con caché de módulo sin evento `storage` (`:78-87`). Favoritos y preferencias llaman a `localStorage` directamente en dos servicios distintos. No existe una interfaz común: cambiar a API toca contratos (sync → async), no solo cuatro funciones | `favorites.service.js`, `preferences.service.js`, `content.service.js:13-14` |
| A4 | media | M | **Borrador confundido con publicado.** `withDraft` aplica el borrador local a tarjetas, mapa y fichas públicas (`content.service.js:13-14`). En una red, «mi borrador» y «lo que ve el público» deben ser cosas distintas | `profile-draft.service.js:99-113` |
| A5 | media | M | **Dos buscadores.** `/eventos/` usa `eventMatchesState` (`main.js:95-112`); `/explorar/` usa `searchItems` (`search.service.js:3-11`). Reglas distintas, defectos distintos | ambos |
| A6 | media | M | **Rendimiento.** Sin empaquetar ni minificar: `/eventos/` = 43 peticiones, 24 módulos JS, 7 CSS, 6 JSON, ~735 KB descomprimidos, e incluye editores, mapa, autenticación y formulario «Únete» que esa pantalla no usa **[V]**. Home: 22 imágenes, porque cada escena/evento descarga variante clara y oscura (`main.js:54`, `cards.js:62`). Caché por `?v=5` manual. A favor: el PMTiles se lee por rangos (HTTP 206, ~150 KB iniciales) y las imágenes ya son WebP ≤ 199 KB **[V]** | `main.js`, `cards.js` |
| A7 | media | M | **Cartografía de 46 MB**: `cdmx.pmtiles` 22.9 MB, 1 024 `.pbf` (glifos de fuentes, **[S]**) y 3 GeoJSON (≈ 0.6 MB). La build la copia entera a `dist/`. Sin precarga ni política de caché propia **[V]** | `src/assets/cartografia/`, `prepare-dist.mjs:10` |
| A8 | media | M | **PWA a medias.** Manifiesto en `public/site.webmanifest`, pero solo la home lo enlaza (1 de 32 HTML); sin service worker, sin modo sin conexión; iconos solo claros | `public/site.webmanifest`, `inicio.html` |
| A9 | media | S | **Archivos muy largos:** `main.js` 244 líneas/30.9 KB (14 pantallas), `app-pages.js` 38 KB. Estado global mutable en módulo (`let events`, `let venues`, `main.js:34-36`) | `main.js` |
| A10 | baja | S | Enrutamiento por cadenas en `routeForPath` (`routes.js:20-27`) y `withBase`; la base `/cuicoyan-site/` la inyecta la build (`prepare-dist.mjs:19`): dev y producción difieren | `routes.js`, `prepare-dist.mjs` |

### 4.5 UX/UI y mockups 🟡

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| U1 | alta | L | **Capa social ausente respecto de los mockups [V]:** campana y avatar, «Publicaciones», feed de «Mi tribu», botón «+», detalle de publicación con ♥, comentarios y compartir, tipo «Publicación» en Favoritos | `shell.js:34-45`, `app-pages.js:100` |
| U2 | media | M | **Mapa vs mockup [V]:** el mockup trae control de ubicación, capas, pines con el emblema y selector «CDMX»; la implementación muestra pines numerados y sin control de ubicación. Tocar una fila navega a la ficha del foro en vez de seleccionar el pin | `map.js:77,173` |
| U3 | media | S | **Imagen incoherente en Favoritos [V]:** todos los eventos usan `fav-evento.webp` (el mockup muestra la foto del propio evento) | `app-pages.js:115-167` |
| U4 | media | M | **Sin mockups de escritorio ni oscuros salvo 4.** Los 13 son móviles; el escritorio (1440 px) es una adaptación de la capa `app.css` sin diseño de referencia. Dark solo cubre Artistas e Inicio ×3 **[V]** | `Mockups/` |
| U5 | baja | S | **Texto de borrador visible al público [V]:** pie «Staging estático» (`shell.js:87`), «Arquitectura por Ollin · enlace pendiente» (`:92`), «Contenido demostrativo…» en todas las páginas | `shell.js:87,92` |
| U6 | baja | S | Selector de tema: ciclo oscuro → claro → sistema con solo sol/luna; «sistema» no tiene indicador. Etiqueta `Tema dark` (valor interno en inglés) | `shell.js:40,74-75` |
| U7 | baja | S | Dos `<h1>` en home (`main.js:55` «CDMX Cuicoyan» + el título) y en `/perfil/` (editor + vista previa) | `main.js:55` |
| U8 | — | — | **Fortalezas [V]:** Favoritos, Artistas, Inicio y Foro guardan alta fidelidad con los mockups, incluida la línea «Tus favoritos se guardan únicamente en este dispositivo». Sin desbordes a 375 ni a 1440 px; tema oscuro sin defectos visibles; el editor de foro con vista previa y barra de guardado fija es sólido | capturas |

Microinteracciones: `prefers-reduced-motion` atenúa animaciones (`global.css:148`); no hay retroalimentación visual al guardar favorito más allá del cambio de icono y el anuncio de lector **[V]**.

### 4.6 Accesibilidad (WCAG 2.2 AA) 🟡

**Base sólida [V/C]:** `lang="es-MX"`; enlace «Saltar al contenido» (`shell.js:47`); landmarks con etiqueta (3 `nav` en el pie, «Navegación principal/móvil/rápida»); un solo `h1` en 31 de 33 URL (2 `h1` en home y en `/perfil/`); **0 imágenes sin `alt`**; foco visible global de 3 px (`global.css:57`); `prefers-reduced-motion` (`global.css:148`); región `aria-live` (`dom.js:22`); etiquetas en todos los campos (único falso positivo: el señuelo `_honey`, ya `aria-hidden`); pin del editor operable con flechas (`venue-editor.js:51-53`).

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| X1 | media | S | **Contraste bajo AA [V]:** «Ver perfil/Ver espacio» 4.42:1 a 14.7 px (home, claro); etiquetas `.ev-tag` 3.37:1 y 4.07:1 a 11.2 px y precio 4.42:1 (favoritos, claro). Sobre degradados: sin medir | `app.css`, `mockup.css` |
| X2 | media | S | **Tamaño de objetivo (2.5.8) [V]:** enlaces del pie de 21 px de alto; casillas del editor de 22×22. No verifiqué la excepción por espaciado. A 1440 px hay de 14 a 28 objetivos < 24 px por página (incluye enlaces del pie y casillas) | `shell.js:88-90` |
| X3 | media | M | **Pestañas sin patrón completo:** `role="tablist"/"tab"` con `aria-selected`, pero 0 `tabpanel`, sin `aria-controls` ni navegación por flechas | `app-pages.js:86,110`, `join-form.js:116-117` |
| X4 | media | S | **Errores de formulario:** tras enviar `/unete/` vacío, el foco queda en `<body>` (solo el error de teléfono mueve el foco). No verifiqué `aria-describedby` en los errores | `join-form.js:143` |
| X5 | baja | S | Menú móvil: sin Escape ni retorno del foco al cerrar | `shell.js:78-79` |
| X6 | baja | S | Interruptor de tema: `aria-pressed="false"` fijo y etiqueta que cambia a «Tema dark» (doble estado) | `shell.js:40,75` |
| X7 | baja | S | Lienzo del mapa con `outline: none` y sin indicador de foco; hay lista alternativa (bien) | `app.css:98` |
| X8 | baja | S | Sin `forced-colors` ni `prefers-contrast` | `styles/` |
| X9 | alta* | M | **Sin comprobación automática ni manual.** axe, teclado/móvil y lector quedaron pendientes desde 2026-09-17 y siguen sin hacerse. *Severidad por riesgo, no por hallazgo | `docs/qa/2026-09-17-inicial.md` |

### 4.7 SEO y compartir 🟡

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| E1 | — | — | `noindex,nofollow` en cada HTML: deliberado mientras el contenido sea demo (`docs/content-pending.md`). **No es defecto; es una puerta de lanzamiento** | `src/pages/**` |
| E2 | media | S | **Sin `og:*`, `twitter:*`, `canonical` ni `theme-color`** en las 33 rutas **[V]**. `/invitacion/` y `/perfil/` además sin `description` | `src/pages/**` |
| E3 | alta* | M | **Contenido solo por JavaScript.** El HTML es `<div id="app">` + módulo; los rastreadores y los previsualizadores de enlaces (WhatsApp, Slack, X) no ejecutan JS, así que ningún OG dinámico funcionaría. Arreglo solo frontend: generar el HTML con metadatos por slug **en la build** (la build ya materializa un HTML por ruta). *Alta al levantar `noindex` | `prepare-dist.mjs` (`materializePages`) |
| E4 | media | M | Sin datos estructurados (Schema.org `Event`, `Place`, `Person`/`PerformingGroup`); depende de D1 | — |
| E5 | baja | S | `public/robots.txt` (`Disallow: /`) se sirve en `/public/robots.txt`; `/robots.txt` da 404 **[V]**. Inocuo mientras exista `noindex`; no hay `sitemap.xml` | `public/robots.txt` |
| E6 | media | M | **Enlaces profundos:** filtros y slugs de detalle sí son direccionables (`/eventos/<slug>/`, `?q=&categoria=`); fallan `?foro=` (def. 6) y cualquier slug nuevo (A1/F4). Sin acción de compartir (F1) | — |

### 4.8 Seguridad y privacidad (solo frontend) 🟡

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| P1 | — | — | **XSS: riesgo bajo hoy [C].** Solo 2 `innerHTML` (SVG y logo, parámetros numéricos y rutas internas). `el()` usa `textContent` y `setAttribute`; sin `eval`/`document.write`. `target="_blank"` siempre con `rel="noopener noreferrer"` | `icons.js:56,65`, `dom.js:4-17`, `app-pages.js:213` |
| P2 | media | S | **Datos remotos o importados tratados como confiables.** `mailto:${d.email}` sin sanear al pintar (el regex del editor admite `?subject=`); `style` armado con cadenas (`--chip-color:var(--${category.color})`); `el()` asigna `node[key] = value` genérico (`dom.js:14`). Hoy el origen es JSON propio; con API o JSON importado (`profile-kit.js:181`) es superficie real | `app-pages.js:219,299`, `dom.js:13-14`, `profile-kit.js:15` |
| P3 | alta | M | **Datos personales a un tercero con aviso provisional.** «Únete» envía nombre, correo, celular (WhatsApp) y redes a **FormSubmit** (EE. UU.) con `_captcha:'false'`. El buzón del equipo está escrito en el código cliente (público) → spam y no rotable. Hay casilla de consentimiento obligatoria (bien) pero el aviso dice «pendiente de validación legal», sin responsable, finalidades, derechos ARCO ni canal. Promete «Puedo pedir que los eliminen» sin canal definido | `environment.js:40`, `join-form.js:122-125,163,173`, `main.js:218` |
| P4 | alta | S | **Borradores con datos personales sin control.** Correo, teléfono y fotos (JPEG en data-URL) quedan en `localStorage`; «Borrar datos locales» no los borra y ni el aviso ni el README los mencionan (def. 8). A favor: la recodificación en canvas descarta los metadatos EXIF (`profile-kit.js:27-31`) y hay mensaje claro de cuota agotada (`:199`) | `preferences.service.js:5`, `main.js:218` |
| P5 | alta | S | **Interruptor de pruebas encendido:** `TEST_EDIT_ACCESS = true` expone «Editar perfil» a cualquier visitante en cada ficha **[V]** | `config/test-access.js:3` |
| P6 | media | S | **Sin CSP.** GitHub Pages no permite cabeceras, pero sí `<meta http-equiv="Content-Security-Policy">`; no hay ninguna | `src/pages/**` |
| P7 | media | S | **Tokens Supabase en `sessionStorage`** (`access_token`, `refresh_token`): estándar en SPA, pero cualquier XSS los roba. Latente | `auth.service.js:3-24` |
| P8 | baja | S | **Enlace a Google Maps** («Abrir en Google Maps» y campo «Enlace de Google Maps»): sin carga de recursos, pero choca con el espíritu de la decisión 4 | `app-pages.js:225`, `venue-editor.js:132` |
| P9 | — | — | **Fortaleza [V]:** en ejecución solo se contacta FormSubmit; sin CDN, fuentes ni analítica externos; tipografías autoalojadas; validación de URL `http(s)` (`profile-kit.js:14,17`) | red |

**Riesgo legal y decisiones abiertas (decisión 5):**
| Tema | Riesgo | Decisión abierta |
|---|---|---|
| LFPDPPP / aviso integral | Aviso provisional; sin responsable ni ARCO | Quién es el responsable; texto y versión aprobados |
| Menores | La audiencia incluye eventos «para todas las edades» y «a partir de 5 años»; una red con contenido de usuarios y mensajes implica menores | Edad mínima, consentimiento parental, restricciones de mensajería |
| Contenido sensible y de terceros | Publicaciones con imágenes de personas, derechos de autor, reportes | Política de contenido, notificación y retiro, quién modera |
| Transferencias | FormSubmit (EE. UU.); futura geolocalización y proveedor de backend | Qué proveedores y con qué contrato |
| Geolocalización | `help.json` la niega (def. 11); «cerca de mí» la requerirá | Cuándo se pide, qué se guarda, retención |

### 4.9 Calidad y mantenibilidad 🔴

| ID | Sev. | Esf. | Hallazgo | Evidencia |
|---|---|---|---|---|
| Q1 | alta | M | **Sin pruebas.** `tests/` existe vacío (git no lo rastrea); `package.json` no tiene `test` ni `lint` (`frontend/package.json:6-12`). CI: build + 2 verificaciones (`validate.yml:31-38`). Sin axe, E2E ni comparación visual | `frontend/package.json` |
| Q2 | media | S | **`check:links` no revisa enlaces:** solo rechaza `href="#"`, `googleusercontent.com` y manejadores en línea. Nada comprueba que una ruta exista | `scripts/check-links.mjs:6` |
| Q3 | alta | S | `dist/` versionado, ignorado de ninguna forma y **desfasado** (def. 10); la build lo borra y reescribe (`prepare-dist.mjs:7-10`) | `.gitignore` |
| Q4 | media | M | **Líneas ilegibles:** `main.js` 25 líneas > 300 caracteres (máx. 2 161), `app-pages.js` 32 (máx. 941), 8 en `shell.js`. Revisión y `git blame` casi imposibles | `main.js:140`, `app-pages.js` |
| Q5 | media | S | Código y configuración muertos: `external-channel.service.js`, `vite.config.js` (19 de 32 páginas, `outDir` distinto) | `vite.config.js:7-26` |
| Q6 | media | S | **Documentación con afirmaciones falsas:** el README dice «no se almacenan datos personales» (hay borradores con correo y teléfono); no hay doc de arquitectura ni de decisiones | `README.md` (Decisiones) |
| Q7 | baja | S | 5 comentarios `ponytail:` (ya listados en la Fase 1 §8): 4 comparten el mismo desbloqueo (la base de datos) | Fase 1 §8 |
| Q8 | baja | S | CI en Node 20; entorno local en Node 24 | `validate.yml` |

## 5. Hallazgos que más pesan (para la Fase 3)

| # | ID | Por qué | Evidencia |
|---|---|---|---|
| 1 | D1 + F6 | Sin fechas ISO no hay filtro, calendario, `.ics`, orden ni «pasado» | `events.json`; `main.js:101` |
| 2 | F1 | RSVP, calendario y compartir (núcleo de la decisión 2) están deshabilitados | `app-pages.js:264` |
| 3 | A1 + F4 + E3 | HTML por slug sin respaldo SPA ni metadatos de compartir: contradice la red social dinámica | `routes.js:18-27` |
| 4 | A2 + A3 + A4 | Capa de datos lista para API solo a medias: repintado roto, contratos síncronos, borrador = público | `main.js:221-244`, `profile-draft.service.js:99` |
| 5 | Def. 1, 2, 4, 6 | Cuatro mecanismos de descubrimiento rotos: el público no puede acotar por fecha, zona o intención ni ir a un foro desde un evento | `main.js:97-101`, `map.js:146` |
| 6 | P3 + P4 + P5 | Privacidad: FormSubmit con aviso provisional, borradores con PII sin borrado, edición abierta | `main.js:218`, `test-access.js:3` |
| 7 | U1 | La capa social de los mockups no existe: feed, ♥, comentarios, campana, avatar, «+» | `shell.js:34-45` |
| 8 | Q1 + Q3 | Sin red de seguridad: sin pruebas y `dist/` desfasado | `tests/`, `dist/` |

## 6. Registro «requiere backend» (no se diseña)

Cuentas reales y sesión; seguidores y contadores; publicaciones, comentarios, reacciones y medios; mensajes; notificaciones push y correo; recordatorios; conteo de asistentes; reseñas de foros y comunidades; reputación y verificación; moderación y bloqueo; recomendación colaborativa; eliminación de datos en servidor; rate limiting y antispam; analítica con consentimiento.

Se resuelve solo en frontend (interfaces, flujos, estados vacíos, capas de servicio): seguir y guardar locales, «Voy» y agenda personal, `.ics`, compartir, panel «Mis datos», filtros y búsqueda reales, recomendaciones locales, «cerca de mí» con mapa propio, centro de avisos local, formulario de reporte, HTML estático por slug y modo sin conexión.

## 7. Preguntas (máximo 5)

1. **Publicación.** ¿Cómo llega `dist/` a `cuicoyan-site`: copia manual o automatizada? Decide si `dist/` sale del repositorio y si la build corre en CI. **Recomendado:** CI con Pages Action y `dist/` en `.gitignore`.
2. **Enrutamiento.** ¿Acepto diseñar la Fase 3 con una **única página de respaldo** (`404.html` + enrutador cliente) más HTML estático por slug generado en la build? **Recomendado:** sí; es lo que permite perfiles y publicaciones nuevos sin un HTML por registro.
3. **Seguir frente a guardar.** El mockup usa ♥ para ambos. ¿Se separan como acciones y datos distintos («Seguir» en artista/foro, ♥ en evento/publicación)? **Recomendado:** separarlos desde el modelo, con una sola interfaz mientras todo sea local.
4. **Editores públicos.** ¿Los editores de perfil se muestran en el lanzamiento público o solo en staging (con `TEST_EDIT_ACCESS = false`)? **Recomendado:** ocultos en público hasta tener sesión; visibles en staging.
5. **Escritorio.** No existen mockups de escritorio. ¿Se deriva de los móviles o se encargan para feed y perfil? **Recomendado:** derivar, y diseñar solo feed y perfil de usuario.
