# Ficha por pantalla

> Plantilla base para describir una pantalla específica. Usar una copia de este archivo por cada página o vista; completar de arriba hacia abajo y conservar el mismo ID durante las iteraciones.

## 1. Identificación

- **ID de pantalla:** `CUI-WEB-HOME-001`. Conservar este ID durante todas las iteraciones de la home.
- **Nombre de pantalla:** Home principal — Descubre la cultura cerca de ti.
- **Página o módulo:** Inicio / puerta de entrada al ecosistema cultural Cuicoyan.
- **Ruta o URL:** `/`.
- **Versión:** `v1.0 — MVP pre-lanzamiento / prototipo de alta fidelidad`.
- **Prioridad:** crítica.
- **Estado:** en diseño, lista para generación inicial en Stitch y revisión de contenido/brand.
- **Referencia visual, wireframe o captura:** sistema visual y componentes de `sources/Inicio_normal.png`, `sources/Inicio_Huapango.png`, `sources/Inicio_Teatro.png`, `sources/Evento.png`, `sources/Artistas.png`, `sources/MapaCultural.png`, `sources/Perfil_Artista.png`, `sources/Perfil_ForoCultural.png`, `sources/Favoritos.png` y atmósfera general de `Cuicoyan-4K.png`. Adaptar el lenguaje visual a web; no insertar las capturas de app como si fueran el producto web ni dibujar mockups de teléfonos.

## 2. Objetivo de la pantalla

- **¿Para qué existe esta pantalla?** Para presentar Cuicoyan como una plataforma cultural útil desde el primer scroll, permitir que el público empiece a explorar eventos, artistas, foros y zonas de CDMX, y ofrecer una vía de participación a artistas, colectivos y espacios culturales.
- **¿Qué debe entender el usuario?** En menos de cinco segundos: “Aquí puedo descubrir qué hacer, dónde hacerlo y quién está detrás de la cultura de mi ciudad”. Antes de terminar la página también debe entender que Cuicoyan no es solo una cartelera: conecta eventos, artistas, foros y territorio.
- **¿Qué acción principal debe realizar?** Explorar Cuicoyan mediante el buscador, una categoría, un evento o el mapa.
- **CTA principal y texto exacto:** “Explorar Cuicoyan”.
- **Resultado esperado después de la acción:** navegación a `/explorar`, conservando el contexto elegido cuando exista. Si la persona seleccionó una categoría, intención, fecha o término, ese valor aparece aplicado como filtro y anunciado de forma accesible.

## 3. Usuario y contexto

- **Tipo de usuario que la visita:** público general de CDMX o visitantes que buscan un plan cultural; artistas y colectivos que necesitan presencia; foros o espacios que quieren mostrar su programación; gestores e instituciones que evalúan la plataforma.
- **Momento del recorrido en que aparece:** primer contacto desde búsqueda, redes sociales, recomendación, campaña o enlace directo; también punto de retorno para usuarios frecuentes.
- **Información que ya conoce el usuario:** puede conocer el nombre Cuicoyan o llegar sin contexto. No se asume que conozca la plataforma, los recintos, las disciplinas ni el significado del nombre.
- **Información que necesita obtener:** qué es Cuicoyan; qué puede descubrir; ejemplos concretos de eventos; categorías disponibles; dónde ocurre la actividad; quiénes son los artistas y espacios; cómo sumarse; cuál es el estado del producto.
- **Acceso o permisos requeridos:** ninguno para explorar. No solicitar cuenta ni geolocalización al cargar. La ubicación solo se pide después de una acción explícita como “Cerca de ti”, explicando el beneficio y ofreciendo seleccionar una zona manualmente. El registro final requiere consentimiento y aviso de privacidad.

## 4. Plataforma y responsive

- **Dispositivo principal:** escritorio como lienzo de referencia de Stitch y móvil como prioridad funcional. La solución debe incluir ambos comportamientos, además de tablet.
- **Tamaño de referencia:** escritorio 1440 × 1024 px con contenedor máximo de 1280 px; móvil 390 × 844 px; tablet 834 × 1112 px. La página es vertical y su altura depende del contenido.
- **Orientación:** vertical para el recorrido; el contenido interior puede usar composiciones horizontales en escritorio. Soportar móvil vertical y tablet en ambas orientaciones.
- **Comportamiento en tablet:** header compacto; hero en retícula 7/5 o apilado si falta ancho; categorías en grid de 3–4 columnas; eventos en 2 columnas; mapa arriba y lista debajo o en 5/7; artistas/foros en 2–3 columnas; beneficios apilados si cada panel queda por debajo de 320 px.
- **Comportamiento en móvil:** una columna; header con isotipo, búsqueda y menú; H1 de 42/46 px; CTA principal ancho completo y secundario debajo; buscador debajo del copy; chips en scroll horizontal con indicador visual y controles de teclado; tarjetas en lista o carrusel manual con una tarjeta completa y 16 px de siguiente tarjeta visible; mapa con altura de 320–360 px y lista alternativa inmediatamente debajo; beneficios y CTA final apilados; footer en acordeones solo si todos son accesibles y están expandidos sin JavaScript.
- **Elementos que se ocultan, reordenan o transforman:** navegación completa se transforma en drawer; tema queda como icon button accesible; ilustración del hero pasa detrás o debajo del copy y pierde patrones secundarios; chips secundarios pueden desplazarse horizontalmente; tercera/cuarta tarjeta se omiten de la vista inicial pero permanecen accesibles mediante “Ver todos”; mapa y lista dejan de estar lado a lado; decoración de fondo, glows, líneas y patrones se reducen; el CTA del header pasa al menú. No ocultar título, buscador, CTA principal, fechas, precios, ubicación ni accesibilidad.
- **Prioridad de contenido en pantallas pequeñas:** 1) propuesta de valor, 2) búsqueda/CTA, 3) categorías e intenciones, 4) próximos eventos con fecha y sede, 5) mapa/lista, 6) artistas, 7) foros, 8) beneficios, 9) propósito, 10) registro final. La decoración es siempre lo primero que se simplifica.

## 5. Estructura visual, de arriba hacia abajo

La home incluye un header global sticky antes de la Sección 1 y un footer después de la Sección 9. El header usa el lockup de Cuicoyan a la izquierda; enlaces “Inicio”, “Explorar”, “Eventos”, “Artistas”, “Foros”, “Mapa”, “Para creadores” y “Sobre Cuicoyan”; a la derecha búsqueda, cambio light/dark y botón “Únete a Cuicoyan”. En móvil se conserva isotipo, búsqueda y menú. Añadir enlace de accesibilidad “Saltar al contenido”.

### Sección 1 — Hero: la ciudad encuentra su escenario

- **Objetivo de la sección:** explicar el producto en cinco segundos, generar deseo de exploración y ofrecer tres entradas claras: buscador, CTA principal y acceso para artistas/foros.
- **Contenido exacto:** eyebrow “CULTURA VIVA EN CDMX”; H1 “Descubre la cultura que está pasando cerca de ti.”; párrafo “Eventos, artistas, foros y experiencias culturales de CDMX, reunidos para que encuentres tu próximo plan.”; buscador con label accesible “Buscar en Cuicoyan”, placeholder “Busca eventos, artistas o lugares” y botón “Buscar”; CTA principal “Explorar Cuicoyan”; CTA secundario “Soy artista o foro”; microcopy “Donde la ciudad encuentra su escenario.”; accesos rápidos “Cerca de ti”, “Este fin de semana”, “Gratis” y “Para ir en familia”.
- **Componentes:** hero split de dos columnas; copy; buscador grande; grupo de botones; chips de intención; composición visual de CDMX con cultura viva; patrón neo-prehispánico de baja opacidad; indicador de scroll opcional. Altura aproximada 720–820 px en escritorio, sin forzar `100vh` si corta contenido.
- **Jerarquía:** eyebrow → H1 → descripción → buscador → CTA principal/secundario → chips. El H1 domina, pero la búsqueda debe ser el control más evidente después del título.
- **Acción o enlace:** buscador envía a `/explorar?q={término}`; “Explorar Cuicoyan” a `/explorar`; “Soy artista o foro” ancla a `#para-creadores`; chips a `/explorar?intencion={valor}`. “Cerca de ti” solicita ubicación únicamente después del clic y permite elegir zona manualmente si se rechaza.
- **Imagen, ícono o recurso requerido:** ilustración o fotografía editorial original basada en la atmósfera de `Cuicoyan-4K.png`: horizonte/arquitectura de CDMX, público, escenario, danza y música; usar isotipo oficial como pequeño sello, no como protagonista gigante. En light, fondo Marfil Cuicoyan con color; en dark, Noche Cuicoyan con acentos luminosos controlados. Alt text si aporta información; vacío si es puramente decorativa.
- **Debe conservarse en móvil:** sí. Conservar todo el contenido funcional; simplificar la composición visual y mostrarla debajo del CTA o como fondo con overlay suficiente.

### Sección 2 — Explorar por categoría

- **Objetivo de la sección:** permitir una primera decisión rápida basada en intereses y mostrar la diversidad cultural de Cuicoyan sin abrumar.
- **Contenido exacto:** eyebrow “EXPLORA A TU MANERA”; H2 “¿Qué te gustaría vivir?”; descripción “Empieza por lo que te mueve. Puedes cambiar de categoría, fecha o zona en cualquier momento.”; categorías “Todos”, “Huapango”, “Fandango”, “Danza”, “Teatro”, “Música”, “Talleres”, “Artes marciales” y “Cultura urbana”; intenciones “Cerca de ti”, “Este fin de semana”, “Entrada libre”, “Para ir en familia”, “Tradición” y “Escena independiente”; enlace “Ver todas las categorías”.
- **Componentes:** grid de category chips grandes con icono propio, etiqueta y estado seleccionado; fila secundaria de filter chips; patrón geométrico apenas visible; tooltip solo si el icono necesita explicación. “Todos” inicia seleccionado únicamente cuando no hay filtro previo.
- **Jerarquía:** H2 y descripción alineados a la izquierda; categorías como acción principal; intenciones con menor peso; link de cierre a la derecha en escritorio y debajo en móvil.
- **Acción o enlace:** cada categoría abre `/explorar?categoria={slug}`; cada intención abre `/explorar?intencion={slug}`; “Ver todas las categorías” abre `/explorar#categorias`.
- **Imagen, ícono o recurso requerido:** set coherente de iconos lineales/geométricos: destello, sombrero huasteco estilizado sin caricatura, tarima/abanico de fandango, figura de danza, telón, nota musical, telar/herramienta, figura marcial y micrófono/escena urbana. Asociación de color obligatoria definida en `general.md`.
- **Debe conservarse en móvil:** sí. Mantener las nueve categorías; permitir scroll horizontal en dos filas o grid de dos columnas. Cada objetivo táctil mínimo 44 px y cada label visible.

### Sección 3 — Eventos destacados

- **Objetivo de la sección:** demostrar utilidad inmediata con eventos escaneables y llevar al catálogo completo o al detalle de un evento.
- **Contenido exacto:** eyebrow “AGENDA LOCAL”; H2 “Planes para encontrarte con la ciudad.”; descripción “Explora una selección de música, danza, teatro y encuentros que están por suceder.”; filtros “Próximos”, “Hoy”, “Este fin de semana”, “Entrada libre”; enlace “Ver todos los eventos”. Mostrar tres tarjetas de demostración:
  1. “Sones del barrio” — “Sáb 8 de agosto · 6:00 p. m.” — “Casa del Lago Cultural · Chapultepec” — “Una tarde de canciones, cuerdas y memoria compartida.” — etiquetas “Huapango” y “Música” — “Todo público” — precio “$180”.
  2. “Fandango con la plaza” — “Sáb 15 de agosto · 5:00 p. m.” — “Plaza de la Conchita · Coyoacán” — “Música, zapateado y encuentro abierto en la plaza.” — etiquetas “Fandango” y “Danza” — “Para todas las edades” — precio “Entrada libre”.
  3. “La ciudad en azul” — “Sáb 22 de agosto · 8:00 p. m.” — “Foro Alicia · Roma Norte” — “Una noche de música urbana inspirada en los sonidos de la ciudad.” — etiquetas “Música” y “Cultura urbana” — “Mayores de 15 años” — precio “Desde $150”.
- **Componentes:** una tarjeta destacada grande y dos tarjetas secundarias, o grid de tres columnas equilibradas; imagen, fecha, título, descripción corta, pin/sede, chips, audiencia, precio, botón de favorito y enlace de tarjeta. Favorito no exige cuenta en prototipo; si después exige sesión, explicar al activar.
- **Jerarquía:** fecha y disponibilidad visibles antes o junto al título; título; sede/zona; descripción; chips; audiencia y precio. El precio “Entrada libre” debe ser tan visible como un precio numérico.
- **Acción o enlace:** tarjeta y “Ver evento” a `/eventos/{slug}`; favorito alterna estado y anuncia “Guardado en favoritos” / “Eliminado de favoritos”; filtros actualizan el conjunto; “Ver todos los eventos” a `/eventos`.
- **Imagen, ícono o recurso requerido:** imágenes culturales 4:3 o 16:10 inspiradas en `sources/Inicio_normal.png`, `sources/Inicio_Huapango.png`, `sources/Inicio_Teatro.png` y `sources/Evento.png`; iconos de calendario, ubicación, favorito y accesibilidad. No generar texto dentro de las imágenes.
- **Debe conservarse en móvil:** sí. Mostrar una tarjeta por fila o carrusel manual accesible. No esconder fecha, sede, precio o CTA dentro de hover.

### Sección 4 — Mapa cultural

- **Objetivo de la sección:** demostrar que Cuicoyan permite descubrir la cultura por territorio y conectar el mapa con una alternativa en lista.
- **Contenido exacto:** eyebrow “MAPA CULTURAL”; H2 “La cultura también se descubre caminando.”; descripción “Ubica foros, eventos y espacios culturales por zona. Empieza en CDMX y acerca el mapa a tu barrio.”; selector “CDMX”; filtros “Eventos”, “Foros” y “Todo”; lugar seleccionado “Foro Alicia”; metadata de ejemplo “Roma Norte · Música y cultura urbana”; lista “Espacios para comenzar” con “Casa del Lago Cultural — Chapultepec”, “Foro Alicia — Roma Norte” y “Centro Cultural de España — Centro Histórico”; CTA “Abrir mapa cultural”; enlace secundario “Ver espacios en lista”.
- **Componentes:** bloque 5/7 o 6/6 con copy/lista y mapa; mapa con pines de color, controles de zoom, centrar y capas; tarjeta flotante del lugar seleccionado; lista semántica sincronizada; leyenda. El mapa puede ser estático o simulado en Stitch, pero debe parecer una función real, no una imagen decorativa.
- **Jerarquía:** título/copy → mapa → lugar seleccionado → lista alternativa → CTA. El mapa es protagonista visual, pero nunca la única forma de acceder a la información.
- **Acción o enlace:** pin selecciona y enfoca la tarjeta; elemento de lista selecciona el pin; “Abrir mapa cultural” a `/mapa`; “Ver espacios en lista” a `/foros`; lugar a `/foros/{slug}`; selector de ciudad queda preparado para expansión sin mostrar ciudades no disponibles.
- **Imagen, ícono o recurso requerido:** referencia de `sources/MapaCultural.png`; mapa simplificado de CDMX con pines Cuicoyan, patrón geográfico tenue y miniaturas de espacios. No usar ubicaciones precisas, direcciones o marcas externas como hechos si no están verificadas.
- **Debe conservarse en móvil:** sí. Mapa de 320–360 px de alto, seguido de tarjeta seleccionada y lista. Proveer botón “Ver espacios en lista” antes o inmediatamente después del mapa para accesibilidad.

### Sección 5 — Artistas que están creando

- **Objetivo de la sección:** hacer visible a quienes crean, demostrar que Cuicoyan conecta perfiles y próximas fechas, y diferenciar el producto de una cartelera convencional.
- **Contenido exacto:** eyebrow “PERSONAS Y COLECTIVOS”; H2 “Artistas que están creando.”; descripción “Conoce las voces, cuerpos, ideas y proyectos que mantienen en movimiento la cultura de la ciudad.”; cuatro perfiles demostrativos: “Luna Mestiza — Música · Cantautora — Próxima fecha: Sones del barrio”; “Raíces del Viento — Danza · Tradición — Próxima fecha: Fandango con la plaza”; “Calle Azul — Música · Cultura urbana — Próxima fecha: La ciudad en azul”; “Teatro Nube — Teatro · Narración — Próxima fecha: Cuentos para volar”; CTA “Conocer artistas”.
- **Componentes:** tarjetas de artista con retrato/avatar, nombre, disciplinas, bio de una línea, próxima fecha, favorito y link “Ver perfil”; grid de cuatro columnas a 1440, dos en tablet, una o scroll manual en móvil. Se puede incorporar una franja breve “Conocer más / Mi tribu” solo en pantallas de producto, no en esta home si compite con el CTA.
- **Jerarquía:** retrato → nombre → disciplinas → descripción → próxima fecha → link. La próxima fecha relaciona al artista con la agenda.
- **Acción o enlace:** tarjeta a `/artistas/{slug}`; próxima fecha a `/eventos/{slug}`; favorito alterna estado; CTA a `/artistas`.
- **Imagen, ícono o recurso requerido:** dirección visual de `sources/Artistas.png` y `sources/Perfil_Artista.png`; retratos consistentes 1:1 o 4:5, diversos y con contexto. En prototipo pueden ser ilustraciones; no representar a personas reales con datos inventados.
- **Debe conservarse en móvil:** sí. Mostrar al menos tres perfiles antes del CTA; usar tarjetas horizontales compactas si mejora el escaneo.

### Sección 6 — Foros que hacen ciudad

- **Objetivo de la sección:** mostrar que los espacios culturales tienen identidad, ubicación y programación propia dentro de Cuicoyan.
- **Contenido exacto:** eyebrow “ESPACIOS CULTURALES”; H2 “Foros que hacen ciudad.”; descripción “Encuentra escenarios, centros culturales y espacios independientes; conoce su programación y cómo llegar.”; tres tarjetas demostrativas: “Casa del Lago Cultural — Chapultepec — Música, escena y encuentros al aire libre”; “Foro Alicia — Roma Norte — Música independiente y cultura urbana”; “Centro Cultural de España — Centro Histórico — Exposiciones, talleres y programación contemporánea”; CTA “Explorar foros”.
- **Componentes:** una tarjeta editorial grande y dos compactas o grid de tres; imagen del espacio, tipo, nombre, colonia/zona, descripción, próxima actividad, indicador de accesibilidad si está verificado y link “Ver espacio”.
- **Jerarquía:** imagen/atmósfera → tipo de espacio → nombre → zona → descripción → próxima actividad → enlace.
- **Acción o enlace:** tarjeta a `/foros/{slug}`; próxima actividad a `/eventos/{slug}`; CTA a `/foros`; ubicación abre `/mapa?foro={slug}`.
- **Imagen, ícono o recurso requerido:** dirección de `sources/Perfil_ForoCultural.png` y `sources/MapaCultural.png`; fotografía arquitectónica con vida y escala humana; pin de marca; patrón geométrico secundario. No inventar horarios, teléfonos, accesibilidad o dirección exacta.
- **Debe conservarse en móvil:** sí. Tarjetas verticales o horizontales; no ocultar zona ni próxima actividad.

### Sección 7 — Beneficios para artistas y foros

- **Objetivo de la sección:** convertir a quienes hacen cultura, explicando beneficios concretos sin exponer la operación interna ni prometer resultados garantizados.
- **Contenido exacto:** anchor `#para-creadores`; eyebrow “PARA QUIENES HACEN CULTURA”; H2 “Cuicoyan también es un lugar para tu proyecto.”; descripción “Construye una presencia clara, conecta tu programación con nuevos públicos y forma parte del mapa cultural de la ciudad.”; panel 1 título “Para artistas y colectivos”, texto “Reúne tu perfil, disciplinas, publicaciones y próximas fechas para que el público descubra tu trabajo en contexto.”, bullets “Perfil cultural propio”, “Fechas conectadas con eventos y foros”, “Mayor facilidad para que te encuentren”, botón “Quiero registrar mi proyecto”; panel 2 título “Para foros y espacios”, texto “Muestra tu espacio, ubicación y programación en un lugar diseñado para el descubrimiento cultural.”, bullets “Perfil y cartelera del espacio”, “Presencia en el mapa cultural”, “Información útil para llegar y participar”, botón “Quiero registrar mi espacio”; enlace común “Conocer todos los beneficios”.
- **Componentes:** dos paneles de igual jerarquía, cada uno con ilustración/icono, título, texto, lista y CTA; badge discreto “Registro de interés” si el alta todavía no está activa; posible modal o página de selección de rol.
- **Jerarquía:** H2 → explicación → dos rutas paralelas → CTA específico. Ninguno de los dos públicos debe parecer secundario.
- **Acción o enlace:** artista a `/unete?rol=artista`; foro a `/unete?rol=foro`; beneficios a `/para-creadores`. Si se usa modal, debe tener título, cierre, foco atrapado y retorno de foco.
- **Imagen, ícono o recurso requerido:** ilustración de artista/collectivo y espacio cultural en lenguaje neo-mexicano contemporáneo; no usar personas en trajes estereotípicos ni imágenes corporativas de networking.
- **Debe conservarse en móvil:** sí. Panel de artistas primero y foros después; ambos con CTA ancho completo.

### Sección 8 — Propósito de Cuicoyan

- **Objetivo de la sección:** explicar por qué existe la plataforma después de demostrar su utilidad, generar confianza y expresar la visión sin convertir la home en un manifiesto institucional.
- **Contenido exacto:** eyebrow “POR QUÉ EXISTE”; H2/frase manifiesto “La cultura de una ciudad no debería depender de que el algoritmo correcto te encuentre.”; texto “Cuicoyan nace para facilitar el descubrimiento cultural, dar visibilidad a escenas grandes y pequeñas y acercar a públicos, artistas y espacios. Queremos que encontrar cultura sea tan natural como recorrer la ciudad.”; tres principios: “Descubrir lo cercano — Encuentra experiencias por interés, fecha y territorio.”; “Dar lugar a más escenas — Conoce proyectos consolidados, independientes y comunitarios.”; “Conectar a quienes hacen ciudad — Relaciona eventos, personas y espacios en una misma experiencia.”; enlace “Conoce Cuicoyan”.
- **Componentes:** bloque editorial full-bleed con frase grande; tres principios con icono; textura geométrica al 4–6 %; posible imagen documental panorámica con overlay; mención a Ollin reservada para el footer, no dentro del manifiesto principal.
- **Jerarquía:** frase manifiesto → párrafo → principios → enlace. Evitar números, métricas o prueba social no confirmada.
- **Acción o enlace:** “Conoce Cuicoyan” a `/sobre-cuicoyan`.
- **Imagen, ícono o recurso requerido:** escena colectiva auténtica o ilustración amplia de cultura en la ciudad. En dark puede usar fondo Noche Cuicoyan y gradiente limitado; en light, Papel cempasúchil o Rosa niebla.
- **Debe conservarse en móvil:** sí. Reducir ornamentación y partir la frase en máximo cuatro líneas, sin reducirla por debajo de 32 px.

### Sección 9 — CTA final y lanzamiento

- **Objetivo de la sección:** cerrar con una invitación memorable, captar interés y ofrecer una salida inmediata a explorar sin bloquear a quien no quiera registrarse.
- **Contenido exacto:** eyebrow “TU PRÓXIMO PLAN EMPIEZA AQUÍ”; H2 “La cultura vive cerca de ti. Ven a encontrarla.”; descripción “Explora Cuicoyan o deja tu correo para enterarte del lanzamiento, nuevas funciones y convocatorias para artistas y espacios.”; campo label “Correo electrónico”, placeholder “tu@correo.com”; selector label “Quiero participar como”, opciones “Público”, “Artista o colectivo”, “Foro o espacio cultural” y “Organización”; checkbox sin preseleccionar “Acepto recibir novedades de Cuicoyan y puedo cancelar en cualquier momento.”; CTA de formulario “Únete a Cuicoyan”; CTA secundario “Explorar eventos”; nota “Usaremos tus datos únicamente para enviarte información de Cuicoyan. Consulta el Aviso de privacidad.”; mensaje de éxito “¡Listo! Ya eres parte del inicio de Cuicoyan. Te avisaremos cuando haya novedades.”
- **Componentes:** bloque final con gradiente Cuicoyan controlado, tarjeta de formulario de alto contraste, input, select, checkbox, CTA, enlace secundario, nota de privacidad y estado de éxito inline; footer inmediatamente debajo con logo, tagline “Donde la ciudad encuentra su escenario.”, columnas “Explora”, “Participa”, “Información”, redes, tema, copyright y mención “Cuicoyan es una plataforma desarrollada sobre la infraestructura digital de Ollin.”
- **Jerarquía:** H2 → descripción → formulario/CTA → privacidad → footer. El formulario no debe dominar más que la promesa de valor.
- **Acción o enlace:** submit registra interés y muestra éxito sin perder contexto; “Explorar eventos” a `/eventos`; “Aviso de privacidad” a `/privacidad`; footer: `/explorar`, `/eventos`, `/artistas`, `/foros`, `/mapa`, `/para-creadores`, `/sobre-cuicoyan`, `/accesibilidad`, `/terminos`, `/privacidad`; “Conoce Ollin” a URL por definir y no se muestra si no existe destino válido.
- **Imagen, ícono o recurso requerido:** isotipo o composición de voluta/flor en gran escala pero baja opacidad; gradiente `#F21F6D → #8A3FFC → #00C7D4`; patrones mínimos; no usar fotografía detrás de campos.
- **Debe conservarse en móvil:** sí. Formulario en una columna, CTA de 100 % de ancho, enlaces de footer apilados y todos los textos legales legibles.

## 6. Contenido y datos

- **Título principal exacto:** “Descubre la cultura que está pasando cerca de ti.”
- **Subtítulo o descripción exacta:** “Eventos, artistas, foros y experiencias culturales de CDMX, reunidos para que encuentres tu próximo plan.”
- **Textos de botones:** “Explorar Cuicoyan”; “Buscar”; “Soy artista o foro”; “Ver todas las categorías”; “Ver todos los eventos”; “Ver evento”; “Abrir mapa cultural”; “Ver espacios en lista”; “Conocer artistas”; “Ver perfil”; “Explorar foros”; “Ver espacio”; “Quiero registrar mi proyecto”; “Quiero registrar mi espacio”; “Conocer todos los beneficios”; “Conoce Cuicoyan”; “Únete a Cuicoyan”; “Explorar eventos”; “Reintentar”; “Cargar más”.
- **Etiquetas de navegación:** “Inicio”; “Explorar”; “Eventos”; “Artistas”; “Foros”; “Mapa”; “Para creadores”; “Sobre Cuicoyan”; “Buscar”; “Cambiar a modo oscuro/claro”; “Abrir menú”; “Cerrar menú”.
- **Datos de ejemplo que deben mostrarse:** categorías e intenciones indicadas; tres eventos; tres ubicaciones de mapa; cuatro perfiles de artista; tres foros; dos roles de participación; ciudad “CDMX”; fechas, precios y textos exactos de esta ficha. Son datos demostrativos de prototipo y deben conectarse a una fuente verificada antes de publicar.
- **Número de tarjetas, filas o elementos:** 9 categorías; 6 chips de intención; 3 eventos; 3 pines/espacios visibles como mínimo; 4 artistas; 3 foros; 2 paneles de beneficios; 3 principios; 1 formulario final. En móvil puede reducirse la cantidad visible inicial, nunca el acceso al conjunto.
- **Contenido que no debe inventarse:** métricas; número real de eventos o perfiles; testimonios; logos de aliados; patrocinios; convocatorias activas; disponibilidad; aforo; boletaje; promociones; direcciones, horarios, teléfonos o accesibilidad de recintos; biografías de personas reales; derechos de imágenes; cobertura fuera de CDMX; detalles técnicos de Ollin. Sustituir cualquier ejemplo por datos confirmados antes de producción.
- **Texto legal, aviso o nota obligatoria:** junto al formulario: “Usaremos tus datos únicamente para enviarte información de Cuicoyan. Consulta el Aviso de privacidad.”; checkbox de consentimiento no preseleccionado; en footer, “© 2026 Cuicoyan. Todos los derechos reservados.” como placeholder de año dinámico y links a Privacidad, Términos y Accesibilidad. Si las imágenes son de terceros, incluir créditos según licencia.

## 7. Componentes y comportamiento

- **Navegación:** header sticky que se compacta de 80 a 68 px al hacer scroll; resalta la sección actual sin depender solo del color; logo vuelve a `/`; drawer móvil con foco atrapado, cierre por Escape y overlay; enlace “Saltar al contenido”. No ocultar el header por completo durante el scroll.
- **Botones y enlaces:** todas las acciones tienen label concreto, destino y estados. Una tarjeta clicable no debe contener controles anidados conflictivos: el título enlaza al detalle y favorito es botón independiente. Links de texto subrayados en hover/focus; focus ring de 2–3 px con offset. Icon buttons con tooltip visual y nombre accesible.
- **Búsqueda:** autocomplete opcional con grupos “Eventos”, “Artistas” y “Lugares”; inicia después de dos caracteres; permite Enter; Escape cierra sugerencias; mensaje “No encontramos coincidencias. Prueba con otra categoría, zona o fecha.”; historial solo con consentimiento y nunca requerido. En prototipo puede redirigir a resultados simulados.
- **Filtros u ordenamiento:** selección única para categoría principal y múltiple para intenciones cuando tenga sentido; filtros reflejados en URL; botón “Limpiar filtros”; recuento solo si proviene de datos; no usar color como único estado. En la home, los filtros pueden navegar a `/explorar` en vez de actualizar toda la página.
- **Formularios y validaciones:** email obligatorio con validación de formato; rol obligatorio; consentimiento obligatorio para comunicaciones. Errores inline: “Escribe un correo válido.”, “Selecciona cómo quieres participar.”, “Necesitamos tu autorización para enviarte novedades.” No borrar datos tras error. En éxito sustituir el formulario por confirmación y opción “Usar otro correo”.
- **Modales, menús o paneles:** usar drawer para menú móvil y modal solo para selección rápida de rol si mejora el flujo; todos con título, botón de cierre, foco inicial, trampa de foco, cierre por Escape y retorno de foco. Evitar popups automáticos de registro.
- **Scroll, tabs o carruseles:** scroll vertical natural; anchors con offset del header; carruseles solo manuales, sin autoplay, con botones anterior/siguiente y posición anunciada; tabs con patrón ARIA y navegación por flechas. Preferir grid visible en escritorio.
- **Transiciones o animaciones:** 150–220 ms para interacción; 250–400 ms para entrada suave; máximo 16 px de desplazamiento; favorito con escala breve; pin con pulso único; respetar reducción de movimiento. No usar parallax esencial, scroll-jacking ni animación infinita.
- **Destino de cada acción:** `/explorar`; `/explorar?q=`; `/explorar?categoria=`; `/explorar?intencion=`; `/eventos`; `/eventos/{slug}`; `/artistas`; `/artistas/{slug}`; `/foros`; `/foros/{slug}`; `/mapa`; `/mapa?foro=`; `/para-creadores`; `/unete?rol=artista`; `/unete?rol=foro`; `/sobre-cuicoyan`; `/privacidad`; `/terminos`; `/accesibilidad`. Si una ruta no está implementada en el prototipo, mostrar pantalla/estado “Próximamente” con vía de regreso, nunca un enlace muerto.

## 8. Estados de la pantalla

- **Estado normal:** contenido completo, tema light por preferencia del sistema o configuración guardada, ninguna categoría forzada, eventos próximos, mapa en CDMX, formulario vacío y CTA activos.
- **Estado de carga:** conservar la estructura con skeletons de misma altura para tarjetas y mapa; logo, H1 y navegación cargan primero; texto “Estamos reuniendo la agenda cultural…” para carga prolongada; evitar spinners aislados y cambios bruscos de layout.
- **Estado vacío:** eventos: “Todavía no encontramos eventos con estos filtros. Prueba otra fecha, categoría o zona.” con “Limpiar filtros”; mapa: “Aún no hay espacios para mostrar en esta zona.” con “Ver todos los espacios”; artistas/foros: “Estamos sumando nuevas voces y espacios. Vuelve pronto.”; favoritos no corresponde como sección independiente en esta pantalla.
- **Estado de error:** bloque contextual, no pantalla completa salvo fallo global. Mensaje global “No pudimos cargar Cuicoyan en este momento. Revisa tu conexión e inténtalo de nuevo.”; mapa “El mapa no está disponible, pero puedes explorar los espacios en lista.”; formulario “No pudimos registrar tu correo. Inténtalo de nuevo en unos minutos.”; botón “Reintentar”. No perder campos ni dejar controles bloqueados.
- **Estado de éxito:** favorito anuncia por región viva “Guardado en favoritos”; formulario muestra “¡Listo! Ya eres parte del inicio de Cuicoyan. Te avisaremos cuando haya novedades.”; ubicación aplicada muestra chip “Cerca de ti” y zona legible; nunca depender solo de una palomita verde.
- **Estado deshabilitado:** botones con contraste aún legible y cursor/atributo apropiado; submit deshabilitado solo durante envío, con texto “Enviando…” y spinner; filtros que no aplican explican la razón. No usar opacidad inferior a 40 % para texto esencial.
- **Hover, focus y active:** tarjeta sube 2–4 px y acentúa borde; CTA cambia tono sin vibración; chips muestran fondo/borde/icono; focus ring Bugambilia en light y Turquesa/Bugambilia luminoso en dark con 3:1 respecto al fondo; active reduce escala máximo a 0.98; mapa resalta pin y elemento de lista de manera sincronizada.
- **Mensaje que debe ver el usuario en cada estado:** normal sin mensaje adicional; carga “Estamos reuniendo la agenda cultural…”; vacío según módulo; error según módulo con “Reintentar”; éxito del formulario y favorito con textos anteriores; ubicación denegada “No pasa nada: elige una zona para explorar sin compartir tu ubicación.”; permiso no disponible “La ubicación no está disponible en este dispositivo. Puedes seleccionar una zona manualmente.”

## 9. Assets y referencias

- **Logotipo:** isotipo/lockup oficial de Cuicoyan en SVG para producción; si todavía no está exportado, usar placeholder reemplazable basado en la versión aprobada, nunca calcarlo. `Cuicoyan.png` es una carpeta/icono derivado y no sustituye el logotipo principal. En mockups como `sources/Artistas.png` aparece una referencia del lockup.
- **Imágenes:** `Cuicoyan-4K.png` como referencia atmosférica del hero; `sources/Inicio_normal.png`, `sources/Inicio_Huapango.png`, `sources/Inicio_Teatro.png` para categorías y eventos; `sources/Evento.png` para detalle; `sources/Artistas.png` y `sources/Perfil_Artista.png` para perfiles; `sources/MapaCultural.png` para mapa; `sources/Perfil_ForoCultural.png` para espacios; `sources/Favoritos.png` para el estado de guardado. Crear recortes web optimizados en AVIF/WebP con fallback, `srcset`, dimensiones declaradas y lazy-loading fuera del hero.
- **Íconos:** set lineal de 20–24 px, stroke consistente 1.75–2 px, esquinas suaves; búsqueda, calendario, pin, corazón, flecha, ubicación, capas, tema, usuario, menú, accesibilidad y categorías. Usar SVG, no emojis en la interfaz final.
- **Videos o animaciones:** no requeridos. Si se propone video ambiental futuro, debe estar silenciado, sin autoplay en datos móviles, con poster, pausa y alternativa estática. Para Stitch, usar imagen/ilustración estática.
- **Capturas o sitios de referencia:** únicamente los assets internos listados. Tomar de ellos paleta, energía, bordes, patrones y jerarquía; adaptar a una web de 1440 px, no reproducir una pantalla móvil ampliada.
- **Elementos que no deben modificarse:** nombre Cuicoyan; propósito; copy principal; tipografías; tokens de color; relación categoría-color; geometría y proporciones del isotipo oficial; narrativa y orden de las nueve secciones; CTA principal; restricciones de información reservada.

## 10. Restricciones

### Obligatorio

- Respetar completamente `general.md` y esta ficha; en caso de conflicto, aplicar las prioridades de `general.md`.
- Construir una home responsive real en variantes 1440 px y 390 px, con adaptación intermedia a tablet.
- Mantener exactamente el orden: hero → categorías → eventos → mapa → artistas → foros → beneficios → propósito → CTA final.
- Usar el copy exacto definido para H1, H2, CTA, navegación, tarjetas de ejemplo y estados.
- Usar Bricolage Grotesque + Manrope y las paletas Cuicoyan light/dark.
- Mantener buscador y CTA principal visibles sin scroll en un viewport desktop común y dentro del primer bloque en móvil.
- Mostrar información logística de evento de forma visible: fecha, hora, sede/zona, precio y etiquetas.
- Ofrecer alternativa en lista para el mapa.
- Etiquetar en el proceso de diseño los datos de evento/artista/foro como demostrativos y sustituibles; antes de publicar deben verificarse.
- Incluir estados de carga, vacío, error, éxito, disabled, hover, focus y active.
- Mantener contraste WCAG 2.2 AA, foco visible y objetivos táctiles mínimos.
- Definir un destino para cada enlace o un estado de “Próximamente” recuperable.

### Puede proponer la IA

- Composición exacta de la ilustración del hero y recortes de imágenes.
- Variante de grid editorial para eventos y foros, siempre que conserve cantidad, contenido y jerarquía.
- Microinteracciones, patrones secundarios y tratamiento de fondos dentro de los límites de `general.md`.
- Iconos propios coherentes para categorías y principios.
- Modo de presentar el mapa simulado y su sincronización visual con la lista.
- Alternancia de fondos entre Marfil, Blanco, Rosa niebla, Papel cempasúchil y Noche Cuicoyan para crear ritmo.
- Un sticky CTA móvil discreto solo después de salir del hero, siempre que no cubra contenido ni duplique acciones innecesariamente.

### No hacer

- No crear una landing corporativa centrada en misión/visión ni abrir con explicación de Ollin.
- No eliminar, combinar ni reordenar las nueve secciones.
- No usar lorem ipsum, copy en inglés ni datos estadísticos inventados.
- No presentar ejemplos de fechas, precios, biografías, direcciones o accesibilidad como información verificada.
- No usar capturas de la app dentro de marcos de teléfono como contenido principal de la home.
- No agrandar una pantalla móvil para resolver escritorio.
- No abusar de neón, glow, degradados, glassmorphism, patrones o animaciones; evitar estética cyberpunk.
- No usar imágenes estereotípicas, iconografía cultural sin contexto ni tipografías pseudo-prehispánicas.
- No ocultar fecha, precio, ubicación, CTA o navegación en hover/carrusel automático.
- No pedir geolocalización al cargar ni mostrar popup automático de newsletter.
- No usar mapa sin lista equivalente, icono sin etiqueta accesible o color como único estado.
- No revelar detalles internos de Ollin, arquitectura, recomendación, interoperabilidad, costos, estrategia comercial o roadmap.
- No deformar, recalcar o reinterpretar el logotipo desde imágenes rasterizadas.

## 11. Criterios de aceptación

- [x] El propósito de la pantalla se entiende rápidamente.
- [x] La acción principal es visible y distinguible.
- [x] Se usa el sistema visual definido en `general.md`.
- [x] El contenido importante no fue sustituido por texto genérico.
- [x] La pantalla funciona conceptualmente en escritorio, tablet y móvil.
- [x] Se contemplaron carga, vacío, error y éxito cuando aplican.
- [x] Los botones y enlaces tienen destino definido.
- [x] No se agregaron funciones fuera del alcance.
- [x] El H1, buscador y CTA principal aparecen en el primer viewport.
- [x] La narrativa sigue “Descubre → entiende → explora → confía → participa”.
- [x] La home contiene las nueve secciones solicitadas en el orden definido.
- [x] Eventos, artistas, foros y mapa se entienden como partes conectadas de un mismo producto.
- [x] La versión desktop está compuesta específicamente para 1440 px y no es una pantalla móvil ampliada.
- [x] La versión móvil prioriza propuesta, búsqueda, categorías, fecha, ubicación y CTA.
- [x] El mapa tiene alternativa en lista y todos los controles son accesibles por teclado/tacto.
- [x] El modo light y dark usa tokens específicos y contraste AA.
- [x] Los datos demostrativos se distinguen del contenido que debe verificarse antes de producción.
- [x] La identidad mexicana es contemporánea y contextual, sin estereotipos ni ornamentación excesiva.
- [x] Ollin aparece únicamente como atribución discreta y no desplaza el propósito de Cuicoyan.
- [x] El formulario final incluye consentimiento, privacidad, validación y confirmación.

## 12. Prompt final para Stitch

> Copiar aquí el prompt ensamblado a partir de esta ficha y de `general.md`.

```text
Diseña la HOME principal responsive de Cuicoyan, una plataforma cultural de CDMX para descubrir eventos, artistas, colectivos, foros y experiencias cercanas. Genera al menos una variante desktop de 1440 px y una variante móvil de 390 px, con comportamiento coherente para tablet. Debe sentirse como una extensión utilizable de una app cultural, no como una landing corporativa, un portal gubernamental ni un sitio de boletaje.

OBJETIVO
La persona debe entender en menos de cinco segundos: “Aquí puedo descubrir qué hacer, dónde hacerlo y quién está detrás de la cultura de mi ciudad”. La acción principal es “Explorar Cuicoyan” y lleva a /explorar. La narrativa completa es: Descubre → entiende → explora → confía → participa.

DIRECCIÓN VISUAL
La personalidad es viva, local, contemporánea, cálida, inclusiva, cultural y confiable. Usa una estética neo-mexicana/neo-prehispánica contemporánea con patrones geométricos muy sutiles; evita folclor genérico, clichés, estética gubernamental, cyberpunk y exceso de neón.

Tipografías:
- Bricolage Grotesque 700 para hero y H1–H3; 600/700 para títulos de tarjetas.
- Manrope 400–700 para navegación, cuerpo, botones, filtros, formularios, fechas, precios y metadata.
- Hero desktop 72/76 px y móvil 42/46 px; H2 desktop 44/50 px y móvil 30/36 px; body 16/26 px. No uses otras fuentes ni tipografías decorativas.

Paleta light:
- background #FFF9F8, surface #FFFFFF, surfaceAlt #FFF3F6, culturalSurface #FFF7EE;
- text #11152E, textSecondary #5F6273, border #ECE4E7;
- primary #E91662, cyan #009BA5, orange #E96F00, purple #7936D2, red #D62650, blue #008EB5, green #008F70.

Paleta dark:
- background #080817, surface #101126, surfaceAlt #16132B, surfaceRaised #1D1735;
- text #F9F7FC, textSecondary #B6B2C2, border #292540;
- primary #FF3D8D, cyan #17E0E4, orange #FF9D2E, purple #B45CFF, red #FF506F, blue #24C8EF, green #20D5A7.

Gradiente de marca: #F21F6D → #8A3FFC → #00C7D4. Úsalo solo en uno o dos momentos de alto impacto, no en todos los botones. Mantén 70 % neutros, 20 % color contextual y 10 % color de marca. Dark no es una simple inversión; usa fondos azul-violeta profundos y glow solo en selección activa.

Layout:
- contenedor máximo 1280 px, gutters 80 px en 1440, 40 px tablet y 20 px móvil;
- separación vertical 112–144 px desktop y 72–88 px móvil;
- radios 16 px en controles, 20–24 px en tarjetas y 24–32 px en bloques editoriales;
- botones de 48–52 px de alto, inputs de 52–56 px, objetivos táctiles mínimos 44 px;
- sombras sutiles en light y elevación tonal/borde en dark;
- header sticky, accesible y compacto al hacer scroll.

HEADER GLOBAL
Coloca el lockup oficial de Cuicoyan a la izquierda. Usa enlaces: “Inicio”, “Explorar”, “Eventos”, “Artistas”, “Foros”, “Mapa”, “Para creadores” y “Sobre Cuicoyan”. A la derecha: búsqueda, cambio light/dark y botón “Únete a Cuicoyan”. En móvil usa isotipo, icono de búsqueda y menú accesible. Incluye “Saltar al contenido”. No redibujes ni deformes el isotipo: usa un asset reemplazable si no está disponible el SVG.

ARQUITECTURA OBLIGATORIA, EN ESTE ORDEN

1. HERO
Eyebrow: “CULTURA VIVA EN CDMX”.
H1 exacto: “Descubre la cultura que está pasando cerca de ti.”
Descripción exacta: “Eventos, artistas, foros y experiencias culturales de CDMX, reunidos para que encuentres tu próximo plan.”
Incluye buscador grande con label “Buscar en Cuicoyan”, placeholder “Busca eventos, artistas o lugares” y botón “Buscar”; CTA primario “Explorar Cuicoyan”; CTA secundario “Soy artista o foro”; microcopy “Donde la ciudad encuentra su escenario.”; chips “Cerca de ti”, “Este fin de semana”, “Gratis” y “Para ir en familia”.
Usa una composición original de CDMX, cultura viva, música, danza, público y espacios; toma la atmósfera de Cuicoyan-4K.png sin insertar capturas de app ni mockups de teléfonos. En móvil coloca la visual debajo del copy o como fondo simplificado con contraste suficiente.

2. EXPLORAR POR CATEGORÍA
Eyebrow: “EXPLORA A TU MANERA”.
H2: “¿Qué te gustaría vivir?”
Texto: “Empieza por lo que te mueve. Puedes cambiar de categoría, fecha o zona en cualquier momento.”
Chips grandes con icono, label y color: Todos/Bugambilia; Huapango/Turquesa; Fandango/Cempasúchil; Danza/Jacaranda; Teatro/Grana; Música/Talavera; Talleres/Rosa mexicano; Artes marciales/Turquesa o Talavera; Cultura urbana/Cempasúchil. Añade chips secundarios “Cerca de ti”, “Este fin de semana”, “Entrada libre”, “Para ir en familia”, “Tradición”, “Escena independiente” y link “Ver todas las categorías”. No dependas solo del color.

3. EVENTOS DESTACADOS
Eyebrow: “AGENDA LOCAL”.
H2: “Planes para encontrarte con la ciudad.”
Texto: “Explora una selección de música, danza, teatro y encuentros que están por suceder.”
Filtros: “Próximos”, “Hoy”, “Este fin de semana”, “Entrada libre”.
Muestra 3 tarjetas con imagen, fecha/hora, título, descripción, sede/zona, tags, audiencia, precio, favorito y enlace:
- “Sones del barrio”; “Sáb 8 de agosto · 6:00 p. m.”; “Casa del Lago Cultural · Chapultepec”; “Una tarde de canciones, cuerdas y memoria compartida.”; Huapango/Música; Todo público; $180.
- “Fandango con la plaza”; “Sáb 15 de agosto · 5:00 p. m.”; “Plaza de la Conchita · Coyoacán”; “Música, zapateado y encuentro abierto en la plaza.”; Fandango/Danza; Para todas las edades; Entrada libre.
- “La ciudad en azul”; “Sáb 22 de agosto · 8:00 p. m.”; “Foro Alicia · Roma Norte”; “Una noche de música urbana inspirada en los sonidos de la ciudad.”; Música/Cultura urbana; Mayores de 15 años; Desde $150.
CTA: “Ver todos los eventos”. Estos datos son demostrativos y deben ser reemplazables; no agregues métricas ni disponibilidad inventada.

4. MAPA CULTURAL
Eyebrow: “MAPA CULTURAL”.
H2: “La cultura también se descubre caminando.”
Texto: “Ubica foros, eventos y espacios culturales por zona. Empieza en CDMX y acerca el mapa a tu barrio.”
Diseña un bloque visual fuerte con selector CDMX, filtros Eventos/Foros/Todo, mapa con pines Cuicoyan, controles accesibles, tarjeta seleccionada “Foro Alicia — Roma Norte · Música y cultura urbana” y lista sincronizada: “Casa del Lago Cultural — Chapultepec”, “Foro Alicia — Roma Norte”, “Centro Cultural de España — Centro Histórico”. CTA “Abrir mapa cultural” y link “Ver espacios en lista”. El mapa puede ser simulado, pero siempre incluye alternativa en lista. En móvil, mapa de 320–360 px seguido por tarjeta y lista.

5. ARTISTAS
Eyebrow: “PERSONAS Y COLECTIVOS”.
H2: “Artistas que están creando.”
Texto: “Conoce las voces, cuerpos, ideas y proyectos que mantienen en movimiento la cultura de la ciudad.”
Muestra 4 tarjetas: Luna Mestiza — Música/Cantautora — Sones del barrio; Raíces del Viento — Danza/Tradición — Fandango con la plaza; Calle Azul — Música/Cultura urbana — La ciudad en azul; Teatro Nube — Teatro/Narración — Cuentos para volar. Incluye retrato, nombre, disciplinas, bio breve, próxima fecha, favorito y “Ver perfil”. CTA “Conocer artistas”. Trátalos como perfiles demostrativos, no como personas reales.

6. FOROS
Eyebrow: “ESPACIOS CULTURALES”.
H2: “Foros que hacen ciudad.”
Texto: “Encuentra escenarios, centros culturales y espacios independientes; conoce su programación y cómo llegar.”
Muestra 3 tarjetas: Casa del Lago Cultural — Chapultepec — Música, escena y encuentros al aire libre; Foro Alicia — Roma Norte — Música independiente y cultura urbana; Centro Cultural de España — Centro Histórico — Exposiciones, talleres y programación contemporánea. Incluye fotografía, tipo, nombre, zona, descripción, próxima actividad y “Ver espacio”. CTA “Explorar foros”. No inventes horarios, teléfonos, direcciones exactas o accesibilidad.

7. BENEFICIOS PARA ARTISTAS Y FOROS
Anchor #para-creadores. Eyebrow: “PARA QUIENES HACEN CULTURA”.
H2: “Cuicoyan también es un lugar para tu proyecto.”
Texto: “Construye una presencia clara, conecta tu programación con nuevos públicos y forma parte del mapa cultural de la ciudad.”
Dos paneles iguales:
- “Para artistas y colectivos”: “Reúne tu perfil, disciplinas, publicaciones y próximas fechas para que el público descubra tu trabajo en contexto.” Bullets “Perfil cultural propio”, “Fechas conectadas con eventos y foros”, “Mayor facilidad para que te encuentren”. CTA “Quiero registrar mi proyecto”.
- “Para foros y espacios”: “Muestra tu espacio, ubicación y programación en un lugar diseñado para el descubrimiento cultural.” Bullets “Perfil y cartelera del espacio”, “Presencia en el mapa cultural”, “Información útil para llegar y participar”. CTA “Quiero registrar mi espacio”.
Link común “Conocer todos los beneficios”. En móvil apila ambos paneles y conserva ambos CTAs.

8. PROPÓSITO
Eyebrow: “POR QUÉ EXISTE”.
Frase principal: “La cultura de una ciudad no debería depender de que el algoritmo correcto te encuentre.”
Texto: “Cuicoyan nace para facilitar el descubrimiento cultural, dar visibilidad a escenas grandes y pequeñas y acercar a públicos, artistas y espacios. Queremos que encontrar cultura sea tan natural como recorrer la ciudad.”
Tres principios: “Descubrir lo cercano — Encuentra experiencias por interés, fecha y territorio.”; “Dar lugar a más escenas — Conoce proyectos consolidados, independientes y comunitarios.”; “Conectar a quienes hacen ciudad — Relaciona eventos, personas y espacios en una misma experiencia.” Link “Conoce Cuicoyan”. Usa bloque editorial de alto impacto, no estadísticas ni testimonios inventados.

9. CTA FINAL + FOOTER
Eyebrow: “TU PRÓXIMO PLAN EMPIEZA AQUÍ”.
H2: “La cultura vive cerca de ti. Ven a encontrarla.”
Texto: “Explora Cuicoyan o deja tu correo para enterarte del lanzamiento, nuevas funciones y convocatorias para artistas y espacios.”
Formulario con correo, selector “Quiero participar como” (Público, Artista o colectivo, Foro o espacio cultural, Organización), checkbox sin preseleccionar “Acepto recibir novedades de Cuicoyan y puedo cancelar en cualquier momento.”, CTA “Únete a Cuicoyan”, secundario “Explorar eventos”, nota de privacidad y mensaje de éxito “¡Listo! Ya eres parte del inicio de Cuicoyan. Te avisaremos cuando haya novedades.”
Footer con logo, “Donde la ciudad encuentra su escenario.”, grupos Explora/Participa/Información, redes, tema, privacidad, términos, accesibilidad y atribución discreta: “Cuicoyan es una plataforma desarrollada sobre la infraestructura digital de Ollin.” No muestres “Conoce Ollin” sin URL válida.

RESPONSIVE
Desktop: hero split, grids de 3–4 columnas, mapa/lista lado a lado. Tablet: grids de 2–3 columnas y mapa reequilibrado. Móvil: una columna, H1 42/46, botones de ancho completo, chips con scroll horizontal accesible, tarjetas en lista o carrusel manual, mapa seguido por lista, beneficios apilados y formulario en una columna. No ocultes fecha, sede, precio, CTA ni contenido esencial. No resuelvas desktop ampliando una pantalla móvil.

ACCESIBILIDAD Y ESTADOS
Cumple WCAG 2.2 AA, foco visible, orden semántico, labels, targets de 44 px, teclado completo, texto alternativo, mapa con lista, reducción de movimiento y color nunca como único indicador. Incluye diseños/variantes de loading con skeleton, vacío, error con “Reintentar”, éxito, disabled, hover, focus y active. Usa los mensajes exactos de pantalla.md. No muestres popups automáticos ni pidas ubicación al cargar.

RESTRICCIONES
No uses lorem ipsum, inglés, tipografías distintas, cifras, alianzas, testimonios o datos reales no confirmados. No muestres arquitectura de Ollin, backend, recomendación, interoperabilidad, costos, estrategia o roadmap. No uses marcos de teléfono, carruseles automáticos, scroll-jacking, patrones intensos, glassmorphism excesivo, clichés mexicanos ni símbolos culturales fuera de contexto. Mantén el isotipo sin deformar y usa placeholder reemplazable si no existe SVG.

Entrega una home coherente, lista para prototipar, con componentes reutilizables y rutas conceptuales definidas. El resultado debe invitar a usar Cuicoyan desde el primer viewport y equilibrar energía cultural con claridad funcional.
```
