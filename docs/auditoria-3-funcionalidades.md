# Auditoría Cuicoyan · Fase 3: catálogo de funcionalidades

> Fecha: 2026-10-02 · Rama `main` · Solo análisis: no se modificó código, datos ni configuración. Fuente de los datos: [`auditoria-3-funcionalidades.csv`](auditoria-3-funcionalidades.csv) (mismo contenido, una fila por funcionalidad).
> Base: [`auditoria-1-inventario.md`](auditoria-1-inventario.md) y [`auditoria-2-dimensiones.md`](auditoria-2-dimensiones.md). Los hallazgos de la Fase 2 se citan por ID (F1, D1, A1, def. 1…).
> Decisiones 1–5 y supuestos (a)–(c) vigentes. **81 funcionalidades** en 20 áreas.

## 1. Cómo leer este catálogo

| Campo | Valores |
|---|---|
| **MoSCoW** | Must = sin esto el núcleo (seguir + guardar + RSVP) o su base no funciona · Should = importante, no bloquea · Could = deseable · Won't = fuera de esta hoja de ruta (se registra, no se construye) |
| **Viabilidad sin backend** | **(a)** completa en frontend · **(b)** parcial: se resuelve la interfaz o parte de la lógica y se indica qué parte falta · **(c)** requiere backend: solo se prepara interfaz, estados y capa de servicio |
| **Esfuerzo** (relativo, sin fechas) | **S** = un componente o servicio con sus pruebas · **M** = varias pantallas o un servicio con migración · **L** = cambio transversal que toca muchas pantallas o la build |
| **Fase** | Cuándo se puede entregar la parte de frontend. La integración con servidor de las funciones (b) y (c) llega en la Fase 5 |
| **Estado hoy** | Hecho verificado con `archivo:línea` (rutas relativas a `frontend/src/`); lo marcado «supuesto» no se pudo verificar |

**Supuestos por defecto** (las 5 preguntas de la Fase 2 siguen sin respuesta; se usó la opción recomendada): (1) publicación por CI y `dist/` fuera del repositorio; (2) página de respaldo `404.html` + enrutador cliente + HTML estático por slug generado en la build; (3) «seguir» y «guardar» son acciones y datos distintos, con una sola interfaz mientras todo sea local; (4) editores ocultos en el lanzamiento público y visibles en staging; (5) escritorio derivado de los móviles, con diseño nuevo solo para feed y perfil de usuario. Si alguno cambia, cambian H05, H10, R01, G01 y B01–B04.

**Perfiles:** público, artista, foro, organizador, administrador; «todos» = los cinco. «Organizador» se trata como un rol sobre foro o artista (ver pregunta 3), no como un perfil aparte.

## 2. Resumen

| MoSCoW | (a) completa | (b) parcial | (c) requiere backend | Total |
|---|---|---|---|---|
| Must | 18 | 3 | 0 | 21 |
| Should | 16 | 13 | 9 | 38 |
| Could | 5 | 4 | 10 | 19 |
| Won't | 0 | 0 | 3 | 3 |
| **Total** | 39 | 20 | 22 | 81 |

**Lectura:** 59 de 81 funcionalidades se pueden entregar total o parcialmente sin backend; las 21 «Must» están todas en las Fases 0, 1 y 4 (normas, previas a cualquier función social) y ninguna es (c): el núcleo del público no espera al servidor.

| Fase | Funcionalidades | Esfuerzo | Must |
|---|---|---|---|
| Fase 0 · Cimientos | 9 | 1 S · 6 M · 2 L | 9 |
| Fase 1 · Núcleo público: seguir + guardar + RSVP | 14 | 5 S · 9 M · 0 L | 11 |
| Fase 2 · Descubrimiento y experiencia | 18 | 5 S · 11 M · 2 L | 0 |
| Fase 3 · Artistas, foros y organizadores | 9 | 1 S · 7 M · 1 L | 0 |
| Fase 4 · Capa social (interfaz lista) | 12 | 2 S · 8 M · 2 L | 1 |
| Fase 5 · Con backend | 19 | 0 S · 10 M · 9 L | 0 |

## 3. Hoja de ruta por fases (sin fechas)

### Fase 0 · Cimientos
**Objetivo:** Reparar y preparar: datos con fechas y relaciones, rutas y 404, servicios asíncronos, privacidad, pruebas y publicación.
**Criterio de salida:** Los filtros funcionan con las fixtures; una ruta nueva tiene URL y 404 propia; los datos pasan por repositorios asíncronos; «Borrar datos locales» borra todo; la CI ejecuta pruebas.

| ID | Funcionalidad | Perfil | MoSCoW | Viab. | Esf. | Depende de |
|---|---|---|---|---|---|---|
| H01 | Fechas ISO y zona horaria en eventos | público, organizador | Must | a | M | — |
| H02 | Modelo de relaciones evento–foro–artista | público, artista, foro | Must | a | M | — |
| H03 | Capa de servicios asíncrona y adaptador de almacenamiento | todos | Must | b | L | — |
| H05 | Enrutador con respaldo SPA, 404 propia y HTML por slug en la build | todos | Must | a | L | — |
| H06 | Ciclo de vida de pantallas (montaje idempotente) | todos | Must | a | M | H05 |
| H07 | Buscador único y filtros reparados | público | Must | a | M | H01, H02 |
| H08 | Privacidad: aviso, consentimiento y «Mis datos locales» | todos | Must | a | M | — |
| H09 | Pruebas y verificación automática | administrador | Must | a | M | — |
| H10 | Publicación por CI y banderas por entorno | administrador | Must | a | S | — |

### Fase 1 · Núcleo público: seguir + guardar + RSVP
**Objetivo:** Lo que la decisión 2 define como «red social» para el público, sin cuenta ni backend.
**Criterio de salida:** Una persona puede seguir artistas y foros, guardar, marcar «Voy», ver su agenda, exportarla a `.ics` y compartir un enlace, todo en su dispositivo.

| ID | Funcionalidad | Perfil | MoSCoW | Viab. | Esf. | Depende de |
|---|---|---|---|---|---|---|
| A01 | RSVP: «Voy» y «Me interesa» | público | Must | b | M | H01, H03 |
| A02 | Agenda personal | público | Must | a | M | A01, H01, I01 |
| A03 | Exportar a calendario (.ics) | público | Must | a | S | H01 |
| D03 | Mapa con selección por foro (`?foro=`) y lista sincronizada | público | Must | a | S | H02 |
| I05 | Compartir | todos | Must | a | S | H05, H01 |
| O01 | Onboarding de intereses efectivo | público | Must | a | M | H03 |
| P01 | Perfil público de artista completo | público, artista | Must | a | M | H02, R01 |
| P02 | Perfil público de foro completo | público, foro | Must | a | M | H02, D03, R01 |
| R01 | Seguir artistas y foros (local) | público, artista, foro | Must | a | M | H02, H03 |
| X01 | Cierre de brechas WCAG 2.2 AA | todos | Must | a | M | H09 |
| Z02 | Derechos ARCO | público, artista, foro | Must | b | M | H08 |
| I01 | Guardar con deshacer, orden y marca de pasados | público | Should | a | S | H01, H03 |
| O02 | Primer uso guiado y local-first | público | Should | a | S | H08, O01 |
| P03 | Perfil de usuario local («Mi perfil») | público | Should | a | M | H03, R01, A02 |

### Fase 2 · Descubrimiento y experiencia
**Objetivo:** Filtros avanzados, mapa propio con «cerca de mí», recomendaciones locales, avisos locales, PWA y modo sin conexión, accesibilidad e idiomas.
**Criterio de salida:** Se puede decidir qué hacer hoy cerca de uno, instalar la app y consultar la agenda sin conexión.

| ID | Funcionalidad | Perfil | MoSCoW | Viab. | Esf. | Depende de |
|---|---|---|---|---|---|---|
| D01 | Búsqueda avanzada y filtros combinables | público | Should | a | M | H07, E04 |
| D04 | «Cerca de mí» con mapa propio | público | Should | a | M | D03, H08, O02 |
| D05 | Mapa fiel al mockup: pines con emblema, capas y ubicación | público | Should | a | M | D03 |
| D07 | Recomendaciones locales «Para ti» | público | Should | a | M | O01, R01, A01, D04 |
| D08 | Rieles temáticos de la home | público | Should | a | S | H01, H07 |
| E04 | Campos de evento estructurados (precio, edad, idioma, accesibilidad) | público, organizador | Should | a | S | H02 |
| H11 | Rendimiento de carga | público | Should | a | M | H05 |
| I02 | Listas y colecciones | público | Should | a | M | I01 |
| N01 | Centro de avisos (campana) | público | Should | b | M | A02, R01 |
| N02 | Recordatorios de evento | público | Should | b | M | A03, W02 |
| W01 | App instalable (PWA) | público | Should | a | S | H05 |
| W02 | Service worker y caché | público | Should | a | L | W01, H05, H11 |
| X02 | Preferencias de accesibilidad | público | Should | a | M | X01 |
| D02 | Sugerencias de búsqueda y tolerancia a erratas | público | Could | a | S | H07, H08 |
| D06 | Cómo llegar y rutas | público | Could | b | L | D04, D05 |
| L01 | Capa de internacionalización | público | Could | a | M | — |
| R02 | Seguir temas y zonas | público | Could | a | S | R01, O01, H07 |
| W03 | Mapa sin conexión | público | Could | a | M | W02, D03 |

### Fase 3 · Artistas, foros y organizadores
**Objetivo:** Del editor local a un flujo de revisión, gestión de eventos, convocatorias y panel.
**Criterio de salida:** Un foro o artista puede preparar y enviar perfil y eventos a revisión; las convocatorias admiten postulación por un canal gestionado.

| ID | Funcionalidad | Perfil | MoSCoW | Viab. | Esf. | Depende de |
|---|---|---|---|---|---|---|
| E01 | Crear y editar eventos (foro o artista) | foro, artista, organizador | Should | b | L | H01, H02, H04, P05 |
| E03 | Cambios y cancelaciones visibles | público, organizador | Should | b | M | E01, N01, A01 |
| G01 | Panel de organizador | organizador, foro, artista | Should | b | M | E01, P05, H04 |
| H04 | Borrador separado de lo publicado | artista, foro, organizador | Should | b | M | H03 |
| P05 | Del borrador a la revisión: solicitar publicación | artista, foro, administrador | Should | b | M | H04 |
| V01 | Convocatorias útiles (fecha límite, requisitos, estado) | artista, foro, organizador, público | Should | a | M | H01 |
| V02 | Postulación a convocatorias | artista, foro | Should | b | M | V01, H08 |
| E02 | Eventos recurrentes y de varias fechas | foro, organizador | Could | a | M | E01, H01 |
| M02 | Contacto con foros y artistas por formulario | público, foro, artista | Could | b | S | H08 |

### Fase 4 · Capa social (interfaz lista)
**Objetivo:** Feed, publicaciones, comentarios, reacciones, reportes y normas: la interfaz completa y los estados, con la capa de servicio vacía.
**Criterio de salida:** Las pantallas de los mockups sociales existen con estados vacíos y de error; ninguna muestra contenido ficticio; las normas están publicadas.

| ID | Funcionalidad | Perfil | MoSCoW | Viab. | Esf. | Depende de |
|---|---|---|---|---|---|---|
| Y04 | Normas de la comunidad y políticas visibles | todos | Must | a | S | H08 |
| B01 | Componentes base de la capa social | todos | Should | a | M | H06 |
| B02 | Feed «Mi tribu» | público | Should | c | L | B01, R01, H03 |
| B03 | Detalle de publicación | público | Should | c | M | B01, H05 |
| B04 | Crear publicación de texto | artista, foro, organizador | Should | c | M | B01, C01, H04 |
| B05 | Crear publicación con imágenes | artista, foro | Should | b | M | B04 |
| B06 | Publicación de evento | foro, artista, organizador | Should | b | M | B04, E01 |
| B07 | Sección «Publicaciones» en perfiles | público, artista, foro | Should | b | S | B01, P01, P02 |
| I03 | Reacciones (me gusta) | público | Should | c | M | B03, C01 |
| I04 | Comentarios | público, artista, foro | Should | c | L | B03, C01, Y01 |
| Y01 | Reportar contenido | todos | Should | b | M | H08, Y04 |
| Z01 | Edad y contenido sensible | público, administrador | Could | b | M | E04, Y04 |

### Fase 5 · Con backend
**Objetivo:** Todo lo que necesita servidor: cuentas, sincronía, mensajes, moderación, métricas, verificación y notificaciones reales.
**Criterio de salida:** Cada funcionalidad se conecta cambiando el adaptador de servicio, sin reescribir pantallas.

| ID | Funcionalidad | Perfil | MoSCoW | Viab. | Esf. | Depende de |
|---|---|---|---|---|---|---|
| C01 | Cuentas y sesión de usuario | público, artista, foro, organizador | Should | c | L | H03, H08 |
| C02 | Migración de datos locales a la cuenta | público | Should | b | M | C01, H03 |
| R03 | Seguidores y contadores | artista, foro | Should | c | M | R01, C01 |
| Y02 | Cola de moderación y acciones | administrador | Should | c | L | Y01, C01 |
| Y05 | Administración de perfiles y verificación | administrador | Should | c | L | P05, P06, Y02 |
| A05 | Asistentes y «quién va» | público, organizador | Could | c | M | A01, R01, C01, P04 |
| G02 | Métricas básicas | organizador, foro, artista | Could | c | M | G01, C01, H08 |
| G03 | Roles y equipo | foro, organizador, administrador | Could | c | M | C01, G01 |
| K01 | Reseñas de foros | público, foro | Could | c | L | C01, Y01, Y02 |
| N03 | Push y correo | público | Could | c | L | C01, N01, H08 |
| P04 | Privacidad del perfil de usuario | público | Could | c | M | C01, P03 |
| P06 | Verificación e insignia | público, artista, foro, administrador | Could | c | M | H02, P05 |
| R04 | Colectivos y miembros | artista, foro, organizador | Could | c | M | H02, P06 |
| V03 | Gestión de convocatorias por el organizador | organizador, administrador | Could | c | L | V02, G01, C01 |
| W04 | Acciones en cola sin conexión | público | Could | b | M | W02, H03, C01 |
| Y03 | Bloqueo y silencio | público | Could | c | M | C01, P04 |
| A04 | Reservas, cupo y boletos | público, organizador | Won't | c | L | E04, C01 |
| K02 | Grupos y comunidades por interés | público, organizador | Won't | c | L | C01, Y02, Z01 |
| M01 | Mensajes directos | público, artista, foro | Won't | c | L | C01, Y03, Z01 |

## 4. Catálogo detallado por área

### Cimientos

#### H01 · Fechas ISO y zona horaria en eventos
*Como persona del público, quiero que cada evento tenga fecha y hora exactas, para filtrar, ordenar y saber si ya pasó.*

- **Perfil:** público, organizador · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 0 · **Depende de:** —
- **Valor:** Alto — sin fechas no funcionan filtros, calendario ni «este fin de semana». · **Origen:** D1, F6, F7, def. 1
- **Estado hoy:** No existe: solo `dateLabel` de texto sin año (`data/events.json`); el filtro exige `startsAt` (`main.js:101`). `Intl.DateTimeFormat` solo se usa para eventos remotos (`services/content.service.js:84`). Los eventos de muestra son de agosto 2026 y hoy es 2026-10-02.
- **Criterios de aceptación:**
  - Cada evento trae `startsAt`, `endsAt` (opcional) y zona `America/Mexico_City` en el JSON, además de la etiqueta de texto.
  - Los eventos se ordenan por fecha y los pasados se marcan o se ocultan por defecto.
  - Los filtros Hoy, Este fin de semana y Este mes devuelven resultados distintos entre sí con las fixtures.
  - La etiqueta («Sáb 8 de ago · 6:00 p. m.») se genera del dato con `Intl` (es-MX) y con capitalización uniforme.

#### H02 · Modelo de relaciones evento–foro–artista
*Como persona del público, quiero pasar de un evento a su foro y a sus artistas (y al revés), para seguir explorando sin volver al buscador.*

- **Perfil:** público, artista, foro · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 0 · **Depende de:** —
- **Valor:** Alto — evita los callejones sin salida entre fichas. · **Origen:** D2, D3, F2, F3
- **Estado hoy:** Relación solo por `nextEventId` 1:1 y `marea-roja` sin evento (`data/artists.json`); `event-demo-cuentos` con `venueName` distinto de su foro (`data/events.json`); `slugsOf` descarta «Escena» y «Artes visuales» (`services/profile-draft.service.js:36`). La ficha de evento no enlaza al foro (`components/app-pages.js:247-270`).
- **Criterios de aceptación:**
  - El evento declara `venueId` y `artistIds`; artistas y foros derivan sus eventos sin duplicar datos.
  - Se elimina el `venueName` que contradice al foro y la relación 1:1 `nextEventId`.
  - Las categorías de foro usan los slugs de `categories.json`; ninguna etiqueta se descarta en silencio.
  - Una verificación automática comprueba integridad referencial (ids existentes, slugs únicos).

#### H03 · Capa de servicios asíncrona y adaptador de almacenamiento
*Como equipo de producto, quiero que todo acceso a datos pase por servicios asíncronos con un adaptador de almacenamiento, para pasar de localStorage a una API cambiando un solo punto.*

- **Perfil:** todos · **Prioridad:** Must · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** L · **Fase:** 0 · **Depende de:** —
- **Valor:** Alto — habilita sincronía, cuentas y backend sin reescribir pantallas. · **Origen:** A3, A5
- **Parte en frontend:** Interfaces de repositorio por entidad (eventos, artistas, foros, favoritos, siguiendo, RSVP, borradores, preferencias) con implementación local; la implementación contra la API queda como punto de conexión (supuesto b), sin diseñarla.
- **Estado hoy:** Parcial: lectura de contenido en un punto (`services/content.service.js:13-14`), pero `withDraft` es síncrono (`services/profile-draft.service.js:99`) y favoritos y preferencias usan `localStorage` por separado (`services/favorites.service.js`, `services/preferences.service.js`); la caché de borradores no escucha `storage` (`services/profile-draft.service.js:78-87`).
- **Criterios de aceptación:**
  - Favoritos, preferencias, borradores y contenido se leen y escriben solo desde servicios con contrato asíncrono (`Promise`).
  - Ningún componente toca `localStorage` directamente; hay un único adaptador con claves versionadas y migraciones.
  - Cada repositorio tiene implementación local y un stub de API con la misma interfaz; cambiar de una a otra es configuración.
  - Los cambios entre pestañas se reflejan (evento `storage`) y los fallos de cuota se informan al usuario.

#### H04 · Borrador separado de lo publicado
*Como artista o foro, quiero editar mi perfil sin que el público vea cambios a medias, para publicar solo cuando esté listo.*

- **Perfil:** artista, foro, organizador · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 3 · **Depende de:** H03
- **Valor:** Medio — evita que un borrador local se confunda con el perfil público. · **Origen:** A4, P4
- **Parte en frontend:** Modelo `draft` frente a `published`, vista previa y estados; la publicación real requiere backend (existe `POST …/profile/submit`, supuesto b).
- **Estado hoy:** El borrador local se aplica a todas las listas y fichas del navegador (`services/content.service.js:13-14`, `services/profile-draft.service.js:99-113`).
- **Criterios de aceptación:**
  - `withDraft` deja de alterar tarjetas, mapa y fichas públicas; el borrador solo se ve en el editor y en «Vista previa».
  - Estados visibles: borrador, en revisión, publicado.
  - Descartar y restablecer el borrador no afecta lo publicado.

#### H05 · Enrutador con respaldo SPA, 404 propia y HTML por slug en la build
*Como persona del público, quiero abrir y compartir el enlace de cualquier evento, artista o foro, incluso uno nuevo, para llegar siempre a la página correcta.*

- **Perfil:** todos · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** L · **Fase:** 0 · **Depende de:** —
- **Valor:** Alto — sin esto un perfil o publicación nuevo no tiene URL ni vista previa al compartirse. · **Origen:** A1, F4, E2, E3, E6
- **Estado hoy:** 32 HTML fijos (`src/pages/**`, `config/routes.js:18-27`); sin `404.html` (el servidor local devuelve `<h1>404</h1>`); `renderNotFound` es inalcanzable (`main.js:219`). Supuesto de la pregunta 2 de la Fase 2.
- **Criterios de aceptación:**
  - Una URL desconocida muestra la 404 de la app (`404.html` publicado) con rutas de salida.
  - Un enrutador cliente resuelve `/eventos/<slug>/`, `/artistas/<slug>/` y `/foros/<slug>/` aunque no exista un HTML dedicado.
  - La build genera HTML estático por slug con título, descripción y `og:*` propios.
  - `prepare-dist` y el servidor de desarrollo comparten las mismas reglas de reescritura.

#### H06 · Ciclo de vida de pantallas (montaje idempotente)
*Como persona del público, quiero que la página se actualice cuando llegan datos nuevos sin duplicar menús ni romperse, para confiar en lo que veo.*

- **Perfil:** todos · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 0 · **Depende de:** H05
- **Valor:** Alto — hoy el repintado con datos remotos fallaría en silencio. · **Origen:** A2, F5
- **Estado hoy:** `$('#app').replaceWith(...)` en `main.js:41,86,140` y `components/app-pages.js:14`; segunda llamada en `main.js:221-244`; `renderShell` antepone sin limpiar (`components/shell.js:47-50`); `.catch(() => {})` traga el error (`main.js:231-243`). Latente: solo aparece con la API configurada.
- **Criterios de aceptación:**
  - Montar una ruta dos veces no duplica cabecera, dock ni pie; `#app` ya no se reemplaza de forma destructiva.
  - Al llegar datos remotos se repinta solo la región afectada y se conservan foco y scroll.
  - Un fallo remoto muestra un aviso discreto («mostrando datos de ejemplo») en vez de silencio.
  - Hay una prueba que monta una ruta dos veces.

#### H07 · Buscador único y filtros reparados
*Como persona del público, quiero que fecha, zona, intención y búsqueda por lugar funcionen, para encontrar lo que busco.*

- **Perfil:** público · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 0 · **Depende de:** H01, H02
- **Valor:** Alto — hoy 4 de los mecanismos de descubrimiento fallan. · **Origen:** def. 1-4, A5, D7
- **Estado hoy:** Dos implementaciones (`main.js:95-112` y `services/search.service.js:3-11`); fecha y zona fallan (`main.js:99,101`); la búsqueda no ve el foro (`main.js:97`); intenciones inertes (`services/search.service.js:8`, `components/app-pages.js:300`). Verificado en navegador en la Fase 2.
- **Criterios de aceptación:**
  - Un solo servicio de búsqueda alimenta `/eventos/` y `/explorar/` con las mismas reglas (acentos, mayúsculas, foro y zona).
  - La zona se deriva del foro del evento y la búsqueda por texto encuentra por nombre de foro y zona.
  - «Este fin de semana» y «Cerca de ti» se calculan (fecha y distancia) en vez de ser etiquetas; artistas y foros se filtran por intención o se excluyen de forma explícita.
  - Pruebas con las fixtures: cada filtro produce un resultado distinto y comprobable.

#### H08 · Privacidad: aviso, consentimiento y «Mis datos locales»
*Como persona del público, quiero ver, exportar y borrar todo lo que Cuicoyan guarda en mi navegador, para controlar mis datos.*

- **Perfil:** todos · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 0 · **Depende de:** —
- **Valor:** Alto — hoy «Borrar datos locales» deja correo, teléfono y fotos en el navegador. · **Origen:** def. 8, P3, P4, Q6
- **Parte en frontend:** El aviso integral con responsable y derechos ARCO es decisión legal abierta (decisión 5); aquí solo la interfaz y los textos de apoyo.
- **Estado hoy:** `clearPreferences` borra solo 2 claves (`services/preferences.service.js:5`); el aviso omite los borradores (`main.js:218`); el README afirma «no se almacenan datos personales». Confirmado en navegador en la Fase 2.
- **Criterios de aceptación:**
  - Una pantalla «Mis datos» lista cada tipo guardado (preferencias, favoritos, siguiendo, RSVP, borradores, caché) con tamaño y fecha.
  - «Borrar datos locales» elimina todo, incluidos los borradores de perfil con correo, teléfono y fotos, y lo confirma.
  - Se puede exportar a JSON y reimportar los datos locales.
  - El aviso y el README describen exactamente qué se guarda y a quién se envía (FormSubmit).

#### H09 · Pruebas y verificación automática
*Como equipo, quiero pruebas automáticas de servicios, flujos clave, enlaces y accesibilidad, para cambiar el código sin romper lo que ya funciona.*

- **Perfil:** administrador · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 0 · **Depende de:** —
- **Valor:** Alto — hoy no hay red de seguridad. · **Origen:** Q1, Q2, X9
- **Estado hoy:** `tests/` vacío; sin scripts `test` ni `lint` (`frontend/package.json:6-12`); `check:links` solo rechaza el atributo `href` con valor `#`, imágenes de googleusercontent y manejadores en línea, sin comprobar rutas (`scripts/check-links.mjs:6`); CI = build + 2 verificaciones (`.github/workflows/validate.yml:31-38`).
- **Criterios de aceptación:**
  - Existe `npm test` con pruebas de servicios (búsqueda, favoritos, fechas, repositorios) y corre en CI.
  - `check:links` recorre las rutas y comprueba que cada enlace interno y cada ancla existan.
  - Un recorrido E2E con teclado a 375 y 1440 px cubre descubrir, guardar, RSVP y compartir.
  - axe se ejecuta por ruta en CI y las excepciones están documentadas.

#### H10 · Publicación por CI y banderas por entorno
*Como equipo, quiero que la publicación salga de la build en CI y que las funciones de prueba estén apagadas en público, para no exponer edición ni publicar una copia vieja.*

- **Perfil:** administrador · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 0 · **Depende de:** —
- **Valor:** Alto — hoy el repositorio versiona una copia desfasada y la edición está abierta. · **Origen:** Q3, Q5, P5, def. 9-10
- **Estado hoy:** `dist/` versionado y desfasado (la build crea 6 archivos y cambia 7); `TEST_EDIT_ACCESS = true` (`config/test-access.js:3`); `vite.config.js:7-26` lista 19 de 32 páginas. Supuestos de las preguntas 1 y 4 de la Fase 2.
- **Criterios de aceptación:**
  - `dist/` sale del repositorio (`.gitignore`) y el despliegue lo genera la CI.
  - `TEST_EDIT_ACCESS` se define por entorno: apagado en público, encendido en staging.
  - Se eliminan o actualizan `services/external-channel.service.js` y `vite.config.js`.
  - El README refleja el proceso real de publicación.

#### H11 · Rendimiento de carga
*Como persona con datos móviles limitados, quiero que la app cargue rápido, para abrirla en la calle.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** H05
- **Valor:** Medio — 43 peticiones por pantalla pesan en redes lentas. · **Origen:** A6, A7
- **Estado hoy:** 43 peticiones y 24 módulos en `/eventos/`, incluidos editores y mapa; 22 imágenes en home por variantes clara y oscura (`main.js:54`, `components/cards.js:62`); cartografía de 46 MB. Si se quiere empaquetar o minificar, hace falta una herramienta de build como dependencia de desarrollo (pregunta 2).
- **Criterios de aceptación:**
  - Los editores, el mapa y el formulario «Únete» se cargan solo donde se usan (importación dinámica), sin añadir dependencias de ejecución.
  - Cada imagen se descarga en una sola variante (claro u oscuro) y con tamaños responsivos.
  - `/eventos/` baja de las 43 peticiones y ~735 KB descomprimidos medidos; la meta se fija con una línea base.
  - El mapa sigue leyendo el PMTiles por rangos y precarga solo la región visible.

### Cuentas y sesión

#### C01 · Cuentas y sesión de usuario
*Como persona del público, quiero crear una cuenta e iniciar sesión, para conservar lo que sigo y guardo en todos mis dispositivos.*

- **Perfil:** público, artista, foro, organizador · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** H03, H08
- **Valor:** Alto — habilita sincronía, publicar y comunidad; el núcleo local no la necesita. · **Origen:** Fase 1 §2, P7
- **Parte en frontend:** Pantallas de registro, ingreso, cierre y recuperación, validación, estados de carga, error y vacío, y un `auth.service` con interfaz estable. El motor (Supabase ya presente) es supuesto b: no se rediseña.
- **Estado hoy:** Preparado y apagado: sesión Supabase (`services/auth.service.js`, tokens en `sessionStorage`, `:3-24`), invitación (`main.js:151`) y perfil remoto (`main.js:183-198`); no hay cuenta de usuario público.
- **Criterios de aceptación:**
  - Registro e ingreso por correo (y proveedor gestionado) con mensajes de error accesibles.
  - Sesión persistente, cierre de sesión que borra tokens y recuperación de contraseña.
  - Sin cuenta, todo el núcleo (seguir, guardar, RSVP) sigue funcionando en local.
  - El estado de sesión se refleja en la cabecera (avatar) y en las rutas protegidas.

#### C02 · Migración de datos locales a la cuenta
*Como persona que ya usaba Cuicoyan sin cuenta, quiero que mis favoritos, seguidos y RSVP se unan a mi cuenta al ingresar, para no empezar de cero.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** C01, H03
- **Valor:** Medio — evita perder lo ya guardado al crear cuenta. · **Origen:** H03
- **Parte en frontend:** Asistente de combinación con vista previa, resolución de conflictos y confirmación; la escritura real requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Al ingresar por primera vez se ofrece importar los datos locales con vista previa.
  - Duplicados y conflictos se resuelven con una regla clara (gana lo más reciente) y se informan.
  - Se puede cancelar sin perder los datos locales.

### Onboarding

#### O01 · Onboarding de intereses efectivo
*Como persona nueva, quiero elegir mis intereses una vez y ver una home y un explorar hechos para mí, para descubrir sin buscar.*

- **Perfil:** público · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H03
- **Valor:** Alto — hoy los intereses se guardan y no hacen nada. · **Origen:** def. 5
- **Estado hoy:** Se guardan y no se leen salvo para precargar el formulario (`main.js:140`); tras guardar redirige a `/explorar/` sin efecto. Confirmado por código en la Fase 2.
- **Criterios de aceptación:**
  - Los intereses guardados ordenan y filtran los rieles de la home y el orden de `/explorar/` con una regla simple (coincidencia de categorías).
  - El paso es saltable y editable desde «Mi perfil» y «Mis datos».
  - Al guardar se confirma qué cambió («mostrando música y danza primero»).
  - Sin intereses la experiencia es la actual; nada se bloquea.

#### O02 · Primer uso guiado y local-first
*Como persona nueva, quiero entender en pocos pasos qué se guarda en mi dispositivo y qué puedo hacer sin cuenta, para confiar y empezar.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 1 · **Depende de:** H08, O01
- **Valor:** Medio — alinea expectativas de privacidad desde el primer uso. · **Origen:** U8
- **Estado hoy:** Solo `/onboarding/intereses/` (`main.js:140`); la nota «Tus favoritos se guardan únicamente en este dispositivo» ya aparece en Favoritos.
- **Criterios de aceptación:**
  - Tres pantallas como máximo: qué es Cuicoyan, qué se guarda aquí, intereses.
  - Se muestra una vez, se puede reabrir desde «Ayuda» y no bloquea la navegación.
  - Aclara que la ubicación solo se pide al tocar «Cerca de mí» y que nada sale del dispositivo sin una acción explícita.
  - Cumple foco, lector de pantalla y reducción de movimiento.

### Perfiles

#### P01 · Perfil público de artista completo
*Como persona del público, quiero ver redes, próximas fechas propias, biografía larga y seguir al artista, para decidir si voy a verlo.*

- **Perfil:** público, artista · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H02, R01
- **Valor:** Alto — el perfil es el punto de decisión para seguir. · **Origen:** F3, D4
- **Estado hoy:** Hero, biografía y fechas; sin redes, contacto ni métricas (`components/app-pages.js:200-210`); «Ver todas» lleva a `/eventos/` sin filtro; la biografía repite la frase corta en 4 de 5 artistas (`data/artists.json`).
- **Criterios de aceptación:**
  - Muestra biografía larga, disciplinas, redes y contacto solo si el perfil los publicó y están autorizados.
  - «Próximas fechas» lista los eventos del artista (no todos) y «Ver todas» filtra por ese artista; los pasados van en una sección aparte.
  - El botón «Seguir» y el ♥ tienen estados y anuncio de lector.
  - Si no hay fechas, un estado vacío claro («Sin fechas anunciadas»).

#### P02 · Perfil público de foro completo
*Como persona del público, quiero ver horarios, accesibilidad, mapa real y los eventos del foro, para saber cómo llegar y si puedo entrar.*

- **Perfil:** público, foro · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H02, D03, R01
- **Valor:** Alto — responde a «¿cómo llego y puedo entrar?». · **Origen:** Fase 1 §6, def. 6
- **Estado hoy:** Información real solo con borrador local; sin él, «Por confirmar»; minimapa decorativo (`components/app-pages.js:234-245`, `:241`).
- **Criterios de aceptación:**
  - El minimapa es un mapa real (cartografía local) con el pin del foro, no una imagen decorativa.
  - Lista los eventos del foro (próximos y pasados) y «Ver en mapa» abre el mapa con ese foro seleccionado.
  - Información (horario, accesibilidad, servicios, aforo y renta) con «Por confirmar» solo donde falte.
  - Botón «Seguir» y ♥.

#### P03 · Perfil de usuario local («Mi perfil»)
*Como persona del público, quiero un espacio propio con mi nombre opcional, avatar, intereses, lo que sigo, mis listas y mi agenda, para tener un punto de partida.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H03, R01, A02
- **Valor:** Alto — el avatar de los mockups no tiene destino hoy. · **Origen:** U1
- **Estado hoy:** No existe: la cabecera no tiene avatar ni campana (`components/shell.js:34-45`); Favoritos muestra un enlace «Ajustes».
- **Criterios de aceptación:**
  - El avatar en la cabecera (como en los mockups) abre «Mi perfil» sin necesidad de cuenta.
  - Reúne intereses, siguiendo, listas, agenda, «Mis datos» y ajustes (tema, accesibilidad).
  - Nombre y foto son opcionales y quedan solo en el dispositivo.
  - Con cuenta, la misma pantalla muestra datos sincronizados.

#### P04 · Privacidad del perfil de usuario
*Como usuario, quiero decidir quién ve mi perfil y mi actividad, para compartir solo lo que quiero.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** C01, P03
- **Valor:** Medio — necesaria en cuanto exista actividad pública. · **Origen:** Decisión 5
- **Parte en frontend:** Pantalla de ajustes con tres niveles (público, solo seguidores, privado) y vista previa «así te ven».
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Tres niveles con explicación de qué ve cada quien.
  - El valor por defecto es privado para menores o sin edad declarada (decisión legal abierta).
  - Un cambio se refleja en una vista previa antes de guardarlo.

#### P05 · Del borrador a la revisión: solicitar publicación
*Como foro o artista, quiero enviar mi perfil a revisión y ver su estado, para publicar información verificada.*

- **Perfil:** artista, foro, administrador · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 3 · **Depende de:** H04
- **Valor:** Alto — convierte el editor local en un camino real a publicar. · **Origen:** A4, H04
- **Parte en frontend:** Flujo y estados (borrador, en revisión, publicado, devuelto) con comentarios de revisión; la cola real requiere backend (existe `POST …/profile/submit`, supuesto b).
- **Estado hoy:** Editores con borrador local y «Exportar borrador (JSON)» (`components/profile-kit.js:181-185`); el envío remoto existe solo con API (`main.js:187-195`).
- **Criterios de aceptación:**
  - «Enviar a revisión» valida campos obligatorios y URLs antes de enviar.
  - El estado se ve en el editor y en el panel, con mensajes de rechazo accionables.
  - El perfil publicado no cambia hasta aprobarse.
  - `contentStatus` pasa de `demo` a `approved` solo por revisión.

#### P06 · Verificación e insignia
*Como persona del público, quiero distinguir los perfiles verificados, para evitar suplantaciones.*

- **Perfil:** público, artista, foro, administrador · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** H02, P05
- **Valor:** Medio — confianza antes de abrir publicaciones y mensajes. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Campo `verified` en el modelo, insignia accesible y página «Qué significa verificado».
- **Estado hoy:** Solo `contentStatus` e `isDemo` (`config/content-status.js`).
- **Criterios de aceptación:**
  - La insignia tiene texto alternativo y una explicación al tocarla.
  - Solo el proceso de revisión la otorga; el cliente nunca la fija.
  - Los perfiles sin verificar muestran su estado sin estigma.

### Relaciones

#### R01 · Seguir artistas y foros (local)
*Como persona del público, quiero seguir artistas y foros y ver «Mi tribu» con sus próximas fechas, para no perderme lo que me importa.*

- **Perfil:** público, artista, foro · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H02, H03
- **Valor:** Alto — es el primer pilar de la «red social» (decisión 2). · **Origen:** Fase 2 §4.2, pregunta 3
- **Parte en frontend:** El conteo de seguidores y la sincronía entre dispositivos requieren backend (R03, C02).
- **Estado hoy:** No existe «seguir»; «Mi tribu» son favoritos filtrados (`components/app-pages.js:100`).
- **Criterios de aceptación:**
  - «Seguir/Siguiendo» en artista y foro, distinto del ♥ «guardar» (supuesto de la pregunta 3), con `aria-pressed` y anuncio de lector.
  - «Mi tribu» muestra lo que sigues y sus próximas fechas ordenadas, con un estado vacío útil.
  - Dejar de seguir se puede deshacer.
  - Los datos viven tras el repositorio `siguiendo` (H03).

#### R02 · Seguir temas y zonas
*Como persona del público, quiero seguir categorías y zonas (por ejemplo huapango en Coyoacán), para que lo nuevo me llegue sin buscar.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 2 · **Depende de:** R01, O01, H07
- **Valor:** Medio — personaliza sin pedir cuenta. · **Origen:** def. 5
- **Estado hoy:** Intereses guardados sin uso (`main.js:140`).
- **Criterios de aceptación:**
  - Se pueden seguir categorías y zonas desde los filtros y desde «Mis intereses».
  - «Mi tribu» y los rieles de la home incluyen los eventos que coinciden.
  - Se gestionan desde «Mi perfil».

#### R03 · Seguidores y contadores
*Como artista o foro, quiero ver cuánta gente me sigue, para saber si mi trabajo llega.*

- **Perfil:** artista, foro · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** R01, C01
- **Valor:** Medio — retroalimentación para quienes publican. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Componente de contador, lista paginada y estado «aún sin datos»; el conteo real requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - El contador es visible solo si el perfil lo activa.
  - La lista de seguidores se pagina y respeta la privacidad de cada persona.
  - Las cuentas privadas no aparecen en listados públicos.

#### R04 · Colectivos y miembros
*Como colectivo, quiero que mis integrantes aparezcan vinculados a mi perfil, para mostrar quiénes somos.*

- **Perfil:** artista, foro, organizador · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** H02, P06
- **Valor:** Bajo — enriquece perfiles, no bloquea el núcleo. · **Origen:** D4
- **Parte en frontend:** Campo `integrantes` y sección en el perfil; el vínculo verificado requiere backend.
- **Estado hoy:** «Únete» pide número de integrantes (`components/join-form.js`), pero el modelo de artista no lo conserva (`data/artists.json`).
- **Criterios de aceptación:**
  - Un perfil de colectivo lista integrantes que tienen perfil propio.
  - El vínculo requiere aceptación del integrante.
  - Quitarse de un colectivo es inmediato.

### Publicaciones y feed

#### B01 · Componentes base de la capa social
*Como equipo, quiero componentes reutilizables (tarjeta de publicación, avatar, campana, botón «+», hoja de comentarios) con sus estados, para construir feed y notificaciones sin retrabajo.*

- **Perfil:** todos · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** H06
- **Valor:** Medio — es la base visual de los mockups sociales. · **Origen:** U1
- **Estado hoy:** No existen; los mockups `Artistas`, `Evento` y `Perfil_*` los muestran; la cabecera no tiene campana ni avatar (`components/shell.js:34-45`).
- **Criterios de aceptación:**
  - Tarjeta de publicación con autor, tiempo relativo, imagen, texto, ♥, comentarios, compartir y guardar, fiel a los mockups claro y oscuro.
  - Estados cargando, vacío, error y sin conexión; todo operable con teclado y lector de pantalla.
  - No se publica contenido ficticio como si fuera real; los datos de ejemplo viven solo en pruebas.
  - Documentados en una página interna de componentes.

#### B02 · Feed «Mi tribu»
*Como persona del público, quiero un feed con las publicaciones de lo que sigo, para ver novedades de un vistazo.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 4 · **Depende de:** B01, R01, H03
- **Valor:** Alto — es la superficie social central de los mockups. · **Origen:** U1, Fase 1 §6
- **Parte en frontend:** Lista, paginación, estados cargando, vacío y error y filtros por tipo sobre un servicio `posts` con implementación vacía; el contenido requiere backend.
- **Estado hoy:** «Mi tribu» no es un feed: filtra favoritos (`components/app-pages.js:100`); el mockup `Artistas` (derecha) lo muestra con ♥, comentarios, compartir y «+».
- **Criterios de aceptación:**
  - Feed ordenado por fecha con lo que sigues; el estado vacío («Tu tribu está por empezar») lleva a explorar.
  - Carga incremental con foco y anuncios accesibles.
  - Aviso de publicaciones nuevas sin saltos de scroll.
  - Sin backend muestra el estado vacío, nunca contenido ficticio.

#### B03 · Detalle de publicación
*Como persona del público, quiero abrir una publicación con su imagen, texto, evento enlazado y comentarios, para verla completa y compartirla.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** B01, H05
- **Valor:** Medio — destino de cada enlace compartido. · **Origen:** Fase 1 §6
- **Parte en frontend:** Pantalla, URL propia y estados (no disponible, eliminada); los datos requieren backend.
- **Estado hoy:** No implementado: `Mockups/Light/Evento.png` es un detalle de publicación (supuesto c); la ficha de evento actual es otra cosa (`components/app-pages.js:247`).
- **Criterios de aceptación:**
  - Muestra imagen, texto, autor, evento enlazado, ♥, comentarios, compartir y guardar.
  - URL propia y compartible con metadatos (H05).
  - Enlaces al perfil del autor y a «Más publicaciones».
  - Maneja publicación eliminada o no disponible.

#### B04 · Crear publicación de texto
*Como artista o foro, quiero escribir una publicación, para avisar novedades a quienes me siguen.*

- **Perfil:** artista, foro, organizador · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** B01, C01, H04
- **Valor:** Medio — alimenta el feed. · **Origen:** U1
- **Parte en frontend:** Compositor con contador, validación, borrador local y vista previa; publicar requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - El botón «+» (mockup) abre el compositor solo a perfiles con permiso.
  - Límite de caracteres con contador accesible y guardado automático del borrador local.
  - La vista previa es idéntica a la tarjeta publicada.
  - Un error de publicación conserva el texto.

#### B05 · Crear publicación con imágenes
*Como artista o foro, quiero adjuntar fotos a mi publicación, para mostrar mi trabajo.*

- **Perfil:** artista, foro · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** B04
- **Valor:** Medio — las publicaciones de los mockups son visuales. · **Origen:** P4
- **Parte en frontend:** Selección, recorte, recompresión en el navegador, quita de metadatos EXIF, texto alternativo y límites; la subida requiere backend y almacenamiento.
- **Estado hoy:** La recodificación en canvas y el aviso de cuota ya existen en el editor de perfil (`components/profile-kit.js:27-31,199`).
- **Criterios de aceptación:**
  - Hasta N imágenes recortadas y recomprimidas en el navegador, sin metadatos EXIF.
  - Texto alternativo obligatorio o marca explícita de decorativa.
  - Mensaje claro si pesa demasiado o falla la subida.
  - Vista previa con y sin conexión.

#### B06 · Publicación de evento
*Como foro o artista, quiero anunciar un evento mío como publicación, para que mis seguidores lo vean con un botón «Voy».*

- **Perfil:** foro, artista, organizador · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** B04, E01
- **Valor:** Medio — une feed y asistencia. · **Origen:** U1
- **Parte en frontend:** Plantilla «anunciar evento» que enlaza un evento existente y precarga datos; publicar requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Elegir un evento propio genera una publicación con fecha, lugar, imagen y botón «Voy».
  - La publicación refleja el estado del evento (cancelado o reprogramado).
  - Enlaza a la ficha del evento.

#### B07 · Sección «Publicaciones» en perfiles
*Como persona del público, quiero ver las publicaciones de un artista o foro en su perfil, para conocer su actividad.*

- **Perfil:** público, artista, foro · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** S · **Fase:** 4 · **Depende de:** B01, P01, P02
- **Valor:** Medio — aparece en dos mockups y hoy no hace nada. · **Origen:** def. 7, U1
- **Parte en frontend:** Sección, rejilla o lista, interruptor `sections.posts` funcional y estado vacío; los datos requieren backend.
- **Estado hoy:** Solo el interruptor, sin efecto (`services/profile-draft.service.js:62`, `components/profile-editor.js:25`); los mockups `Perfil_Artista` y `Perfil_ForoCultural` muestran la sección.
- **Criterios de aceptación:**
  - La sección aparece en el perfil de artista y de foro según el interruptor `sections.posts`.
  - Estado vacío para quien visita y guía de «crear la primera» para quien edita.
  - Orden por fecha y paginación.

### Interacción

#### I01 · Guardar con deshacer, orden y marca de pasados
*Como persona del público, quiero guardar y quitar de favoritos con confirmación y poder deshacer, para no perder algo por un toque accidental.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 1 · **Depende de:** H01, H03
- **Valor:** Medio — afina la acción más usada. · **Origen:** F8, U3
- **Estado hoy:** Guardar funciona con `aria-pressed` y anuncio de lector (`components/cards.js:37`); sin deshacer ni orden; Favoritos usa una imagen fija para todo evento (`components/app-pages.js:115-167`, verificado en la Fase 2).
- **Criterios de aceptación:**
  - Al guardar o quitar aparece un aviso breve con «Deshacer», accesible y anunciado.
  - Favoritos se filtra por Todo, Eventos, Artistas y Espacios y se ordena por fecha del evento.
  - Los eventos guardados que ya pasaron se marcan como pasados.
  - Cada evento guardado usa su propia imagen, no una imagen fija.

#### I02 · Listas y colecciones
*Como persona del público, quiero agrupar lo que guardo en listas con nombre (por ejemplo «Para el fin de semana»), para organizar mis planes y compartirlos.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** I01
- **Valor:** Medio — convierte favoritos en planes. · **Origen:** —
- **Parte en frontend:** Las listas colaborativas o con edición compartida requieren backend; aquí solo listas propias y enlace de solo lectura.
- **Estado hoy:** Favoritos planos, máximo 100 (`services/favorites.service.js:1-8`).
- **Criterios de aceptación:**
  - Crear, renombrar, ordenar y borrar listas; un elemento puede estar en varias.
  - Una lista se comparte como enlace de solo lectura con los identificadores codificados en la URL (sin backend) o se exporta.
  - Estados vacíos y límites (hoy el máximo es 100 elementos).
  - Las listas viven en el repositorio de H03.

#### I03 · Reacciones (me gusta)
*Como persona del público, quiero reaccionar con un ♥ a una publicación, para apoyar a quien la hizo.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** B03, C01
- **Valor:** Medio — retroalimentación mínima para quien publica. · **Origen:** U1
- **Parte en frontend:** Botón ♥ con estados, contador optimista y reversión; persistir y contar requiere backend.
- **Estado hoy:** No existe; el mockup `Artistas` muestra ♥ con contador.
- **Criterios de aceptación:**
  - El ♥ alterna con `aria-pressed`, contador y animación que respeta el movimiento reducido.
  - Actualización optimista con reversión si falla.
  - Sin sesión invita a iniciar sesión sin perder el contexto.
  - Un solo ♥ por persona y publicación.

#### I04 · Comentarios
*Como persona del público, quiero comentar y responder en una publicación, para conversar con la comunidad.*

- **Perfil:** público, artista, foro · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 4 · **Depende de:** B03, C01, Y01
- **Valor:** Medio — interacción central de los mockups. · **Origen:** U1
- **Parte en frontend:** Lista, hilo de un nivel, formulario con validación, estados, borrar el propio y «Reportar»; todo lo demás es backend.
- **Estado hoy:** No existe; el mockup `Evento` muestra comentarios con me gusta.
- **Criterios de aceptación:**
  - Comentarios y respuestas de un nivel, orden por fecha y carga incremental.
  - Formulario accesible con contador, errores y conservación del texto.
  - Borrar el propio comentario y «Reportar» en los ajenos.
  - Estado vacío y estado «comentarios desactivados».

#### I05 · Compartir
*Como persona del público, quiero compartir un evento, artista, foro o lista, para invitar a alguien con un toque.*

- **Perfil:** todos · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 1 · **Depende de:** H05, H01
- **Valor:** Alto — hoy no hay manera de pasar un plan a otra persona. · **Origen:** F1, E6
- **Estado hoy:** Deshabilitado y listado como «no disponible aún» (`components/app-pages.js:264`); no hay `navigator.share` en el código.
- **Criterios de aceptación:**
  - «Compartir» usa `navigator.share` y, si no existe, copia el enlace con una confirmación anunciada.
  - El enlace compartido abre la ruta correcta y muestra título e imagen en la vista previa (H05).
  - Disponible en evento, artista, foro y lista; en un evento el texto incluye fecha y lugar.
  - No agrega rastreadores a la URL.

### Mensajes

#### M01 · Mensajes directos
*Como persona del público, quiero escribir a un artista o foro, para preguntar por un evento.*

- **Perfil:** público, artista, foro · **Prioridad:** Won't · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** C01, Y03, Z01
- **Valor:** Medio — fuera del núcleo (decisión 2) y con riesgo para menores. · **Origen:** Decisión 2
- **Parte en frontend:** Solo la interfaz (bandeja, conversación, estados) sobre un servicio vacío; todo lo demás es backend.
- **Estado hoy:** No existe; los mockups no la muestran.
- **Criterios de aceptación:**
  - Bandeja y conversación con estados cargando, vacío y error.
  - Bloqueo y reporte accesibles desde cada conversación.
  - Restricciones para menores (decisión legal abierta).
  - No se envía nada sin sesión.

#### M02 · Contacto con foros y artistas por formulario
*Como persona del público, quiero escribir al foro o artista para preguntar por renta, accesibilidad o contratación, sin cuenta.*

- **Perfil:** público, foro, artista · **Prioridad:** Could · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** S · **Fase:** 3 · **Depende de:** H08
- **Valor:** Medio — cubre la necesidad de contacto sin construir mensajería. · **Origen:** P3
- **Parte en frontend:** Formulario con consentimiento, validación y confirmación detrás de un servicio de envío (hoy FormSubmit); no hay buzón propio.
- **Estado hoy:** `/unete/` envía a FormSubmit (`components/join-form.js:173`); las fichas dicen que no muestran contacto hasta contar con autorización (`components/app-pages.js:208`).
- **Criterios de aceptación:**
  - Formulario con consentimiento, aviso y límite de envío del lado cliente.
  - El destinatario ve el origen (evento o perfil) sin exponer datos de otras personas.
  - Confirmación y manejo de error accesibles.
  - Solo en perfiles que activan «Recibir mensajes».

### Notificaciones

#### N01 · Centro de avisos (campana)
*Como persona del público, quiero una campana con avisos de lo que sigo y de mis eventos próximos, para no depender de abrir cada ficha.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** A02, R01
- **Valor:** Medio — la campana está en los mockups. · **Origen:** U1
- **Parte en frontend:** Bandeja local con avisos derivados de la agenda y de lo que sigues («mañana: …», «cambió la fecha de …» al detectar cambios en los datos); los avisos originados por otras personas requieren backend.
- **Estado hoy:** No existe; los mockups muestran campana y avatar (`components/shell.js:34-45`).
- **Criterios de aceptación:**
  - Campana y contador en cabecera (componente que B01 reutiliza después), con hoja de avisos y «marcar como leído».
  - Genera avisos locales: eventos con «Voy» en 24 h y cambios en los datos de lo que sigues.
  - Preferencias por tipo de aviso.
  - Estado vacío; `aria-live` solo para avisos nuevos.

#### N02 · Recordatorios de evento
*Como persona que irá a un evento, quiero un recordatorio antes de que empiece, para no olvidarlo.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** A03, W02
- **Valor:** Alto — el motivo más común para abrir la app. · **Origen:** A8
- **Parte en frontend:** Alarma VALARM en el `.ics` (completo en frontend) y notificaciones del navegador con la app abierta o instalada; avisos push con la app cerrada requieren backend.
- **Estado hoy:** No existe; no hay service worker.
- **Criterios de aceptación:**
  - Al decir «Voy» se ofrece recordatorio (1 día o 2 h antes) y el permiso de notificaciones se pide solo en ese momento.
  - El `.ics` incluye alarma configurable.
  - Si el permiso se niega, se explica la alternativa sin insistir.
  - Se cancela al quitar el RSVP.

#### N03 · Push y correo
*Como persona del público, quiero recibir avisos por correo o notificación push de lo que me importa, para enterarme aunque no abra la app.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** C01, N01, H08
- **Valor:** Medio — alcance fuera de la app. · **Origen:** —
- **Parte en frontend:** Preferencias, consentimiento y plantillas en la interfaz; el envío real requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Suscripción opt-in por canal, con baja de un toque.
  - Frecuencia máxima y resumen semanal configurables.
  - Registro de consentimiento exportable.
  - Sin datos personales en el texto del aviso.

### Asistencia y agenda

#### A01 · RSVP: «Voy» y «Me interesa»
*Como persona del público, quiero marcar «Voy» o «Me interesa» en un evento, para organizar mi semana.*

- **Perfil:** público · **Prioridad:** Must · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H01, H03
- **Valor:** Alto — es el tercer pilar de la «red social» (decisión 2) y hoy está deshabilitado. · **Origen:** F1
- **Parte en frontend:** Estado propio persistido en local y mostrado en tarjetas y agenda; el conteo de asistentes y «quién va» requieren backend (A05).
- **Estado hoy:** La ficha dice que «reservar… se habilitarán cuando exista un canal aprobado» y muestra un botón «Próximamente» deshabilitado (`components/app-pages.js:264`).
- **Criterios de aceptación:**
  - «Voy» y «Me interesa» excluyentes en la ficha y en la tarjeta, con `aria-pressed` y anuncio de lector.
  - El estado se ve en Favoritos, agenda y «Mi tribu», y se puede cambiar o quitar.
  - Un evento pasado se marca como pasado sin pedir acción.
  - Sin cuenta funciona en local; con cuenta sincroniza (C02).

#### A02 · Agenda personal
*Como persona del público, quiero una agenda con lo que voy a hacer, en lista y en calendario, para ver mi semana de un vistazo.*

- **Perfil:** público · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** A01, H01, I01
- **Valor:** Alto — convierte guardar y RSVP en un plan. · **Origen:** F1
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Vistas de lista, semana y mes con los eventos con «Voy» y los guardados, sin dependencias de calendario externas.
  - Detecta cruces de horario y los marca.
  - Los eventos pasados se separan.
  - Accesible por teclado: navegación por días con anuncio de la fecha.

#### A03 · Exportar a calendario (.ics)
*Como persona del público, quiero añadir un evento o toda mi agenda a mi calendario, para recibir mis avisos habituales.*

- **Perfil:** público · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 1 · **Depende de:** H01
- **Valor:** Alto — el puente más simple hacia el calendario de cada persona. · **Origen:** F1
- **Estado hoy:** No existe; la ficha lista «añadir al calendario» como no disponible (`components/app-pages.js:264`).
- **Criterios de aceptación:**
  - Descarga un `.ics` válido (RFC 5545) de un evento y de «Mi agenda», con zona `America/Mexico_City`, ubicación y enlace de vuelta.
  - Alarma opcional (VALARM).
  - Prueba manual declarada en Apple Calendar, Google Calendar y Outlook.
  - Nombre de archivo legible y sin datos personales.

#### A04 · Reservas, cupo y boletos
*Como persona del público, quiero reservar o comprar mi lugar sin salir de Cuicoyan, para asegurar mi entrada.*

- **Perfil:** público, organizador · **Prioridad:** Won't · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** E04, C01
- **Valor:** Medio — requiere pasarela y decisiones legales; fuera de esta hoja de ruta. · **Origen:** F1
- **Parte en frontend:** Mostrar precio y enlace al canal oficial del organizador (`ticketUrl`) con la aclaración de que Cuicoyan no cobra; cupo, lista de espera y pago requieren backend y pasarela.
- **Estado hoy:** «Reservar, comprar» está deshabilitado (`components/app-pages.js:264`); los términos dicen que no hay pagos, reservas ni boletos (`main.js:218`).
- **Criterios de aceptación:**
  - Hasta tener backend y pasarela, la ficha enlaza al canal oficial y declara que Cuicoyan no cobra.
  - Si se habilita: cupo, lista de espera y confirmación por correo.
  - Reembolsos y comprobantes quedan fuera sin decisión legal.

#### A05 · Asistentes y «quién va»
*Como persona del público, quiero saber cuánta gente va y si va gente que sigo, para decidir.*

- **Perfil:** público, organizador · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** A01, R01, C01, P04
- **Valor:** Medio — prueba social, con riesgo de privacidad. · **Origen:** —
- **Parte en frontend:** Contador y avatares opcionales con estado vacío; los datos requieren backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Contador agregado visible solo si el organizador lo activa.
  - «Quién va» respeta la privacidad de cada persona (P04).
  - Nunca se muestran asistentes que no lo hayan elegido.

### Comunidad y reseñas

#### K01 · Reseñas de foros
*Como persona del público, quiero leer y escribir reseñas de un foro, para saber cómo es antes de ir.*

- **Perfil:** público, foro · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** C01, Y01, Y02
- **Valor:** Medio — decisión de ir a un lugar nuevo. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Formulario (valoración y texto), lista, resumen y estados; guardar y moderar requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Solo personas con sesión (y, supuesto, con RSVP pasado) pueden reseñar.
  - Resumen de valoración y reseñas ordenables; el foro puede responder.
  - Reseñas reportables y moderadas.
  - Estado «sin reseñas todavía».

#### K02 · Grupos y comunidades por interés
*Como persona del público, quiero unirme a un grupo de mi interés (por ejemplo huapango), para conversar y organizar salidas.*

- **Perfil:** público, organizador · **Prioridad:** Won't · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** C01, Y02, Z01
- **Valor:** Bajo — fuera del núcleo; exige moderación. · **Origen:** Decisión 2
- **Parte en frontend:** Interfaz de listado, ficha y membresía sobre un servicio vacío.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Listado, ficha y membresía de grupos.
  - Moderación por administradores del grupo.
  - Reglas de convivencia visibles.
  - Fuera de alcance hasta definir la política de moderación (decisión 5).

### Descubrimiento y mapa

#### D01 · Búsqueda avanzada y filtros combinables
*Como persona del público, quiero filtrar por precio, edad, accesibilidad, zona y fechas a la vez, para encontrar algo que me convenga.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** H07, E04
- **Valor:** Alto — pasa de buscar por texto a decidir con criterios. · **Origen:** def. 1-4, D4
- **Estado hoy:** Filtros de texto, fecha, zona y categoría, con fallos (`main.js:95-112`); precio y audiencia son texto libre (`data/events.json`); sin filtro por accesibilidad.
- **Criterios de aceptación:**
  - Filtros combinables: fecha o rango, zona, categoría, precio (gratis o de pago), audiencia y accesibilidad (rampa, LSM).
  - Cada filtro aparece como chip quitable, vive en la URL y puede guardarse como búsqueda guardada local.
  - Muestra el número de resultados y permite ordenar (fecha, cercanía).
  - El estado vacío ofrece relajar filtros.

#### D02 · Sugerencias de búsqueda y tolerancia a erratas
*Como persona del público, quiero sugerencias mientras escribo y que no importe una errata o un acento, para encontrar rápido.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 2 · **Depende de:** H07, H08
- **Valor:** Medio — reduce búsquedas sin resultado. · **Origen:** A5
- **Estado hoy:** Existe normalización de texto (`utils/normalize-text.js`); no hay sugerencias.
- **Criterios de aceptación:**
  - Sugerencias de eventos, artistas, foros y categorías tras 2 caracteres.
  - Búsqueda sin acentos y con tolerancia a una errata.
  - Historial local borrable desde «Mis datos».
  - Lista accesible (rol combobox, flechas, Escape).

#### D03 · Mapa con selección por foro (`?foro=`) y lista sincronizada
*Como persona del público, quiero llegar al mapa con el foro de mi evento ya seleccionado, para ver dónde queda.*

- **Perfil:** público · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 1 · **Depende de:** H02
- **Valor:** Alto — hoy «Ver en mapa» siempre cae en Foro Alicia. · **Origen:** def. 6, U2
- **Estado hoy:** El mapa abre siempre en Foro Alicia (`components/map.js:146`); las filas navegan a la ficha (`components/map.js:173`); el enlace `?foro=` se genera en `components/app-pages.js:241,262`. Verificado en navegador en la Fase 2.
- **Criterios de aceptación:**
  - `/mapa/?foro=<slug>` selecciona y centra ese foro; un slug inválido se ignora con aviso.
  - Tocar un pin o una fila selecciona, y la lista y el pin se mantienen sincronizados; cada fila ofrece «Ver espacio».
  - El filtro por categoría se conserva en la URL.
  - «Ver en mapa» funciona desde evento y desde foro.

#### D04 · «Cerca de mí» con mapa propio
*Como persona del público, quiero ver qué hay cerca de mí ahora, para decidir qué hacer hoy.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** D03, H08, O02
- **Valor:** Alto — responde a la promesa «cerca de ti» de la home. · **Origen:** def. 4, def. 11
- **Estado hoy:** Solo el editor de foro usa geolocalización (`components/venue-editor.js:63-71`); `help.json` la niega; el chip «Cerca de ti» no devuelve resultados (`components/app-pages.js:300`).
- **Criterios de aceptación:**
  - La ubicación se pide solo al tocar «Cerca de mí», con una explicación previa; la posición no se guarda ni se envía.
  - Ordena eventos y foros por distancia y permite elegir radio (1, 3 o 5 km); sin permiso ofrece elegir una zona.
  - El mapa muestra la posición propia y un control de ubicación (mockup) sobre la cartografía local (PMTiles).
  - `help.json`, el aviso de privacidad y el onboarding explican cuándo se usa la ubicación.

#### D05 · Mapa fiel al mockup: pines con emblema, capas y ubicación
*Como persona del público, quiero pines claros por tipo y un mapa legible, para reconocer foros a simple vista.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** D03
- **Valor:** Medio — acerca el mapa al diseño y mejora la lectura. · **Origen:** U2, X7
- **Estado hoy:** Pines numerados y sin control de ubicación frente al mockup `MapaCultural` (`components/map.js:77`); el lienzo no muestra foco (`styles/app.css:98`).
- **Criterios de aceptación:**
  - Pines con el emblema y color por categoría (en lugar de números) y estados seleccionado y activo.
  - Control de capas (solo foros, solo eventos de hoy) y de ubicación.
  - Contraste suficiente de pines y tarjeta en claro y oscuro.
  - La lista alternativa operable con teclado se mantiene y el lienzo muestra indicador de foco.

#### D06 · Cómo llegar y rutas
*Como persona del público, quiero ver cómo llegar a un foro a pie o en transporte, para planear mi trayecto.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** L · **Fase:** 2 · **Depende de:** D04, D05
- **Valor:** Medio — completa el plan, pero depende de un servicio de rutas. · **Origen:** P8
- **Parte en frontend:** Distancia y tiempo en línea recta, datos de accesibilidad del foro y enlaces a transporte; el trazado de rutas requiere un servicio gestionado de rutas detrás de la capa de servicio (decisión 4: sin Google ni Mapbox).
- **Estado hoy:** No existe; el perfil de foro ofrece «Abrir en Google Maps» (`components/app-pages.js:225`) y el editor pide un «Enlace de Google Maps» (`components/venue-editor.js:132`), contrarios al mapa propio de la decisión 4.
- **Criterios de aceptación:**
  - Muestra distancia y tiempo estimado en línea recta desde mi ubicación o una zona elegida.
  - Si hay servicio de rutas, traza el recorrido sobre el mapa propio y lista pasos accesibles.
  - Indica accesibilidad del foro (rampa, elevador) junto a la ruta.
  - Sin servicio de rutas no promete tiempos exactos.

#### D07 · Recomendaciones locales «Para ti»
*Como persona del público, quiero sugerencias basadas en mis intereses, lo que sigo y lo que guardé, para descubrir cosas nuevas.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** O01, R01, A01, D04
- **Valor:** Alto — da sentido a intereses, seguir y guardar. · **Origen:** def. 5
- **Parte en frontend:** La recomendación colaborativa (lo que hace otra gente) requiere backend.
- **Estado hoy:** Intereses sin uso (`main.js:140`); no hay recomendaciones.
- **Criterios de aceptación:**
  - Rieles «Para ti» y «Parecido a lo que guardaste» calculados en el dispositivo con reglas simples (categoría, zona, fecha).
  - Cada sugerencia explica el motivo («porque sigues a Luna Mestiza»).
  - Se desactivan y se borran desde «Mis datos».
  - Sin datos, se muestra la agenda general.

#### D08 · Rieles temáticos de la home
*Como persona del público, quiero ver «Esta semana», «Gratis» y «En familia» en la home, para elegir sin filtrar.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 2 · **Depende de:** H01, H07
- **Valor:** Medio — descubrimiento sin esfuerzo. · **Origen:** D8
- **Estado hoy:** Home con categorías, 4 eventos, mapa, artistas y foros (`main.js:50-88`); los mockups muestran «8 eventos» y los datos tienen 4.
- **Criterios de aceptación:**
  - Rieles generados con los filtros reparados (fecha, precio, audiencia) y enlazados a `/explorar/` con el filtro aplicado.
  - Un riel sin resultados se oculta.
  - La home cuenta eventos reales («N eventos»), no cifras fijas.

### Convocatorias

#### V01 · Convocatorias útiles (fecha límite, requisitos, estado)
*Como artista, quiero ver convocatorias abiertas con fecha límite, requisitos y a quién van dirigidas, para postularme a tiempo.*

- **Perfil:** artista, foro, organizador, público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 3 · **Depende de:** H01
- **Valor:** Medio — segunda audiencia después del público. · **Origen:** Fase 1 §2
- **Estado hoy:** 2 tarjetas demostrativas con título, descripción y estado (`main.js:217`, `data/convocatorias.json`).
- **Criterios de aceptación:**
  - El modelo incluye `cierra`, `requisitos`, `dirigidaA`, `enlace` y `estado` (abierta, por abrir, cerrada), con filtros por estado y disciplina.
  - Se puede guardar una convocatoria y recibir recordatorio de cierre (N02).
  - Las cerradas se archivan con aviso.
  - Textos aprobados, sin cifras inventadas.

#### V02 · Postulación a convocatorias
*Como artista, quiero postularme a una convocatoria desde Cuicoyan, para no repetir mis datos.*

- **Perfil:** artista, foro · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 3 · **Depende de:** V01, H08
- **Valor:** Medio — cierra el flujo de convocatorias. · **Origen:** Fase 1 §2
- **Parte en frontend:** Formulario por convocatoria con validación, consentimiento y confirmación sobre un canal gestionado; el seguimiento de estado requiere backend.
- **Estado hoy:** Botón «Postulación próximamente» deshabilitado (`main.js:217`); el formulario de registro con folio ya existe (`components/join-form.js:71`).
- **Criterios de aceptación:**
  - El formulario reutiliza datos del perfil (con confirmación) y admite adjuntos con límite.
  - Confirmación con folio y copia exportable de lo enviado.
  - El estado «recibida» solo existe con backend; sin él, un aviso claro.
  - Consentimiento y aviso específicos de la convocatoria.

#### V03 · Gestión de convocatorias por el organizador
*Como organizador, quiero publicar una convocatoria y revisar las postulaciones, para elegir proyectos.*

- **Perfil:** organizador, administrador · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** V02, G01, C01
- **Valor:** Medio — completa el ciclo para quien convoca. · **Origen:** —
- **Parte en frontend:** Formulario de alta, vista de postulaciones y estados; los datos requieren backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Alta y edición de convocatoria con vista previa.
  - Lista de postulaciones con filtros y exportación CSV.
  - Cierre automático por fecha.
  - Notificación de resultados a quienes se postularon.

### Gestión de eventos

#### E01 · Crear y editar eventos (foro o artista)
*Como foro o artista, quiero crear y editar mis eventos, para que el público los encuentre.*

- **Perfil:** foro, artista, organizador · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** L · **Fase:** 3 · **Depende de:** H01, H02, H04, P05
- **Valor:** Alto — alimenta toda la plataforma con contenido propio. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Alta y edición con validación, vista previa, borrador local, duplicar y estados; publicar requiere backend y revisión.
- **Estado hoy:** No existe; los editores solo cubren perfiles (`components/profile-editor.js`, `components/venue-editor.js`).
- **Criterios de aceptación:**
  - Formulario con título, fecha y hora, lugar, artistas, categorías, precio, edad, accesibilidad, imagen y enlace de boletos.
  - Validación de fechas y URLs y vista previa idéntica a la ficha.
  - Borrador local, duplicar evento y estados (borrador, en revisión, publicado, cancelado).
  - Nada es público hasta que se apruebe.

#### E02 · Eventos recurrentes y de varias fechas
*Como foro, quiero publicar una serie (por ejemplo todos los sábados), para no capturar cada fecha.*

- **Perfil:** foro, organizador · **Prioridad:** Could · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 3 · **Depende de:** E01, H01
- **Valor:** Medio — ahorra trabajo a quien programa seguido. · **Origen:** D1
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Regla de recurrencia sencilla (semanal, mensual o fechas sueltas) que genera instancias.
  - Se puede editar una instancia o toda la serie.
  - La agenda y el `.ics` tratan cada instancia.
  - Hay un límite razonable de instancias.

#### E03 · Cambios y cancelaciones visibles
*Como persona con RSVP, quiero enterarme si un evento cambia o se cancela, para no ir en vano.*

- **Perfil:** público, organizador · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 3 · **Depende de:** E01, N01, A01
- **Valor:** Alto — evita viajes en vano. · **Origen:** D1
- **Parte en frontend:** Estados «cambiado» y «cancelado» visibles y detección local de diferencias entre lo que guardaste y los datos actuales; el aviso activo a asistentes requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - El estado cancelado o reprogramado aparece en ficha, tarjeta y agenda; la fecha anterior sigue visible.
  - El cambio genera un aviso en el centro de avisos (N01) al detectarlo.
  - El `.ics` se actualiza al exportar de nuevo.
  - El evento no se borra: queda como histórico.

#### E04 · Campos de evento estructurados (precio, edad, idioma, accesibilidad)
*Como persona del público, quiero ver precio, edad recomendada, idioma y accesibilidad de cada evento de forma uniforme, para saber si es para mí.*

- **Perfil:** público, organizador · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 2 · **Depende de:** H02
- **Valor:** Alto — habilita los filtros avanzados y la protección de menores. · **Origen:** D4, D7
- **Estado hoy:** `priceLabel` y `audience` son texto libre (`data/events.json`); la accesibilidad vive solo en el foro (`services/profile-draft.service.js:22`).
- **Criterios de aceptación:**
  - Campos estructurados: `price` (tipo y monto), `ageMin`, `language`, `accessibility[]` y `ticketUrl`; la etiqueta se genera del dato.
  - Los foros heredan accesibilidad por defecto y el evento puede sobrescribirla.
  - Los filtros de D01 usan estos campos.
  - Sin dato se muestra «Por confirmar».

### Panel de organizador

#### G01 · Panel de organizador
*Como organizador, quiero un panel con mis perfiles, eventos, borradores y estados, para gestionar todo desde un lugar.*

- **Perfil:** organizador, foro, artista · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 3 · **Depende de:** E01, P05, H04
- **Valor:** Medio — ordena el trabajo de quien publica. · **Origen:** P5
- **Parte en frontend:** Lista de perfiles y eventos con estados y acciones; el permiso y la sesión reales requieren backend.
- **Estado hoy:** Selector de registro de pruebas en `/perfil/` (`main.js:183-216`, `config/test-access.js:3`).
- **Criterios de aceptación:**
  - Lista de perfiles y eventos con estado (borrador, revisión, publicado) y acciones rápidas.
  - Alertas de pendientes (campos faltantes, evento próximo sin imagen).
  - Vistas vacías con guía de primeros pasos.
  - Solo visible con permiso o sesión (con la bandera de entorno en staging).

#### G02 · Métricas básicas
*Como organizador, quiero ver vistas, guardados y RSVP de mis eventos, para saber qué funciona.*

- **Perfil:** organizador, foro, artista · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** G01, C01, H08
- **Valor:** Medio — retroalimentación para quien publica. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Tableros, definiciones de cada métrica y estados «sin datos»; medir requiere backend o analítica gestionada con consentimiento.
- **Estado hoy:** No existe; las fichas dicen «sin métricas» (`components/app-pages.js:208`).
- **Criterios de aceptación:**
  - Métricas agregadas por evento y periodo (vistas, guardados, «Voy», compartidos), sin datos personales de individuos.
  - Definición visible de cada métrica y de su margen de error.
  - Exportación CSV.
  - Medición solo con consentimiento y aviso (decisión 5).

#### G03 · Roles y equipo
*Como foro, quiero invitar a mi equipo con roles distintos, para repartir la edición.*

- **Perfil:** foro, organizador, administrador · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** C01, G01
- **Valor:** Bajo — útil cuando haya más de una persona por perfil. · **Origen:** Fase 1 §2
- **Parte en frontend:** Pantalla de invitación y roles (editor, solo lectura) con estados; los permisos reales requieren backend.
- **Estado hoy:** Invitación y aceptación existen con Supabase (`main.js:151-182`), sin roles.
- **Criterios de aceptación:**
  - Invitar por correo con rol y caducidad.
  - Cambiar o revocar el acceso en cualquier momento.
  - Registro de quién editó qué.
  - Reutiliza el flujo de invitación existente.

### Moderación y confianza

#### Y01 · Reportar contenido
*Como persona del público, quiero reportar un perfil, publicación o comentario inapropiado, para mantener sano el espacio.*

- **Perfil:** todos · **Prioridad:** Should · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** H08, Y04
- **Valor:** Alto — condición mínima antes de contenido de terceros. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Botón «Reportar» con motivos, descripción y confirmación, enviado por un canal gestionado (formulario); la cola y las acciones requieren backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - «Reportar» accesible en perfiles, publicaciones y comentarios con motivos predefinidos.
  - Confirmación con folio y sin exponer a quien reporta.
  - Incluye el enlace y lo mínimo necesario; no pide más datos personales.
  - Limitación de abuso del lado cliente (una vez por contenido y periodo).

#### Y02 · Cola de moderación y acciones
*Como administrador, quiero revisar reportes y actuar sobre el contenido, para retirar lo que incumple las normas.*

- **Perfil:** administrador · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** Y01, C01
- **Valor:** Alto — sin moderación no se puede abrir contenido de terceros. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Pantallas de revisión (lista, detalle, acciones, motivo) y estados; el trabajo real es backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Cola con prioridad, filtros y estados (nuevo, en revisión, resuelto).
  - Acciones: ocultar, advertir, suspender y restaurar, todas con motivo y registro.
  - Apelación de la persona autora.
  - Métricas de tiempo de respuesta.

#### Y03 · Bloqueo y silencio
*Como usuario, quiero bloquear o silenciar a otra persona, para dejar de ver su actividad y que no me contacte.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (c) requiere backend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** C01, P04
- **Valor:** Medio — protección personal, depende de mensajes y comentarios. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Controles y listas en ajustes; el efecto real requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Bloquear o silenciar desde perfil, comentario o conversación, reversible desde ajustes.
  - La persona bloqueada no puede seguir, comentar ni escribir.
  - No se avisa a la otra parte.

#### Y04 · Normas de la comunidad y políticas visibles
*Como persona del público, quiero conocer las normas y qué pasa si algo se reporta, para saber qué esperar.*

- **Perfil:** todos · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 4 · **Depende de:** H08
- **Valor:** Alto — requisito previo a cualquier función social pública. · **Origen:** P3, decisión 5
- **Parte en frontend:** El texto legal lo aprueba la persona responsable (decisión 5); aquí solo la página, el versionado y los enlaces.
- **Estado hoy:** Términos y privacidad son provisionales «pendiente de aprobación» (`main.js:218`).
- **Criterios de aceptación:**
  - Página de normas, términos y política de retiro, enlazada desde cada superficie de contenido.
  - Texto aprobado por la persona responsable, con versión y fecha visibles.
  - Explica edad mínima y contenido no permitido (por definir).
  - Resumen en lenguaje claro.

#### Y05 · Administración de perfiles y verificación
*Como administrador, quiero revisar perfiles enviados y otorgar o retirar la verificación, para que lo publicado sea confiable.*

- **Perfil:** administrador · **Prioridad:** Should · **Viabilidad:** (c) requiere backend · **Esfuerzo:** L · **Fase:** 5 · **Depende de:** P05, P06, Y02
- **Valor:** Medio — cierra el ciclo de P05 y P06. · **Origen:** Fase 2 §4.2
- **Parte en frontend:** Pantallas de revisión de perfiles y convocatorias con estados; datos y permisos son backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Cola de perfiles enviados con comparación contra lo publicado.
  - Aprobar, devolver con comentario o rechazar, con registro de auditoría.
  - Otorgar y retirar la verificación.
  - Panel visible solo para administradores.

### Internacionalización

#### L01 · Capa de internacionalización
*Como visitante de habla inglesa o de otra lengua, quiero usar Cuicoyan en mi idioma, para entender la oferta cultural de la ciudad.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** —
- **Valor:** Medio — amplía audiencia (turismo), sin ser núcleo. · **Origen:** —
- **Estado hoy:** Textos en español dentro de los módulos JS; `Intl` solo en un punto (`services/content.service.js:84`); `lang="es-MX"` fijo en cada HTML.
- **Criterios de aceptación:**
  - Los textos salen de diccionarios (es-MX por defecto, inglés opcional) en lugar de estar en el código; fechas, monedas y plurales usan `Intl`.
  - Un selector de idioma recordado y el atributo `lang` correcto en `<html>` y fragmentos.
  - El contenido editorial puede tener versión por idioma o se marca «solo en español».
  - Las rutas conservan el mismo slug.

### Accesibilidad

#### X01 · Cierre de brechas WCAG 2.2 AA
*Como persona con baja visión, discapacidad motriz o que usa lector de pantalla, quiero usar toda la app con teclado y lector, para participar igual que cualquiera.*

- **Perfil:** todos · **Prioridad:** Must · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H09
- **Valor:** Alto — derecho de acceso y requisito de calidad. · **Origen:** X1-X9
- **Estado hoy:** `.ev-tag` 3.37:1 y «Ver perfil» 4.42:1 (medidos en la Fase 2); pie de 21 px de alto; pestañas sin `tabpanel` (`components/app-pages.js:86,110`, `components/join-form.js:116-117`); foco en `<body>` tras un error de «Únete» (`components/join-form.js:143`); menú sin Escape (`components/shell.js:78-79`).
- **Criterios de aceptación:**
  - Contraste de 4.5:1 en texto pequeño (etiquetas, «Ver perfil», precio) y 3:1 en componentes, en claro y oscuro.
  - Objetivos táctiles de 24 px o más (pie, casillas) o con espaciado conforme.
  - Pestañas con el patrón completo (`tabpanel`, flechas), foco al primer error de formulario y Escape con retorno de foco en el menú.
  - axe sin violaciones críticas y recorrido manual con VoiceOver y NVDA documentado.

#### X02 · Preferencias de accesibilidad
*Como persona con necesidades específicas, quiero ajustar tamaño de texto, contraste y movimiento, para leer cómodamente.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** X01
- **Valor:** Medio — personalización más allá del tema. · **Origen:** X8
- **Estado hoy:** Solo `prefers-reduced-motion` global (`styles/global.css:148`); sin `forced-colors` ni `prefers-contrast`; el fondo decorativo aparece en todas las páginas.
- **Criterios de aceptación:**
  - Ajustes de tamaño de texto, alto contraste (respetando `forced-colors` y `prefers-contrast`), reducir movimiento manual y espaciado.
  - Se aplican en todas las rutas y se guardan en «Mis datos».
  - Modo lectura sin fondo decorativo.
  - Quien publica puede editar la descripción de sus imágenes.

### Sin conexión y PWA

#### W01 · App instalable (PWA)
*Como persona del público, quiero instalar Cuicoyan en mi teléfono, para abrirla como una app.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** S · **Fase:** 2 · **Depende de:** H05
- **Valor:** Medio — la dock inferior ya se comporta como app. · **Origen:** A8
- **Estado hoy:** El manifiesto solo se enlaza desde la home (1 de 32 HTML) y solo trae iconos claros (`public/site.webmanifest`); sin service worker.
- **Criterios de aceptación:**
  - El manifiesto está enlazado en todas las páginas, con iconos claro y oscuro, `theme-color`, `start_url` y `scope` correctos.
  - Aviso de instalación discreto y descartable.
  - Pasa las comprobaciones de instalabilidad (por verificar: no se ejecutó Lighthouse en esta auditoría).
  - Las rutas profundas abren dentro de la app.

#### W02 · Service worker y caché
*Como persona con mala señal, quiero ver mis favoritos, mi agenda y la última cartelera sin conexión, para consultarla en el metro.*

- **Perfil:** público · **Prioridad:** Should · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** L · **Fase:** 2 · **Depende de:** W01, H05, H11
- **Valor:** Alto — uso real en transporte público. · **Origen:** A8
- **Estado hoy:** No existe (sin coincidencias de `serviceWorker` en el código).
- **Criterios de aceptación:**
  - Caché del shell, JSON, imágenes y estilos con estrategia por recurso y versión, y aviso «hay una versión nueva».
  - Favoritos, agenda y fichas ya vistas abren sin conexión y las acciones locales siguen funcionando.
  - Indicador claro de «sin conexión» y de datos desactualizados.
  - La caché tiene límite y se vacía desde «Mis datos».

#### W03 · Mapa sin conexión
*Como persona que recorre la ciudad, quiero descargar el mapa de una zona, para consultarlo sin datos.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (a) completa en frontend · **Esfuerzo:** M · **Fase:** 2 · **Depende de:** W02, D03
- **Valor:** Medio — útil con mala cobertura. · **Origen:** A7
- **Estado hoy:** El PMTiles (22.9 MB) se lee por rangos HTTP 206 (`src/assets/cartografia/mapas/cdmx.pmtiles`, verificado en la Fase 2).
- **Criterios de aceptación:**
  - Descarga opcional por región del archivo de cartografía (PMTiles) con tamaño visible y confirmación en datos móviles.
  - Se puede borrar desde «Mis datos».
  - Sin descarga, el mapa funciona con red (rangos, como hoy).
  - Manejo de cuota y de errores.

#### W04 · Acciones en cola sin conexión
*Como persona sin conexión, quiero que lo que marque se aplique cuando regrese la señal, para no repetirlo.*

- **Perfil:** público · **Prioridad:** Could · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 5 · **Depende de:** W02, H03, C01
- **Valor:** Medio — robustez para el flujo con cuenta. · **Origen:** A8
- **Parte en frontend:** Cola local de acciones (guardar, seguir, RSVP) con reintentos y vista de pendientes; sincronizar requiere backend.
- **Estado hoy:** No existe.
- **Criterios de aceptación:**
  - Las acciones se aplican al instante en local y se marcan «pendientes».
  - Al reconectar se envían en orden con reintentos y los conflictos se informan.
  - Se puede ver y cancelar lo pendiente.
  - Sin cuenta, nada sale del dispositivo.

### Privacidad y legal

#### Z01 · Edad y contenido sensible
*Como madre, padre o tutor, quiero saber qué eventos son aptos para menores y que la plataforma proteja su privacidad, para dejar que la usen.*

- **Perfil:** público, administrador · **Prioridad:** Could · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 4 · **Depende de:** E04, Y04
- **Valor:** Alto — riesgo regulatorio y de confianza antes de abrir funciones sociales. · **Origen:** Decisión 5
- **Parte en frontend:** Filtros y etiquetas de edad por evento (`ageMin`), pantalla informativa y valores por defecto restrictivos; verificar edad o consentimiento parental es decisión legal y requiere backend.
- **Estado hoy:** `audience` es texto libre («Recomendado a partir de 5 años», «Mayores de 15 años») (`data/events.json`).
- **Criterios de aceptación:**
  - Etiquetas y filtro «Apto para menores» derivados de `ageMin`.
  - Declaración de edad opcional con textos legales aprobados.
  - Mensajería y perfil público apagados por defecto para menores (supuesto, decisión 5).
  - No se piden datos personales a menores.

#### Z02 · Derechos ARCO
*Como persona que dio sus datos en «Únete», quiero pedir acceso, rectificación, cancelación u oposición, para ejercer mis derechos.*

- **Perfil:** público, artista, foro · **Prioridad:** Must · **Viabilidad:** (b) parcial en frontend · **Esfuerzo:** M · **Fase:** 1 · **Depende de:** H08
- **Valor:** Alto — hoy se promete eliminación sin canal. · **Origen:** P3
- **Parte en frontend:** Página informativa y formulario de solicitud con folio; la atención de solicitudes es un proceso humano o de backend y el texto legal depende de la persona responsable (decisión 5).
- **Estado hoy:** La casilla de consentimiento promete eliminación sin canal (`components/join-form.js:123-125`); el aviso es provisional (`main.js:218`).
- **Criterios de aceptación:**
  - Página y formulario ARCO enlazados desde el aviso de privacidad y desde los formularios.
  - El aviso nombra al responsable, finalidades, transferencias (FormSubmit) y plazos, con texto aprobado.
  - Confirmación con folio.
  - La solicitud no exige más datos de los necesarios.

## 5. Mapa de dependencias

### 5.1 Qué desbloquea cada habilitador

Número de funcionalidades que dependen, directa o indirectamente, de cada una (solo las 12 más cargadas).

| ID | Funcionalidad | Fase | Desbloquea |
|---|---|---|---|
| H03 | Capa de servicios asíncrona y adaptador de almacenamiento | 0 | 47 |
| H02 | Modelo de relaciones evento–foro–artista | 0 | 39 |
| H08 | Privacidad: aviso, consentimiento y «Mis datos locales» | 0 | 33 |
| H01 | Fechas ISO y zona horaria en eventos | 0 | 30 |
| C01 | Cuentas y sesión de usuario | 5 | 21 |
| H05 | Enrutador con respaldo SPA, 404 propia y HTML por slug en la build | 0 | 17 |
| R01 | Seguir artistas y foros (local) | 1 | 15 |
| H04 | Borrador separado de lo publicado | 3 | 14 |
| P05 | Del borrador a la revisión: solicitar publicación | 3 | 11 |
| I01 | Guardar con deshacer, orden y marca de pasados | 1 | 10 |
| A01 | RSVP: «Voy» y «Me interesa» | 1 | 10 |
| H06 | Ciclo de vida de pantallas (montaje idempotente) | 0 | 9 |

### 5.2 Cadena del núcleo público (seguir + guardar + RSVP)

```text
I05 Compartir
  H05 Enrutador con respaldo SPA, 404 propia y HTML por slug en la build
  H01 Fechas ISO y zona horaria en eventos
A03 Exportar a calendario (.ics)
  H01 Fechas ISO y zona horaria en eventos
A02 Agenda personal
  A01 RSVP: «Voy» y «Me interesa»
    H01 Fechas ISO y zona horaria en eventos
    H03 Capa de servicios asíncrona y adaptador de almacenamiento
  H01 Fechas ISO y zona horaria en eventos
  I01 Guardar con deshacer, orden y marca de pasados
    H01 Fechas ISO y zona horaria en eventos
    H03 Capa de servicios asíncrona y adaptador de almacenamiento
R01 Seguir artistas y foros (local)
  H02 Modelo de relaciones evento–foro–artista
  H03 Capa de servicios asíncrona y adaptador de almacenamiento
D03 Mapa con selección por foro (`?foro=`) y lista sincronizada
  H02 Modelo de relaciones evento–foro–artista
```

**Lectura:** el camino más corto al núcleo pasa por **H01** (fechas), **H02** (relaciones), **H03** (servicios asíncronos) y **H05** (rutas y vista previa de enlaces). Sin ellos, RSVP, agenda, `.ics` y compartir se construirían sobre datos de texto y habría que rehacerlos.

## 6. Lo que queda «requiere backend»

Qué se prepara en frontend (interfaces, flujos, estados vacíos, capa de servicio) para conectar el servidor tocando un solo punto (H03).

### 6.1 Requiere backend (c)

| ID | Funcionalidad | Fase | Qué se prepara en frontend |
|---|---|---|---|
| C01 | Cuentas y sesión de usuario | 5 | Pantallas de registro, ingreso, cierre y recuperación, validación, estados de carga, error y vacío, y un `auth.service` con interfaz estable. El motor (Supabase ya presente) es supuesto b: no se rediseña. |
| P04 | Privacidad del perfil de usuario | 5 | Pantalla de ajustes con tres niveles (público, solo seguidores, privado) y vista previa «así te ven». |
| P06 | Verificación e insignia | 5 | Campo `verified` en el modelo, insignia accesible y página «Qué significa verificado». |
| R03 | Seguidores y contadores | 5 | Componente de contador, lista paginada y estado «aún sin datos»; el conteo real requiere backend. |
| R04 | Colectivos y miembros | 5 | Campo `integrantes` y sección en el perfil; el vínculo verificado requiere backend. |
| B02 | Feed «Mi tribu» | 4 | Lista, paginación, estados cargando, vacío y error y filtros por tipo sobre un servicio `posts` con implementación vacía; el contenido requiere backend. |
| B03 | Detalle de publicación | 4 | Pantalla, URL propia y estados (no disponible, eliminada); los datos requieren backend. |
| B04 | Crear publicación de texto | 4 | Compositor con contador, validación, borrador local y vista previa; publicar requiere backend. |
| I03 | Reacciones (me gusta) | 4 | Botón ♥ con estados, contador optimista y reversión; persistir y contar requiere backend. |
| I04 | Comentarios | 4 | Lista, hilo de un nivel, formulario con validación, estados, borrar el propio y «Reportar»; todo lo demás es backend. |
| M01 | Mensajes directos | 5 | Solo la interfaz (bandeja, conversación, estados) sobre un servicio vacío; todo lo demás es backend. |
| N03 | Push y correo | 5 | Preferencias, consentimiento y plantillas en la interfaz; el envío real requiere backend. |
| A04 | Reservas, cupo y boletos | 5 | Mostrar precio y enlace al canal oficial del organizador (`ticketUrl`) con la aclaración de que Cuicoyan no cobra; cupo, lista de espera y pago requieren backend y pasarela. |
| A05 | Asistentes y «quién va» | 5 | Contador y avatares opcionales con estado vacío; los datos requieren backend. |
| K01 | Reseñas de foros | 5 | Formulario (valoración y texto), lista, resumen y estados; guardar y moderar requiere backend. |
| K02 | Grupos y comunidades por interés | 5 | Interfaz de listado, ficha y membresía sobre un servicio vacío. |
| V03 | Gestión de convocatorias por el organizador | 5 | Formulario de alta, vista de postulaciones y estados; los datos requieren backend. |
| G02 | Métricas básicas | 5 | Tableros, definiciones de cada métrica y estados «sin datos»; medir requiere backend o analítica gestionada con consentimiento. |
| G03 | Roles y equipo | 5 | Pantalla de invitación y roles (editor, solo lectura) con estados; los permisos reales requieren backend. |
| Y02 | Cola de moderación y acciones | 5 | Pantallas de revisión (lista, detalle, acciones, motivo) y estados; el trabajo real es backend. |
| Y03 | Bloqueo y silencio | 5 | Controles y listas en ajustes; el efecto real requiere backend. |
| Y05 | Administración de perfiles y verificación | 5 | Pantallas de revisión de perfiles y convocatorias con estados; datos y permisos son backend. |

### 6.2 Parciales (b): la parte que sí necesita servidor

| ID | Funcionalidad | Fase | Parte en frontend (y qué queda para el servidor) |
|---|---|---|---|
| H03 | Capa de servicios asíncrona y adaptador de almacenamiento | 0 | Interfaces de repositorio por entidad (eventos, artistas, foros, favoritos, siguiendo, RSVP, borradores, preferencias) con implementación local; la implementación contra la API queda como punto de conexión (supuesto b), sin diseñarla. |
| H04 | Borrador separado de lo publicado | 3 | Modelo `draft` frente a `published`, vista previa y estados; la publicación real requiere backend (existe `POST …/profile/submit`, supuesto b). |
| C02 | Migración de datos locales a la cuenta | 5 | Asistente de combinación con vista previa, resolución de conflictos y confirmación; la escritura real requiere backend. |
| P05 | Del borrador a la revisión: solicitar publicación | 3 | Flujo y estados (borrador, en revisión, publicado, devuelto) con comentarios de revisión; la cola real requiere backend (existe `POST …/profile/submit`, supuesto b). |
| B05 | Crear publicación con imágenes | 4 | Selección, recorte, recompresión en el navegador, quita de metadatos EXIF, texto alternativo y límites; la subida requiere backend y almacenamiento. |
| B06 | Publicación de evento | 4 | Plantilla «anunciar evento» que enlaza un evento existente y precarga datos; publicar requiere backend. |
| B07 | Sección «Publicaciones» en perfiles | 4 | Sección, rejilla o lista, interruptor `sections.posts` funcional y estado vacío; los datos requieren backend. |
| M02 | Contacto con foros y artistas por formulario | 3 | Formulario con consentimiento, validación y confirmación detrás de un servicio de envío (hoy FormSubmit); no hay buzón propio. |
| N01 | Centro de avisos (campana) | 2 | Bandeja local con avisos derivados de la agenda y de lo que sigues («mañana: …», «cambió la fecha de …» al detectar cambios en los datos); los avisos originados por otras personas requieren backend. |
| N02 | Recordatorios de evento | 2 | Alarma VALARM en el `.ics` (completo en frontend) y notificaciones del navegador con la app abierta o instalada; avisos push con la app cerrada requieren backend. |
| A01 | RSVP: «Voy» y «Me interesa» | 1 | Estado propio persistido en local y mostrado en tarjetas y agenda; el conteo de asistentes y «quién va» requieren backend (A05). |
| D06 | Cómo llegar y rutas | 2 | Distancia y tiempo en línea recta, datos de accesibilidad del foro y enlaces a transporte; el trazado de rutas requiere un servicio gestionado de rutas detrás de la capa de servicio (decisión 4: sin Google ni Mapbox). |
| V02 | Postulación a convocatorias | 3 | Formulario por convocatoria con validación, consentimiento y confirmación sobre un canal gestionado; el seguimiento de estado requiere backend. |
| E01 | Crear y editar eventos (foro o artista) | 3 | Alta y edición con validación, vista previa, borrador local, duplicar y estados; publicar requiere backend y revisión. |
| E03 | Cambios y cancelaciones visibles | 3 | Estados «cambiado» y «cancelado» visibles y detección local de diferencias entre lo que guardaste y los datos actuales; el aviso activo a asistentes requiere backend. |
| G01 | Panel de organizador | 3 | Lista de perfiles y eventos con estados y acciones; el permiso y la sesión reales requieren backend. |
| Y01 | Reportar contenido | 4 | Botón «Reportar» con motivos, descripción y confirmación, enviado por un canal gestionado (formulario); la cola y las acciones requieren backend. |
| W04 | Acciones en cola sin conexión | 5 | Cola local de acciones (guardar, seguir, RSVP) con reintentos y vista de pendientes; sincronizar requiere backend. |
| Z01 | Edad y contenido sensible | 4 | Filtros y etiquetas de edad por evento (`ageMin`), pantalla informativa y valores por defecto restrictivos; verificar edad o consentimiento parental es decisión legal y requiere backend. |
| Z02 | Derechos ARCO | 1 | Página informativa y formulario de solicitud con folio; la atención de solicitudes es un proceso humano o de backend y el texto legal depende de la persona responsable (decisión 5). |

Sin diseñar: cuentas reales y sesión, persistencia en servidor, conteos (seguidores, asistentes, reacciones), tiempo real, push y correo, moderación, verificación, mensajería, rutas calculadas y pagos.

## 7. Decisiones abiertas y riesgos

| Tema | Riesgo | Decisión abierta | Funcionalidades |
|---|---|---|---|
| LFPDPPP y aviso integral | Aviso provisional, sin responsable, finalidades ni derechos ARCO; FormSubmit recibe nombre, correo y celular | Quién es el responsable y qué texto se aprueba | H08, Z02, M02, V02 |
| Menores | Eventos «para todas las edades» y contenido de terceros | Edad mínima, consentimiento parental y restricciones de mensajería | Z01, M01, K02, P04 |
| Contenido sensible y de terceros | Imágenes de personas, derechos de autor, reportes | Política de contenido, retiro y quién modera | Y01–Y05, B03–B06, I04 |
| Geolocalización | `help.json` la niega; «cerca de mí» la requiere | Cuándo se pide, qué se guarda (propuesta: nada) y retención | D04, O02 |
| Servicios gestionados | Cualquier proveedor es una transferencia de datos | Qué proveedores (formularios, rutas, analítica, notificaciones) y con qué contrato; siempre tras una capa de servicio (decisión 4) | M02, Y01, V02, D06, G02, N03 |
| Mapa propio | Enlaces «Abrir en Google Maps» contradicen el espíritu de la decisión 4 | Sustituirlos por mapa propio o enlace neutro | D06, P02 |
| Moderación | Abrir comentarios y mensajes sin cola ni normas | Que Y04 y Y01 estén antes de B04–B06, I03 e I04 | Y01–Y04 |

## 8. Límites de esta fase

- Los esfuerzos S/M/L son estimaciones relativas mías **[S]**, no mediciones.
- Las afirmaciones de «Estado hoy» salen de la Fase 2 (verificadas en navegador o por código); no repetí la verificación.
- No se ejecutó Lighthouse, axe ni pruebas en dispositivos; los criterios que las mencionan son **objetivos**, no resultados.
- No vi 3 mockups de variantes por categoría (ver Fase 2 §1); no afectan a este catálogo.
- No se diseñó ninguna pantalla ni modelo de datos: los campos citados (`startsAt`, `artistIds`, `ageMin`…) son nombres de trabajo.
- Las dependencias de la Fase 4 y 5 con C01 (cuentas) indican integración; la interfaz de esas funciones se puede construir antes.

## 9. Preguntas (máximo 5)

1. **Feed antes del backend.** ¿Construimos la interfaz completa del feed y las publicaciones (Fase 4) antes de tener servidor, o solo los componentes base (B01) y se espera? **Recomendado:** solo B01 y las rutas con estado vacío hasta que existan backend y política de moderación; así no se maqueta algo sin datos.
2. **Herramienta de build.** Para H11 (carga diferida, empaquetado) ¿se acepta una herramienta de build como dependencia de **desarrollo**, sin dependencias de ejecución? **Recomendado:** sí (`vite.config.js` ya la anticipa); alternativa: solo `import()` dinámico nativo, con menos ganancia.
3. **«Organizador».** ¿Es un tipo de perfil propio o un rol dentro de un foro o artista? **Recomendado:** rol dentro de foro o artista (G03), no un perfil nuevo.
4. **Canal de formularios.** M02, Y01, V02 y Z02 necesitan reemplazar FormSubmit por un servicio gestionado con política de privacidad y borrado. ¿Se elige antes de la Fase 3? **Recomendado:** sí, tras una capa `form.service`, con contrato y ubicación de datos definidos.
5. **Recordatorios.** Las notificaciones del navegador (N02) exigen service worker y permiso. ¿Se acepta empezar con `.ics` + alarma (A03, Fase 1) y dejar las notificaciones para la Fase 2? **Recomendado:** sí.
