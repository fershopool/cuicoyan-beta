# Manifest de assets Cuicoyan

Assets de demostración generados para acercar la interfaz al lenguaje editorial de los mockups. No representan eventos, personas o recintos verificados y deben sustituirse por material con derechos antes de producción.

| Archivo | Dimensiones | Uso | Procedencia / prompt resumido |
|---|---:|---|---|
| `frontend/src/assets/cuicoyan/hero-cdmx.webp` | 1800 × 675 | Hero de Inicio | ImageGen; collage editorial panorámico de CDMX con Bellas Artes, Torre Latinoamericana, flores, papel picado, textiles e instrumento de cuerda; sin texto ni marcas. |
| `frontend/src/assets/cuicoyan/event-sones-del-barrio.webp` | 1200 × 900 | Tarjetas de “Sones del barrio” | ImageGen; instrumentos de cuerda sobre textiles bordados, flores y reunión musical íntima; sin texto ni marcas. |
| `frontend/src/assets/cuicoyan/event-fandango-con-la-plaza.webp` | 1200 × 900 | Tarjetas de “Fandango con la plaza” | ImageGen; baile en plaza de Coyoacán, falda bordada, zapateado, músicos y papel picado; sin texto ni marcas. |
| `frontend/src/assets/cuicoyan/event-la-ciudad-en-azul.webp` | 1200 × 900 | Tarjetas de “La ciudad en azul” | ImageGen; guitarrista en foro independiente nocturno con iluminación azul y audiencia; sin texto ni marcas. |
| `frontend/src/assets/cuicoyan/event-cuentos-para-volar.webp` | 1200 × 750 | Tarjetas de “Cuentos para volar” | ImageGen; teatro de objetos, libro abierto, títeres y público familiar; sin texto ni marcas. |
| `frontend/src/assets/cuicoyan/venue-foro-alicia.webp` | 1400 × 877 | Tarjetas de Foro Alicia | ImageGen; foro cultural independiente al atardecer con escenario, audiencia, plantas y luces cálidas; sin texto ni marcas. |

Formato final: WebP optimizado para web. Las imágenes se cargan como elementos `<img>` reales con `alt`, `loading="lazy"` fuera del hero y dimensiones controladas por CSS; no se usan como sustituto de la interfaz completa.

## Cartografía integrada

La vista Mapa cultural consume los recursos locales de `frontend/src/assets/cartografia/`:

- `mapas/cdmx.pmtiles`: mapa vectorial de CDMX basado en Protomaps / OpenStreetMap.
- `estilos/cuicoyan-style.local.json`: estilo cartográfico de Cuicoyan.
- `limites/`: alcaldías, máscara exterior y leyenda `Próximamente`.
- `recursos/vendor/`: MapLibre GL JS, lector PMTiles y sus estilos locales.
- `recursos/basemaps-assets-main/`: glifos y sprites requeridos por el estilo.
- `manifest.json`: procedencia, versiones, licencia y suma de verificación de la fuente cartográfica.

La interfaz muestra la atribución de OpenStreetMap mediante el control de MapLibre. Los puntos de los espacios culturales son demostrativos y permanecen marcados como `Punto conceptual · por verificar` hasta contar con coordenadas aprobadas.

## Recortes de los mockups (interfaz tipo app)

`frontend/src/assets/mockup/` se genera recortando las pantallas de `Mockups/Light` y `Mockups/Dark` (exportadas a ~941 px de ancho) y retocando los botones/precios que venían incrustados en la imagen. Sustituir por las ilustraciones originales en alta resolución antes de producción.

| Archivo | Uso | Origen |
|---|---|---|
| `hero-{todos,huapango,teatro}-{light,dark}.webp` | Escena del encabezado móvil de Inicio (cambia con la categoría) | `Inicio_normal`, `Inicio_Huapango`, `Inicio_Teatro` |
| `ev-{sones,fandango,cuentos}-{light,dark}.webp` | Imagen derecha de las tarjetas de evento | `Inicio_normal`, `Inicio_Huapango`, `Inicio_Teatro` |
| `avatar-*.webp` | Avatares de artistas (Artistas, Favoritos, fichas) | `Light/Artistas` |
| `quetzal.webp` | Ficha de Raíces del Viento (recorte con transparencia por color) | `Light/Perfil_Artista` |
| `foro-alicia-hero.webp` | Cabecera de la ficha de Foro Alicia | `Light/Perfil_ForoCultural` |
| `evento-hero.webp` | Cabecera de “Fandango con la plaza” | `Light/Evento` |
| `palacio-mapa-{light,dark}.svg` | Ilustración vectorial (Bellas Artes) del encabezado del Mapa cultural; sustituye a `palacio-mapa.webp` | `Light/MapaCultural` |
| `fav-*.webp` | Miniaturas y banner de Favoritos | `Light/Favoritos` |

Los datos demostrativos (eventos, artistas, direcciones de tres foros) se alinearon con el texto visible en los mockups y siguen marcados como `isDemo`.
