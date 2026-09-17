# Inventario de referencias Cuicoyan

## Fuente y clasificación

- `general.md`: contrato de producto, identidad, paleta, responsive y límites.
- `pantalla.md`: ficha canónica `CUI-WEB-HOME-001`; define copy y orden de nueve secciones.
- `iteraciones.md`: historial de decisiones y ajustes.
- `stitch_cuicoyan_app_landing_page/`: 27 `code.html`, duplicados de documentación, `logo.svg` y referencias visuales.
- `neo_mexicano_vivo/DESIGN.md`: tokens visuales secundarios.

## Consolidación aplicada

- Home `_1` y `_2` se tratan como una sola Home; el modo oscuro es estado de tema.
- Explorar y resultados de búsqueda se unifican en `/explorar/` con `URLSearchParams`.
- Directorios y perfiles se separan en `/eventos/`, `/artistas/`, `/foros/` y detalles por slug.
- `mi_cuicoyan` se reduce a `/favoritos/`; no hay perfil ni cuenta.
- Variantes de creador se reducen a `/para-creadores/` y `/unete/`.
- Sobre/soporte se distribuyen en `/sobre-cuicoyan/` y `/ayuda/`.

## Estado de la implementación

La carpeta Stitch y sus 43 capturas permanecen intactas. La implementación vive en `frontend/`, usa fixtures JSON claramente marcados como `demo` y genera una salida estática en `dist/`.
