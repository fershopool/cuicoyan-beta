# Plan de implementación para Luna 5.6 — Cuicoyan

**Tipo de documento:** instrucciones ejecutables para convertir las referencias Stitch en una plataforma cultural estática navegable.

**Alcance confirmado:** sitio independiente, sin backend, sin base de datos, sin autenticación ni cuentas. La salida debe ser un frontend que pueda compilarse a `dist/` y subirse a hosting estático.

---

## 1. Misión de Luna

Reconstruir Cuicoyan como portal cultural responsive de descubrimiento y participación: una persona debe poder entender la propuesta, explorar contenidos de demostración, filtrar por intención/categoría, abrir detalles, consultar una vista de mapa conceptual y guardar preferencias de manera anónima/local. Los mockups y PNG son referencias visuales; no son código de producción ni autorización para inventar eventos, personas, foros, precios o accesibilidad.

La implementación debe seguir [`../../AAA.Base/web/arquitectura.md`](../../AAA.Base/web/arquitectura.md): cada pantalla en su carpeta, HTML/CSS/JS separados, componentes compartidos, servicios para datos, configuración pública, utilidades, estados y pruebas.

---

## 2. Decisiones confirmadas y definición de funcionalidad

### 2.1 Stack y almacenamiento

- HTML5 semántico, CSS modular, JavaScript nativo con ES modules.
- Vite únicamente como build/dev server MPA; no framework.
- No Tailwind CDN, Google Fonts remoto, Material Symbols remoto ni JavaScript inline en producción.
- No backend, base de datos, CMS, login, cuentas, perfiles remotos ni sesiones.
- Datos de eventos/artistas/foros/categorías en JSON local, cada registro con `contentStatus`, `source` y `isDemo`.
- Tema, onboarding e intereses y favoritos solo con `localStorage` versionado y namespace `cuicoyan:v1`; nunca almacenar PII.
- Formularios de registro, contacto, newsletter, reportes o privacidad no deben fingir éxito. Sin canal real configurado, mostrar “Próximamente”/“Canal pendiente”. Con URL o correo aprobado, usar solo enlace externo configurable.
- Mapa local conceptual/SVG con lista alternativa; no pedir geolocalización ni cargar tiles externos por defecto.

### 2.2 Comportamientos que sí deben funcionar

- Navegación entre las rutas públicas y anclas.
- Búsqueda unificada por texto, categoría, intención, fecha/zona/precio solo cuando el dato local exista.
- Filtros serializados en `URLSearchParams`; volver atrás y compartir conserva el estado.
- Cards de evento, artista y foro con rutas reales y relaciones locales.
- Favorito anónimo con anuncio accesible; si `localStorage` falla, degradar a memoria.
- Toggle claro/oscuro que respeta `prefers-color-scheme` y guarda preferencia.
- Menú móvil, tabs, accordions, modales, paginación local, view switcher y estados de carga/vacío/error.
- Mapa con pins conceptuales y lista sincronizada; ningún dato geográfico se presenta como verificado si no tiene fuente.

---

## 3. Fuentes de verdad

Leer completamente antes de crear archivos:

1. `../../AAA.Base/web/arquitectura.md` — estructura de capas, HTML estándar, servicios, estados, comentarios, nombres, accesibilidad y seguridad.
2. `general.md` — producto, tono, identidad, alcance, paleta, responsive y claims autorizados.
3. `pantalla.md` — ficha canónica de Home `CUI-WEB-HOME-001`, copy exacto, secciones, rutas y criterios.
4. `neo_mexicano_vivo/DESIGN.md` — referencia visual secundaria.
5. Assets locales de identidad y referencias en `stitch_cuicoyan_app_landing_page`.
6. `code.html` y `screen.png` — composición y lenguaje visual; no hechos ni contratos de backend.

Si hay conflicto, el orden es arquitectura → `general.md` → `pantalla.md` → assets aprobados → mockups. La carpeta `Cuicoyan/Mockups` puede consultarse como referencia adicional, pero no debe copiarse dentro de la interfaz como captura.

---

## 4. Inventario y diagnóstico auditado

### 4.1 Conteo

- 27 archivos `code.html`.
- 26 implementaciones únicas: `home_descubre_la_cultura_cerca_de_ti_1` y `_2` son idénticos byte por byte; `_1` no tiene captura propia.
- 43 capturas `screen.png` de páginas.
- 17 carpetas contienen solo referencias PNG sin HTML.
- `logo.svg` local, pero ninguna pantalla lo utiliza.
- `general.md`, `pantalla.md` e `iteraciones.md` están duplicados dentro y fuera de la carpeta Stitch.
- `neo_mexicano_vivo/DESIGN.md` existe como referencia de identidad.
- Los mockups móviles de Home incluyen “CARAVANA”; comprobar si es marca residual. No llevarlo al producto sin confirmación.
- Las rutas `sources/...` y `Cuicoyan-4K.png` mencionadas por los documentos no existen dentro de `web`; las referencias equivalentes están fuera o pendientes.

### 4.2 Problemas técnicos medidos

- 27/27 páginas sin `<title>` ni meta description.
- Aproximadamente 893 de 1,057 enlaces usan `href="#"`.
- 139 controles de formulario sin `name`.
- 11 formularios sin solicitudes reales.
- 112 de 176 imágenes sin `alt` válido; `data-alt` no sustituye `alt`.
- 113 botones sin `type` explícito.
- 124 handlers inline.
- Cero llamadas `fetch`, persistencia o autenticación.
- Todas las páginas repiten Tailwind config, CSS, header, footer y scripts.
- Las imágenes llegan de `lh3.googleusercontent.com` (219 referencias, unas 154 URLs únicas según el inventario) y pueden caducar o no tener derechos.
- Tema solo cambia clase `dark`; no persiste ni anuncia estado de forma completa.
- Mapa grande es una ilustración con pines, no un mapa geográfico real.

### 4.3 Claims y datos no publicables

Retirar, sustituir por `Contenido de demostración` o marcar `Por confirmar` cualquier cifra, precio, teléfono, dirección, horario, aforo, rating, testimonio, evento, persona, accesibilidad, alianza, correo o tecnología no entregada por una fuente aprobada. Ejemplos detectados: `380+ artistas`, `340+ espacios`, `142 recintos`, `84 eventos`, sedes/horarios cambiantes de “Sones del barrio”, “cero comisiones”, validaciones WCAG o soberanía de datos.

---

## 5. Consolidación de variantes y rutas

### 5.1 Rutas publicables de la primera entrega

| Ruta | Fuente canónica | Tratamiento |
|---|---|---|
| `/` | `home_descubre..._2` o `_1` | Una Home; eliminar duplicado. `home_en_modo_oscuro...` se convierte en tema, no ruta. |
| `/explorar/` | `explorar_categor_as...` + `resultados_de_b_squeda...` | Índice y resultados combinados; filtros en URL. |
| `/eventos/` | `cartelera_y_eventos...` | Listado local de demostración con filtros/orden/view switcher. |
| `/eventos/sones-del-barrio/` | `sones_del_barrio...` | Detalle; todos los datos deben ser claramente demostrativos o validados. No reservar, cobrar ni comprar. |
| `/artistas/` | `artistas_y_colectivos...` | Directorio local; búsqueda/filtros sin perfiles autenticados. |
| `/artistas/<slug>/` | `perfil_artista.png` como referencia | Crear solo si hay contenido de demostración aprobado; no inventar identidad. |
| `/foros/` | `foros_y_espacios..._cuicoyan` | Directorio local; sin teléfonos/horarios inventados. |
| `/foros/foro-alicia/` | `foro_alicia_perfil...` | Detalle con información verificada o marcado demo. |
| `/mapa/` | `mapa_cultural_vivo...` + `mapacultural.png` | Mapa local/conceptual y lista; no geolocalización persistente ni proveedor externo. |
| `/para-creadores/` | `para_creadores..._3` | Beneficios y roles; sin garantías, métricas o comisiones afirmadas. |
| `/unete/` | `registro_de_artistas_y_foros...` | Página explicativa; formulario deshabilitado hasta destino aprobado. `?rol=artista|foro` solo cambia copy local. |
| `/convocatorias/` | `convocatorias...` | Solo lista local de ejemplo; no postulación ni fechas reales. |
| `/sobre-cuicoyan/` | `sobre...ecosistema_comunitario` | Propósito/misión; fusionar la variante de soporte. |
| `/ayuda/` | `centro_de_ayuda...` y soporte | FAQ local; no ticket si no hay canal. |
| `/accesibilidad/` | `accesibilidad...` | Compromiso y mecanismo pendiente; no afirmar accesibilidad de espacios sin verificación. |
| `/privacidad/` | `aviso_de_privacidad...` | Documento pendiente/validado; no inventar responsable. |
| `/terminos/` | `t_rminos...` | Publicar solo texto legal aprobado y versionado. |
| `/favoritos/` | `favoritos.png` como referencia | Vista de guardados locales anónimos; sin cuenta. |
| `/onboarding/intereses/` | `onboarding...` | Preferencias locales; opción de omitir y borrar. |

La tabla define rutas, no obliga a publicar claims. Si no existe contenido autorizado, la página debe mostrar un estado explícito `Próximamente` o no entrar en el sitemap.

### 5.2 Variantes que deben fusionarse

- `home_*`: estados de una misma Home.
- `foros...cuicoyan` + `foros...directorio_y_perfil...`: `/foros/` + `/foros/<slug>/`.
- `para_creadores..._1/_2/_3` y `para_artistas..._1/_2`: conservar `_3` como base; repartir contenido por rol solo si no inventa métricas. Eliminar calculadores de alcance.
- `sobre...ecosistema` + `sobre...soporte`: `/sobre-cuicoyan/` y `/ayuda/`.
- `perfil_forocultural.png` y `foro_alicia...`: misma referencia de detalle.
- `inicio_normal/huapango/teatro` claros/oscuros: fixtures/estados de filtros, no rutas.

### 5.3 Fuera del alcance funcional

- `mi_cuicoyan...` se reduce a `/favoritos/`; no perfil, seguidores, alertas, agenda sincronizada ni cuenta.
- Reservas, cobros, pase digital, QR, boletaje, iCal/Google Calendar y notificaciones quedan como `Próximamente`.
- Registro de artistas/foros no guarda archivos ni datos; si se necesita captar, solo enlace externo aprobado.

---

## 6. Relaciones de dominio y navegación

```text
Home /
├── búsqueda/categoría/intención → /explorar/?q=&categoria=&intencion=
├── evento destacado → /eventos/<slug>/
├── artista destacado → /artistas/<slug>/
├── foro destacado → /foros/<slug>/
├── mapa → /mapa/
├── Para creadores → /para-creadores/ → /unete/?rol=artista|foro
├── Favoritos → /favoritos/
├── Sobre → /sobre-cuicoyan/
├── Ayuda/accesibilidad/legal → sus rutas
└── atribución Ollin → URL pública configurable o texto sin enlace
```

La atribución de pie de página a Ollin debe usar `VITE_OLLIN_URL` únicamente cuando exista una URL pública aprobada. Si está vacía, conservar el texto descriptivo sin convertirlo en un enlace roto o inventado. Este enlace es externo al sitio y no comparte sesión ni `localStorage`.

Relaciones locales mínimas:

- Un evento puede referenciar `venueId` y uno o varios `artistIds`.
- Artistas, foros y eventos comparten `categorySlugs`.
- Un foro puede tener `mapPoint` únicamente si la coordenada está verificada; de lo contrario, usar punto conceptual.
- Los filtros y búsquedas usan la misma fuente de datos y una función de normalización común.
- Favoritos son polimórficos por `type` + `id`, sin PII.

---

## 7. Estructura de archivos objetivo

No mover ni sobrescribir la carpeta Stitch:

```text
web/
├── frontend/
│   ├── public/{favicon.svg,robots.txt,sitemap.xml,site.webmanifest}
│   ├── src/
│   │   ├── assets/{brand,fonts,icons,images,maps}
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── mobile-menu/
│   │   │   ├── footer/
│   │   │   ├── global-search/
│   │   │   ├── category-chip/
│   │   │   ├── filter-panel/
│   │   │   ├── event-card/
│   │   │   ├── artist-card/
│   │   │   ├── venue-card/
│   │   │   ├── favorite-button/
│   │   │   ├── share-button/
│   │   │   ├── map-view/
│   │   │   ├── modal-drawer/
│   │   │   ├── accordion/
│   │   │   ├── tabs/
│   │   │   ├── loading-empty-error/
│   │   │   └── notification/
│   │   ├── config/{environment.js,routes.js,content-status.js}
│   │   ├── data/{events,artists,venues,categories,convocatorias,help}.json
│   │   ├── pages/
│   │   │   ├── inicio/
│   │   │   ├── explorar/
│   │   │   ├── eventos/
│   │   │   ├── evento-detalle/
│   │   │   ├── artistas/
│   │   │   ├── artista-detalle/
│   │   │   ├── foros/
│   │   │   ├── foro-detalle/
│   │   │   ├── mapa/
│   │   │   ├── favoritos/
│   │   │   ├── onboarding/
│   │   │   ├── para-creadores/
│   │   │   ├── unete/
│   │   │   ├── convocatorias/
│   │   │   ├── sobre-cuicoyan/
│   │   │   ├── ayuda/
│   │   │   ├── accesibilidad/
│   │   │   ├── privacidad/
│   │   │   └── terminos/
│   │   ├── services/
│   │   │   ├── content.service.js
│   │   │   ├── search.service.js
│   │   │   ├── favorites.service.js
│   │   │   ├── preferences.service.js
│   │   │   └── external-channel.service.js
│   │   ├── styles/{reset.css,variables.css,global.css,utilities.css}
│   │   ├── utils/{dom.js,focus.js,normalize-text.js,url-state.js,formatters.js}
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/{reference-inventory.md,content-pending.md,qa/}
├── scripts/{prepare-dist.mjs,check-links.mjs,check-forbidden-content.mjs}
├── tests/{unit,e2e,visual}
├── .env.example
└── README.md
```

Cada página tendrá HTML/CSS/JS coordinados. Vite debe generar `dist/index.html`, `dist/explorar/index.html`, `dist/eventos/index.html`, etc. con un post-build si es necesario; no depender de fallback SPA ni de rewrites del hosting.

---

## 8. Contratos de datos y servicios

### 8.1 Ejemplo de fixture

```json
{
  "id": "evento-demo-sones-del-barrio",
  "slug": "sones-del-barrio",
  "title": "Sones del barrio",
  "description": "Contenido de demostración de Cuicoyan.",
  "categorySlugs": ["musica"],
  "venueId": "venue-demo",
  "artistIds": ["artist-demo"],
  "contentStatus": "demo",
  "isDemo": true,
  "source": "mockup-sones-del-barrio"
}
```

No usar fecha, precio, dirección, teléfono, accesibilidad o coordenadas si no se tienen `source`, `verifiedAt` y autorización. `contentStatus` puede ser `approved`, `demo`, `coming-soon` o `hidden`.

### 8.2 Servicios

- `content.service.js`: carga y valida JSON; filtra registros `hidden`.
- `search.service.js`: normaliza acentos, combina query/categoría/intención y no ejecuta HTML.
- `favorites.service.js`: namespace versionado, límites y fallback en memoria.
- `preferences.service.js`: tema/intereses; opción de borrar todos los datos locales.
- `external-channel.service.js`: enlace externo solo si `VITE_EXTERNAL_JOIN_URL`, `VITE_EXTERNAL_CONTACT_URL` o equivalente está configurada.

No crear `fetch` a localhost ni endpoints de muestra. La frontera de servicio debe permitir sustituir el JSON por API en otra meta sin cambiar los componentes.

---

## 9. Implementación detallada por pantalla

### Home `/`

- Implementar el copy y el orden de `pantalla.md`: hero, búsqueda, categorías/intenciones, eventos, mapa/lista, artistas, foros, beneficios, propósito, CTA y footer.
- Búsqueda lleva a `/explorar/?q=<term>`.
- Categorías/intenciones llevan a `/explorar/?categoria=` o `?intencion=`.
- Cards llevan a detalle; favoritos actualizan el almacenamiento local y `aria-live`.
- Mapa previo selecciona un registro conceptual y ofrece “Abrir mapa cultural”.
- CTA “Soy artista o foro” ancla o navega a `/para-creadores/`.
- Retirar newsletter beta y cualquier cifra/testimonio no aprobado.

### Explorar y resultados `/explorar/`

- Renderizar filtros combinables, contador, chips seleccionados y botón limpiar.
- Leer query al cargar; escribir query sin perder otros parámetros.
- Mostrar estado `empty` con sugerencias y `error` con reintento local.
- No depender de hover para precio, fecha, sede o audiencia.

### Eventos `/eventos/` y detalle

- List/grid/mapa son vistas de los mismos datos, no tres datasets.
- Filtros locales: próximos/hoy/fin de semana/entrada libre solo si los campos existen.
- Paginación es local y real; no mostrar páginas falsas.
- Detalle presenta artistas, foro, ubicación y relacionados solo cuando existen.
- “Reservar”, “Comprar”, QR, calendario y compartir de red social son `Próximamente` o funciones locales seguras; no registrar ni cobrar.

### Artistas `/artistas/` y detalle

- Directorio filtra por disciplina/territorio solo con campos aprobados.
- Perfil local solo usa datos demo claramente rotulados; no inventar persona real.
- Próxima fecha enlaza al evento por ID, nunca por texto hardcodeado.

### Foros `/foros/` y detalle

- Directorio con zona/tipo y tarjeta; no inventar horarios, teléfonos ni accesibilidad.
- Foro Alicia puede ser fixture demo; la ubicación usa zona general o `isConceptual`.
- “Ver en mapa” selecciona item en el mapa local.

### Mapa `/mapa/`

- SVG local y lista semántica equivalente.
- Pins y elementos seleccionables con teclado, nombre accesible y estado sincronizado.
- No geolocalización persistente, tiles externos, precisión falsa ni “mi ubicación” fija.
- Proporcionar botón “Ver espacios en lista” antes/después del visual en móvil.

### Creadores, registro y convocatorias

- `/para-creadores/` explica beneficios sin “cero peajes”, métricas ni promesas garantizadas.
- `/unete/` presenta roles y campos solo como explicación; no hay formulario de captura ni uploads.
- Si se configura enlace externo, mostrar aviso de tratamiento del tercero y no duplicar campos localmente.
- `/convocatorias/` solo muestra items `demo` o `approved`; no postular ni guardar solicitudes.

### Favoritos/onboarding

- `/favoritos/` lista IDs guardados localmente y estado vacío con instrucciones para volver a explorar.
- `/onboarding/intereses/` permite elegir intereses, omitir, editar y borrar; no pide email.
- `/mi-cuicoyan` no se publica como perfil; redirigir a `/favoritos/` solo si existe un enlace heredado.

### Sobre, ayuda, accesibilidad, privacidad y términos

- Fusionar about/soporte; no afirmar infraestructura ni alianzas.
- FAQ usa `<details>` o accordion accesible; estado vacío si la búsqueda no encuentra.
- Accesibilidad describe el compromiso del sitio y deja reportes como canal pendiente.
- Privacidad/términos son versionados; no publicar responsables/contactos inventados. Sin tracking adicional, no añadir cookie banner innecesario.

---

## 10. Assets y diseño

1. Mantener intactos los 27 HTML y 43 screenshots.
2. Copiar el SVG local aprobado a `src/assets/brand`; no usar `logo.png/screen.png` como master.
3. Los PNG-only (`inicio_normal`, `huapango`, `teatro`, `evento`, `favoritos`, `mapacultural`, `perfil_artista`, `perfil_forocultural`) son referencias de estados móviles; no insertar chrome del teléfono en la web.
4. Resolver “CARAVANA” antes de publicar; si no está aprobado, retirarlo.
5. Sustituir las 219 referencias Googleusercontent por assets locales con licencia o abstracciones.
6. Autoalojar fuentes solo con licencia; fallback Bricolage Grotesque/Manrope seguro si no.
7. Generar WebP/AVIF y `srcset`, reservar dimensiones, usar `loading="lazy"` bajo el pliegue y `decoding="async"`.
8. Tokens obligatorios: Marfil `#FFF9F8`, Rosa niebla `#FFF3F6`, superficie `#FFFFFF`, Noche `#11152E`, Bugambilia según `general.md`, turquesas/categorías y dark tokens. La paleta de Stitch no gana a `general.md`.
9. No crear iconos con texto en imágenes ni redibujar el isotipo.

---

## 11. Accesibilidad y responsive

Cumplir WCAG 2.2 AA:

- `lang="es-MX"`, un `main`, un H1, headings ordenados, skip link y landmarks.
- Labels persistentes, `name`, instrucciones, `aria-describedby`, `aria-live` y mensajes de error comprensibles.
- Botones reales, enlaces para navegación, foco visible 3 px y targets ≥44×44.
- Tabs, chips, filtros, modal, menú, favoritos y mapa operables con teclado.
- Mapa siempre con lista; no usar solo color ni hover.
- Contraste mínimo 4.5:1/3:1; verificar claro y oscuro.
- `prefers-reduced-motion`, sin autoplay, scroll secuestrado, parallax fuerte ni `::-webkit-scrollbar{display:none}`.
- Zoom 200 % sin overflow horizontal.
- Probar 360, 390, 768, 1024, 1280 y 1440 px: Home, cards, mapa, filtros, footer y drawer.
- En móvil: header con isotipo/búsqueda/menú, chips con alternativa de teclado, mapa 320–360 px + lista, tarjetas una por fila, CTA ancho completo.

---

## 12. SEO, rendimiento y seguridad estática

- `<title>`, description, canonical configurable, OG/Twitter y favicon por ruta.
- Sitemap solo para rutas con contenido publicable; staging `noindex,nofollow`.
- JSON-LD `WebSite`/`Event`/`Organization` únicamente para datos aprobados; fixtures demo no deben indexarse como eventos reales.
- 404 y rutas de recuperación.
- CSP sin `unsafe-inline`, sin hotlinks no aprobados y sin fuentes remotas por defecto.
- Sanitizar query params; no insertar `innerHTML` externo.
- Lighthouse móvil objetivo ≥90 o documentar excepción.
- No guardar PII, tokens ni secretos en localStorage/env.

---

## 13. Pruebas y evidencia

### Unitarias

- normalización de acentos;
- filtros combinados y query string;
- relaciones evento-artista-foro;
- favoritos, preferencias y migración de namespace;
- estados de contenido y canal externo.

### E2E

- todas las rutas publicables responden 200 desde `dist`;
- Home→Explorar→Detalle→Foro/Artista→Mapa y vuelta atrás;
- filtros combinados, estado vacío y limpiar;
- favorito persiste en recarga y se puede borrar;
- tema persiste, menú móvil gestiona foco y Escape;
- no hay `href="#"`, `onclick`, `alert`, éxito simulado, compra/reserva ni llamadas remotas inesperadas.

### A11y/visual

- axe en todas las rutas;
- teclado completo, lector de pantalla, zoom 200 %, reduced motion;
- capturas en seis breakpoints y comparación con screenshots, documentando diferencias por saneamiento factual;
- contraste de tokens y estados.

### Enlaces y contenido

Crear scripts que fallen ante `href="#"`, `googleusercontent`, Tailwind CDN, handlers inline, claims prohibidos, `data-alt` sin `alt`, campos sin `name` o recursos inexistentes. Guardar reportes en `docs/qa/`.

---

## 14. Secuencia de ejecución para Luna

### Fase 0 — Congelar referencias

- [ ] Leer arquitectura, general, pantalla y DESIGN.
- [ ] Crear `docs/reference-inventory.md` con 27 HTML, duplicados, 43 screenshots, PNG-only y variantes.
- [ ] Crear `docs/content-pending.md` con claims, fechas, contactos, derechos de imagen y decisiones abiertas.
- [ ] No modificar fuentes Stitch.

**Criterio de salida:** cada fuente está clasificada como canónica, variante, fixture o archivo.

### Fase 1 — Base de aplicación

- [ ] Crear `frontend`, `tests`, `.env.example`, `README`, `package.json` y `docs/qa`.
- [ ] Configurar Vite MPA y post-build a `dist/<ruta>/index.html`.
- [ ] Crear tokens, estilos globales, favicon, robots, sitemap y 404.
- [ ] Copiar assets aprobados y retirar dependencias remotas.

**Criterio de salida:** build limpio sin CDN, hotlinks ni scripts inline.

### Fase 2 — Shell y Home

- [ ] Extraer header/footer/mobile-menu/skip-link/theme/notifications.
- [ ] Implementar Home con copy de `pantalla.md`.
- [ ] Conectar búsqueda, categorías, intenciones, eventos, artistas, foros, mapa y CTAs.

**Criterio de salida:** Home usable en seis breakpoints y sin enlaces vacíos.

### Fase 3 — Descubrimiento

- [ ] Crear JSON locales y servicios.
- [ ] Implementar explorar/resultados, eventos, detalle, artistas, foros y mapa.
- [ ] Añadir URL state, estados y relaciones.

**Criterio de salida:** el flujo de descubrimiento completo funciona sin servidor.

### Fase 4 — Participación local y contenido

- [ ] Implementar favoritos, onboarding e intereses anónimos.
- [ ] Implementar para-creadores, convocatorias, ayuda, accesibilidad y legales.
- [ ] Mantener registros/formularios como no operativos sin canal externo.

**Criterio de salida:** ningún CTA solicita o aparenta guardar datos remotos.

### Fase 5 — QA y entrega

- [ ] Unitarias, E2E, axe, enlaces, contenido, Lighthouse y visuales.
- [ ] Revisar assets/licencias y copy con persona responsable.
- [ ] Ejecutar `npm run build`, `npm run preview`, generar `dist` y ZIP opcional.
- [ ] Mantener `noindex` hasta aprobar privacidad, términos, marca y datos.

---

## 15. Despliegue estático y rollback

- Subir solo `frontend/dist`; no publicar `stitch_*`, `src`, fixtures no aprobados ni documentos internos.
- Usar directorios con `index.html` para que funcione en Netlify, Vercel, Cloudflare Pages, GitHub Pages o servidor de archivos sin rewrites SPA.
- Probar dominio raíz y subcarpeta mediante `VITE_BASE_URL`.
- No activar analítica/cookies sin actualizar privacidad.
- Conservar el ZIP de la última build aprobada para rollback; nunca borrar las referencias originales.

---

## 16. Definición de terminado

Luna solo puede declarar completada esta meta si:

- [ ] Las rutas aprobadas cargan directamente desde `dist`.
- [ ] Home, exploración, eventos, artistas, foros, mapa, favoritos y legales tienen destinos coherentes o estado pendiente honesto.
- [ ] No existe DB, backend, auth, cuenta, pago, reserva, boletaje, formulario simulado ni geolocalización persistente.
- [ ] No hay `href="#"`, handlers inline, Tailwind CDN, Googleusercontent ni `data-alt` como sustituto de alt.
- [ ] Datos demo están marcados y no se indexan como hechos.
- [ ] Componentes, páginas, servicios, estilos y utilidades siguen la arquitectura base.
- [ ] Tema, filtros, URL state, favoritos, menú, modales y mapa funcionan con teclado/táctil.
- [ ] WCAG, responsive, SEO, rendimiento, CSP y enlaces cuentan con evidencia.
- [ ] README documenta `npm ci`, `npm run dev`, `npm run build`, `npm run preview` y subida de `dist`.
- [ ] `content-pending.md` enumera bloqueadores legales, de derechos, contacto y datos.

### Evidencia de entrega

1. Árbol final de archivos.
2. Matriz de rutas publicadas/futuras/archivadas.
3. Inventario de assets usados y permisos pendientes.
4. Comandos, versiones y resultados de pruebas.
5. Capturas de seis breakpoints y reporte a11y.
6. Lista de claims eliminados o convertidos en demo.
7. Ubicación de `dist`/ZIP y pasos de upload.
8. Bloqueadores que requieren aprobación humana.

Si persiste cualquier pendiente legal o de contenido, etiquetar la salida como **staging estático funcional**, mantener `noindex` y no presentarla como plataforma cultural de producción.
