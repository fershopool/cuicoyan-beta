# Contexto general de la web

> Plantilla base para preparar el contexto global que una herramienta de diseño con IA necesita antes de generar una web. Completar una vez por proyecto y reutilizarla en todas las pantallas.

## 1. Contexto del producto — punto 2.a

### Identidad

- **Nombre del producto o servicio:** Cuicoyan.
- **Marca propietaria:** Cuicoyan, producto cultural orientado al público y primer caso de uso visible del ecosistema Ollin. La relación con Ollin debe presentarse de forma discreta; Cuicoyan conserva una identidad, tono y experiencia propios.
- **Tipo de sitio:** portal cultural de descubrimiento y participación con enfoque product-led. Combina home editorial, catálogo de eventos, directorio de artistas y foros, mapa cultural, búsqueda, filtros y páginas de incorporación para quienes hacen cultura. No debe sentirse como una landing corporativa ni como un portal gubernamental.
- **Versión o etapa:** prototipo de alta fidelidad / MVP pre-lanzamiento, preparado para evolucionar a producto activo. En esta versión se representa una experiencia creíble y navegable; las integraciones de datos, cuentas y publicación pueden simularse.
- **URL o referencia existente:** URL pública por definir. Referencias visuales internas disponibles: `sources/Inicio_normal.png`, `sources/Inicio_Huapango.png`, `sources/Inicio_Teatro.png`, `sources/Evento.png`, `sources/Artistas.png`, `sources/Perfil_Artista.png`, `sources/Perfil_ForoCultural.png`, `sources/MapaCultural.png`, `sources/Favoritos.png` y `Cuicoyan-4K.png`. Estas referencias establecen la dirección visual, no deben copiarse como capturas dentro de la interfaz final.

### Propósito

- **¿Qué es?** Cuicoyan es una plataforma cultural para descubrir eventos, artistas, colectivos, foros y experiencias cercanas. Reúne la vida cultural de la ciudad en un mismo lugar y permite explorarla por ubicación, fecha, disciplina, intereses y contexto local. El nombre alude a Cuicoyan como “lugar del canto” o “lugar donde se canta”: un espacio contemporáneo donde la cultura ocurre, se encuentra y se comparte.
- **¿Qué problema resuelve?** La oferta cultural local está fragmentada entre redes sociales, carteles, sitios aislados, recomendaciones informales y agendas difíciles de consultar. Esto hace que el público se entere tarde o no encuentre actividades relevantes; también reduce la visibilidad de artistas, colectivos y espacios independientes. Cuicoyan centraliza el descubrimiento sin reducir la cultura a una simple cartelera.
- **¿Por qué es importante?** Facilita el acceso a experiencias culturales, visibiliza escenas grandes y pequeñas, conecta públicos con quienes crean y sostienen la cultura, y vuelve legible el territorio cultural de la ciudad. La cultura no debería depender de que el algoritmo correcto encuentre a una persona en el momento correcto.
- **Objetivo principal de la web:** lograr que una persona entienda en menos de cinco segundos qué ofrece Cuicoyan y empiece a explorar la actividad cultural de CDMX.
- **Acción principal que debe realizar el visitante:** iniciar la exploración de eventos y experiencias culturales, preferentemente con una categoría, fecha o zona como punto de entrada.
- **CTA principal y texto exacto:** “Explorar Cuicoyan”.
- **Objetivo secundario, si existe:** convertir a artistas, colectivos y foros en registros de interés o solicitudes de incorporación mediante el CTA “Quiero aparecer en Cuicoyan”; captar público interesado en el lanzamiento mediante “Únete a Cuicoyan”.

### Usuario y contexto de uso

- **Usuario principal:** personas que viven en o visitan CDMX y quieren descubrir qué hacer, dónde, cuándo, a qué precio y quién está detrás de cada experiencia cultural. Incluye público habitual y personas que no conocen bien la oferta cultural de la ciudad.
- **Usuarios secundarios:** artistas individuales; agrupaciones y colectivos; promotores; foros y espacios culturales independientes o institucionales; gestores culturales; instituciones con carteleras; prensa y posibles aliados del sector cultural.
- **Qué necesita encontrar o hacer:** buscar eventos, explorar por categoría, fecha o zona; detectar opciones cercanas; conocer precio, horario, sede y accesibilidad; guardar favoritos; consultar perfiles de artistas y espacios; abrir el mapa; conocer próximas fechas; registrarse para participar como artista o foro.
- **Nivel de conocimiento del usuario:** principalmente principiante o intermedio. No se debe asumir conocimiento de disciplinas, recintos, colonias o vocabulario técnico; la exploración tiene que funcionar tanto por intención (“este fin de semana”, “gratis”, “en familia”) como por categoría (“teatro”, “huapango”, “danza”).
- **Mercado, ciudad o país:** lanzamiento inicial en Ciudad de México, México. La arquitectura debe permitir crecer posteriormente por alcaldía, zona, ciudad y región sin rediseñar el sistema.
- **Idioma del contenido:** español de México, claro, cálido, directo e inclusivo. Conservar nombres propios y términos culturales en su forma correcta. Preparar la interfaz para internacionalización futura sin mezclar idiomas en esta versión.
- **Dispositivo o situación habitual de uso:** móvil mientras la persona decide un plan, se desplaza o consulta una ubicación; escritorio para explorar con calma, planear el fin de semana o registrar un perfil; tablet como experiencia intermedia. Considerar conexiones móviles variables y uso en exteriores.

### Alcance general

- **Páginas o pantallas previstas:** Inicio; Explorar; resultados de búsqueda; listado y detalle de Eventos; listado y perfil de Artistas/Colectivos; listado y perfil de Foros/Espacios; Mapa cultural; Favoritos; Para artistas y foros; Sobre Cuicoyan; registro de interés; estados de confirmación; aviso de privacidad, términos y accesibilidad. Evolución posterior: cuenta, agenda personal, calendario y páginas SEO por zona o categoría.
- **Secciones indispensables:** navegación global; buscador; hero; categorías; eventos destacados; mapa cultural; artistas; foros; beneficios para artistas y espacios; propósito; CTA de lanzamiento/participación; footer.
- **Funciones que sí deben representarse:** búsqueda por eventos, artistas o lugares; navegación por categorías; chips de intención y filtros básicos; tarjetas de evento, artista y foro; favorito; vista previa de mapa con pines; cambio de tema light/dark; CTA de registro; feedback de carga, vacío, error y éxito; rutas claras entre home, listados y detalles.
- **Funciones que quedan fuera de esta versión:** backend real; motor de recomendación; pagos o venta de boletos; mensajería; chat; publicación autogestionada completa; verificación automatizada; moderación; panel administrativo; sincronización con calendarios; geolocalización persistente; login social; infraestructura interna de Ollin; modelo de datos; mecanismos de interoperabilidad; acuerdos institucionales; costos, estrategia comercial y roadmap técnico detallado.
- **Contenido que ya existe:** identidad neo-mexicana/neo-prehispánica contemporánea; isotipo basado conceptualmente en la voluta de canto y el lugar; concepto “CDMX Cuicoyan”; tagline de producto “Donde la ciudad encuentra su escenario”; paletas light/dark; tipografías Bricolage Grotesque y Manrope; mockups de inicio, categorías, evento, artistas, mapa, favoritos y perfiles; ejemplos editoriales como “Sones del barrio”, “Fandango con la plaza”, “Foro Alicia” y “Casa del Lago Cultural”.
- **Contenido que debe proponer la IA:** composición responsive de cada página; adaptación web de los componentes móviles; selección de fotografías o placeholders coherentes; microcopy de ayuda y estados; distribución de tarjetas; iconografía consistente; demostración del mapa; datos ficticios claramente tratados como contenido de prototipo cuando falten datos confirmados. La IA no debe inventar cifras, alianzas, testimonios, reconocimientos, instituciones asociadas ni información logística presentada como real.

### Plataforma y experiencia

- **Plataforma:** web responsive para escritorio, tablet y móvil, con comportamiento de aplicación ligera. Debe ser usable con mouse, teclado y tacto.
- **Prioridad de diseño:** móvil primero para tareas de descubrimiento, pero la entrega debe incluir una composición de escritorio verdaderamente diseñada, no una versión móvil estirada. La home de referencia principal se valida en escritorio.
- **Ancho de referencia:** 1440 px para escritorio. Contenedor principal máximo de 1280 px, con gutters laterales de 80 px a 1440; 40 px en tablet; 20 px en móvil.
- **Breakpoints requeridos:** 360–479 px móvil compacto; 480–767 px móvil amplio; 768–1023 px tablet; 1024–1279 px laptop; 1280–1439 px escritorio; 1440 px o más escritorio amplio. Evitar saltos rígidos: usar escalas fluidas con `clamp()` cuando sea posible.
- **Navegadores o entornos relevantes:** últimas dos versiones estables de Chrome, Safari, Firefox y Edge; Safari iOS y Chrome Android. Diseñar sin depender de hover, blur, WebGL o filtros pesados para completar una tarea.
- **Requisitos de accesibilidad:** objetivo WCAG 2.2 AA; contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande/controles; foco de teclado visible; orden semántico correcto; enlace “Saltar al contenido”; objetivos táctiles mínimos de 44 × 44 px; etiquetas y mensajes de error asociados; texto alternativo; mapa con alternativa en lista; iconos acompañados por texto o nombre accesible; no usar color como único indicador; respetar `prefers-reduced-motion`; no reproducir audio o video automáticamente; zoom hasta 200 % sin pérdida de contenido; modo claro y oscuro con contraste verificado por separado.

## 2. Sistema visual — punto 2.b

### Personalidad de marca

- **Adjetivos que deben describir la experiencia:** viva, cultural, local, cálida, contemporánea, inclusiva, curiosa, expresiva, nocturna cuando corresponde, confiable y fácil de explorar.
- **Qué debe sentir el usuario:** que la ciudad tiene algo ocurriendo cerca; entusiasmo por descubrir; pertenencia sin exclusividad; confianza para decidir un plan; reconocimiento de una identidad mexicana contemporánea, no folclorizada.
- **Tono de comunicación:** cercano, invitacional, concreto y optimista. Hablar desde la acción: “Descubre”, “Explora”, “Conoce”, “Encuentra”, “Guarda”, “Participa”. Evitar grandilocuencia, lenguaje burocrático, tecnicismos, exotización y promesas absolutas.
- **Referencias visuales o marcas de inspiración:** los mockups suministrados de Cuicoyan son la fuente principal. Como principios —no para copiar interfaces—: claridad editorial de una agenda cultural, exploración geográfica de un mapa de ciudad, energía cromática de festivales mexicanos contemporáneos y fluidez de una app de descubrimiento.
- **Qué no debe parecer:** portal de gobierno, folleto turístico genérico, sitio de venta de boletos, red social saturada, museo solemne, catálogo corporativo, aplicación “prehispánica” tematizada, estética artesanal de souvenir, interfaz cyberpunk o casino de neón.

### Logotipo y recursos de marca

- **Logotipo disponible:** sí, en referencias y archivos del proyecto. Debe solicitarse/exportarse además una versión maestra SVG del isotipo y del lockup “Cuicoyan” para producción. Mientras no exista el SVG final dentro del proyecto, usar un contenedor de asset reemplazable; nunca redibujar el símbolo a partir de una captura.
- **Ubicación preferida del logotipo:** extremo izquierdo de la navegación global; isotipo y palabra “Cuicoyan” en escritorio, isotipo compacto en móvil. Puede reaparecer de forma contenida en el footer y en la composición final, sin convertirlo en textura repetitiva.
- **Variantes permitidas:** lockup horizontal; isotipo independiente; versión sobre fondo claro; versión sobre fondo oscuro; monocromática únicamente cuando la reproducción lo exija. Respetar área de seguridad equivalente al ancho del elemento central del isotipo.
- **Íconos o símbolos propios:** isotipo contemporáneo inspirado en la voluta del canto, una flor y la idea de lugar/recinto; patrones geométricos neo-prehispánicos secundarios; pines de mapa con marca; iconos de categorías. Los símbolos culturales deben usarse con intención y sin afirmar que son reproducciones arqueológicas exactas.
- **Recursos que deben conservarse sin alteraciones:** proporciones, geometría esencial, orientación y colores autorizados del isotipo; ortografía “Cuicoyan”; nombres Bricolage Grotesque y Manrope; asociación de colores por categoría; gradiente de marca. No deformar, recolorear arbitrariamente, recortar, aplicar perspectiva ni añadir texto dentro del isotipo.

### Tipografía

- **Tipografía principal:** Bricolage Grotesque, Google Fonts. Fuente display para marca editorial y contenido de alto impacto.
- **Tipografía secundaria:** Manrope, Google Fonts. Fuente funcional para interfaz, lectura y datos.
- **Pesos permitidos:** Bricolage Grotesque 500 Medium, 600 SemiBold, 700 Bold y 800 ExtraBold solo para hero corto; Manrope 400 Regular, 500 Medium, 600 SemiBold y 700 Bold. No usar pesos finos por debajo de 400.
- **Uso de cada tipografía:** Bricolage Grotesque para H1–H3, títulos de tarjetas, frases manifiesto y cifras de alto impacto; Manrope para navegación, botones, cuerpo, formularios, filtros, precios, fechas, ubicaciones, badges, captions y mensajes de estado. No usar tipografías pseudo-prehispánicas; la identidad cultural proviene del sistema, no de sacrificar legibilidad.
- **Tamaño o jerarquía aproximada:** Hero desktop Bricolage 72/76 px 700, máximo 12 palabras y 9–11 caracteres promedio por línea; hero móvil 42/46 px. H1 desktop 56/62 px y móvil 36/42 px. H2 desktop 44/50 px y móvil 30/36 px. H3 desktop 28/34 px y móvil 24/30 px. Título de tarjeta 20–24/26–30 px. Body grande Manrope 20/30 px; body base 16/26 px; body pequeño 14/22 px; botón 15–16/20 px 600; metadata 13–14/20 px 500; eyebrow 12–13/16 px 700, mayúsculas y tracking de 0.08 em. Limitar texto corrido a 65–72 caracteres por línea.

### Paleta de colores

La paleta es semántica: Bugambilia identifica a Cuicoyan; los demás colores expresan categorías o estados. Mantener una proporción aproximada de 70 % neutros, 20 % color contextual y 10 % color de marca. Los colores oscuros y claros son variantes deliberadas, no inversiones automáticas.

| Rol | Nombre descriptivo | Código HEX | Uso | ¿Obligatorio? |
|---|---|---|---|---|
| Fondo principal light | Marfil Cuicoyan | `#FFF9F8` | Fondo general cálido; evita blanco clínico | Sí |
| Fondo secundario light | Rosa niebla | `#FFF3F6` | Bandas, bloques alternos, estados suaves | Sí |
| Superficie light | Blanco | `#FFFFFF` | Tarjetas, header, formularios y paneles elevados | Sí |
| Superficie cultural light | Papel cempasúchil | `#FFF7EE` | Bloques editoriales o de propósito | Opcional |
| Texto principal light | Noche | `#11152E` | Encabezados y texto de alta jerarquía | Sí |
| Texto secundario light | Piedra violeta | `#5F6273` | Cuerpo y descripciones | Sí |
| Texto tenue light | Neblina | `#8E909D` | Metadata secundaria; no usar en tamaños pequeños si falla contraste | Sí |
| Borde light | Barro claro | `#ECE4E7` | Divisores, inputs y tarjetas | Sí |
| Primario light | Bugambilia accesible | `#E91662` | CTA principal, links, selección y foco | Sí |
| Turquesa light | Turquesa profundo | `#009BA5` | Huapango, ubicación, mapa y contexto tradicional | Sí |
| Cempasúchil light | Cempasúchil profundo | `#E96F00` | Fandango, fiesta y destacados | Sí |
| Jacaranda light | Jacaranda profunda | `#7936D2` | Danza, creatividad y acento | Sí |
| Grana light | Grana profunda | `#D62650` | Teatro e intensidad | Sí |
| Talavera light | Talavera profunda | `#008EB5` | Música e información | Sí |
| Jade light | Jade profundo | `#008F70` | Comunidad y éxito accesible | Sí |
| Maíz light | Maíz profundo | `#C98D00` | Reconocimiento y advertencias no críticas | Opcional |
| Fondo principal dark | Noche Cuicoyan | `#080817` | Fondo general azul-violeta, nunca negro absoluto | Sí |
| Superficie dark | Obsidiana azul | `#101126` | Tarjetas, navegación y paneles | Sí |
| Fondo secundario dark | Tinta violeta | `#16132B` | Secciones alternas y filtros | Sí |
| Superficie elevada dark | Noche elevada | `#1D1735` | Modales y tarjetas con jerarquía | Sí |
| Texto principal dark | Luz de papel | `#F9F7FC` | Encabezados y cuerpo principal | Sí |
| Texto secundario dark | Niebla lavanda | `#B6B2C2` | Texto secundario | Sí |
| Texto tenue dark | Ceniza violeta | `#807C91` | Metadata no crítica; validar contraste | Sí |
| Borde dark | Piedra nocturna | `#292540` | Divisores e inputs | Sí |
| Borde elevado dark | Jacaranda apagada | `#3A3154` | Elementos elevados o activos | Opcional |
| Primario dark | Bugambilia luz | `#FF3D8D` | CTA, foco, selección y acentos luminosos | Sí |
| Turquesa dark | Turquesa luz | `#17E0E4` | Huapango, mapa y ubicación | Sí |
| Cempasúchil dark | Cempasúchil luz | `#FF9D2E` | Fandango y destacados | Sí |
| Jacaranda dark | Jacaranda luz | `#B45CFF` | Danza y creatividad | Sí |
| Grana dark | Grana luz | `#FF506F` | Teatro e intensidad | Sí |
| Talavera dark | Talavera luz | `#24C8EF` | Música e información | Sí |
| Jade dark | Jade luz | `#20D5A7` | Éxito y comunidad | Sí |
| Maíz dark | Maíz luz | `#FFC84D` | Reconocimiento y advertencia | Opcional |
| Color primario de marca | Bugambilia | `#F21F6D` | Referencia cromática maestra; identidad y assets | Sí |
| Color secundario de marca | Turquesa | `#00AEB8` | Complemento de marca y ubicación | Sí |
| Color de acento | Gradiente Cuicoyan | `#F21F6D → #8A3FFC → #00C7D4` | Hero, selección especial, IA/recomendación y CTA final; máximo un gran uso por viewport | Sí |
| Acento de evento | Gradiente Fiesta | `#FF9D2E → #F21F6D` | Festival, evento especial o insignia destacada | Opcional |
| Éxito | Jade | Light `#008F70` / Dark `#20D5A7` | Confirmación y disponibilidad | Sí |
| Advertencia | Maíz | Light `#C98D00` / Dark `#FFC84D` | Avisos recuperables | Sí |
| Error | Grana accesible | Light `#C61F46` / Dark `#FF6B84` | Error y validación; acompañar con icono/texto | Sí |
| Información | Talavera | Light `#008EB5` / Dark `#24C8EF` | Ayuda y mensajes informativos | Sí |

Asociación fija de categorías: Todos = Bugambilia; Huapango = Turquesa; Fandango = Cempasúchil; Danza = Jacaranda; Teatro = Grana; Música = Talavera; Talleres = Bugambilia/Rosa mexicano; Artes marciales = Talavera/Turquesa; Cultura urbana = Cempasúchil. Cada chip debe combinar icono, etiqueta y color; nunca depender solo del color.

### Componentes y composición

- **Estilo de botones:** altura mínima 48 px en escritorio y 52 px en móvil; texto Manrope 600; primario sólido Bugambilia con texto blanco y hover más oscuro en light, Bugambilia luz con texto Noche en dark si el contraste lo exige; secundario outline de 1.5 px; terciario tipo texto con flecha; icon button de 44–48 px con nombre accesible. Radio 14–16 px para botones principales, 999 px para chips. Estados hover, focus, active, disabled y loading siempre definidos.
- **Estilo de campos y formularios:** altura 52–56 px; label externo persistente, no depender del placeholder; fondo de superficie; borde 1 px y borde de foco 2 px Bugambilia; icono opcional a la izquierda; ayuda o error debajo; radio 14–16 px. En búsqueda global puede utilizarse forma cápsula de 56–64 px. Los formularios de alta solo piden datos mínimos y explican el uso de la información.
- **Radio de bordes:** ligeramente a muy redondeado según jerarquía: 12 px en controles pequeños; 16 px en botones/inputs; 20 px en tarjetas; 24–32 px en contenedores editoriales y hero; 999 px solo para chips, avatares o botones cápsula. No redondear cada elemento de manera indiscriminada.
- **Sombras:** sutiles en light (`0 8px 30px rgba(17,21,46,.08)`), combinadas con borde. En dark priorizar borde y elevación tonal; glow contextual máximo de 0 0 24 px con 18–25 % de opacidad en el elemento seleccionado, nunca sobre todo el layout.
- **Densidad visual:** equilibrada y respirable. La interfaz puede ser viva, pero la información logística debe escanearse sin esfuerzo. Una sección debe tener un foco principal y no más de dos acentos cromáticos dominantes.
- **Ancho máximo del contenido:** 1280 px; texto editorial 720–760 px; formularios 560–640 px; mapa o galerías pueden extenderse al ancho del contenedor. Secciones full-bleed permitidas únicamente para hero, bandas de propósito y CTA final.
- **Sistema de espaciado o ritmo:** base 4 px, con escala 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120. Padding de tarjeta 20–24 px móvil y 24–32 px escritorio. Separación vertical de secciones 72–88 px móvil y 112–144 px escritorio.
- **Estilo de tarjetas, tablas o paneles:** tarjetas con imagen dominante, contenido estructurado y borde tenue; ratio de imagen coherente por familia. Evento: 4:3 o 16:10, fecha/horario, título, sede, zona, etiquetas, precio y favorito. Artista: retrato 1:1 o 4:5, nombre, disciplina, breve descripción y próxima fecha. Foro: imagen 16:10, nombre, tipo, colonia y próxima actividad. Evitar tablas en la home; usar listas semánticas cuando la comparación no sea necesaria.
- **Estilo de navegación:** header sticky de 72–80 px en escritorio, fondo marfil/blanco o Noche con transparencia moderada y borde inferior; logo a la izquierda; navegación central; búsqueda, tema y CTA a la derecha. En móvil: barra de 64–72 px, logo, búsqueda y menú; drawer accesible con navegación y CTA. Mantener “Inicio, Explorar, Eventos, Artistas, Foros, Mapa, Para creadores, Sobre Cuicoyan”.
- **Animaciones permitidas:** microinteracciones de 150–220 ms; entradas al viewport de 250–400 ms con opacidad y desplazamiento máximo 16 px; pines con pulso sutil una vez; feedback del favorito; hover de tarjeta con elevación de 2–4 px. Sin parallax agresivo, rebotes continuos, fondos animados pesados ni movimiento imprescindible para comprender. Desactivar o simplificar con `prefers-reduced-motion`.

### Imágenes e ilustraciones

- **Tipo de imágenes:** fotografía documental/editorial de eventos, artistas, públicos y espacios reales; ilustración neo-mexicana contemporánea para hero o transiciones; mapas; iconos lineales propios; patrones abstractos inspirados en la geometría del sistema.
- **Tratamiento visual:** color intenso pero pieles naturales; encuadres con acción, comunidad y lugar; gradiente u overlay solo para garantizar lectura; esquinas de 20–28 px; bordes de acento muy controlados; modos light y dark con la misma narrativa. Combinar planos amplios del espacio con retratos y detalles de práctica cultural.
- **Temas o sujetos permitidos:** música, danza, teatro, huapango, fandango, talleres, artes marciales, cultura urbana, artes visuales, públicos diversos, arquitectura y calles de CDMX, foros independientes, centros culturales y encuentros comunitarios. Mostrar prácticas vivas y contemporáneas, no una colección de símbolos aislados.
- **Fuentes o archivos disponibles:** todos los PNG de `sources/` y las composiciones `Cuicoyan-4K.png` / `Cuicoyan.png` como referencia de dirección. Para producción, sustituir imágenes de prototipo por material con derechos y consentimiento; conservar créditos cuando apliquen. No extraer ni reconstruir logos desde capturas.
- **Uso de imágenes generadas por IA:** sí, únicamente para prototipo, exploración visual o placeholders claramente identificables; no deben atribuirse a personas, recintos o eventos reales. En producción, priorizar fotografía autorizada de la escena cultural local.
- **Elementos que deben evitarse:** clichés de sombrero, sarape, bigote, calaveras o pirámides sin relación con el contenido; apropiación de símbolos sagrados; mezcla arbitraria de culturas mesoamericanas; rostros deformes o multitudes artificiales; texto generado dentro de imágenes; fotos de stock corporativas; saturación, neón o glow excesivos; fondos ocupados detrás de copy largo; imágenes sin contexto geográfico o cultural.

### Reglas de diseño

#### Obligatorio

- La home debe contar la historia “Descubre → entiende → explora → confía → participa”.
- Cuicoyan debe sentirse como una extensión utilizable de la app, no como una página informativa externa.
- Mantener Bricolage Grotesque para títulos y Manrope para UI/cuerpo.
- Usar exactamente los tokens light/dark definidos y conservar Bugambilia como firma de marca.
- Mantener la asociación estable entre categoría, color, icono y etiqueta.
- Mostrar utilidad antes que filosofía institucional: evento, fecha, lugar, precio, artista y mapa deben aparecer temprano.
- Separar con claridad “Cuicoyan = producto cultural para el público” de “Ollin = infraestructura que lo habilita”. La única mención recomendada está en el footer o Sobre Cuicoyan: “Cuicoyan es una plataforma desarrollada sobre la infraestructura digital de Ollin.”
- Usar componentes reutilizables, estados completos y destinos de navegación definidos.
- Garantizar accesibilidad WCAG 2.2 AA y equivalencia funcional entre mouse, teclado y tacto.
- Diseñar contenido realista en español; si un dato no está confirmado, tratarlo como ejemplo de prototipo y no como afirmación pública.
- Conservar el isotipo y patrones como activos de marca; nunca reconstruirlos libremente.
- Permitir tema light y dark sin que dark sea una simple inversión y sin cambiar la arquitectura.

#### Puede proponer la IA

- Orden fino y ritmo de elementos dentro de cada sección, manteniendo la arquitectura establecida.
- Selección de fotografías placeholder coherentes y sus recortes responsive.
- Variaciones discretas de patrones geométricos secundarios, con opacidad máxima de 4–8 %.
- Microcopy de ayuda, carga, vacío y error en el tono de Cuicoyan.
- Iconos lineales consistentes para categorías y acciones, siempre que no sustituyan el isotipo.
- Una demostración no funcional o simulada del mapa, los filtros y el favorito para el prototipo.
- Ajustes ópticos de tipografía, espaciado y número de columnas por breakpoint.
- Alternar fondos light/dark en secciones si preserva contraste y continuidad; no convertir cada sección en una paleta distinta.

#### No hacer

- No usar la estructura “Quiénes somos / Misión / Visión / Servicios” como narrativa principal.
- No presentar a Cuicoyan solo como cartelera, red social o plataforma de boletaje.
- No revelar arquitectura, backend, modelo de datos, recomendación, interoperabilidad de Ollin, costos internos, estrategia comercial, acuerdos pendientes o roadmap técnico.
- No inventar estadísticas, número de usuarios/eventos, alianzas, testimonios, premios, disponibilidad, horarios, precios o datos de contacto reales.
- No usar lorem ipsum, texto en inglés, copys vagos como “Descubre más” cuando exista una acción específica, ni CTAs sin destino.
- No usar negro puro como fondo dark ni blanco puro como fondo general light.
- No usar todos los colores simultáneamente con el mismo peso; respetar 70/20/10.
- No abusar de degradados, glows, glassmorphism, sombras, patrones o animaciones.
- No usar tipografías decorativas pseudo-prehispánicas, serif ornamentales o fuentes diferentes a las definidas.
- No deformar el logotipo, agregarle efectos, convertirlo en patrón de fondo ni colocarlo sobre imágenes sin contraste.
- No ocultar información crítica dentro de carruseles automáticos, hover o mapa sin alternativa en lista.
- No diseñar solo para escritorio; no reducir móvil a tarjetas apiladas sin jerarquía.
- No solicitar geolocalización, cuenta, teléfono o datos sensibles antes de que exista una razón clara y consentimiento.

## 3. Prioridades de interpretación

Cuando exista conflicto entre instrucciones, aplicar este orden:

1. Requisitos funcionales y objetivo de la página.
2. Identidad de marca y sistema visual.
3. Contenido y jerarquía de información.
4. Preferencias estéticas secundarias.

Reglas adicionales de desempate para Cuicoyan:

- Accesibilidad y legibilidad prevalecen sobre efectos visuales.
- La utilidad cultural concreta prevalece sobre el discurso institucional.
- La información confirmada prevalece sobre cualquier dato generado para maqueta.
- Los assets oficiales prevalecen sobre reinterpretaciones de la IA.
- En pantallas pequeñas prevalecen búsqueda, categoría, fecha, ubicación y CTA; la decoración se simplifica primero.

## 4. Checklist antes de usar este archivo

- [x] El objetivo principal está escrito en una sola frase.
- [x] Se conoce el usuario principal.
- [x] La acción principal y su texto están definidos.
- [x] La plataforma y la prioridad responsive están definidas.
- [x] Los colores incluyen códigos HEX y roles de uso.
- [x] La tipografía y sus usos están definidos.
- [x] Se separaron las reglas obligatorias de las sugerencias.
- [x] Se anotaron explícitamente los elementos que no deben aparecer.
