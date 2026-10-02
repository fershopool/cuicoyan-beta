# Formularios de registro (artistas y foros)

Los formularios de `/unete/` envían cada registro por correo a **cuicoyan.ollin@gmail.com** mediante [FormSubmit](https://formsubmit.co) (sin backend propio). El endpoint vive en `frontend/src/config/environment.js` (`joinFormEndpoint`, sobrescribible con `VITE_JOIN_FORM_ENDPOINT`).

## Activación (una sola vez)
El primer envío real hace que FormSubmit mande un correo de confirmación a la cuenta destino. Abre ese correo y pulsa **Activate Form**. Hasta entonces los registros no llegan.

## Formato del correo
- **Asunto:** `[CUICOYAN][ARTISTA|FORO][Categoría] Nombre · Alcaldía · Folio`. La categoría es la primera disciplina marcada (artistas) o el tipo de espacio (foros).
  - Ej.: `[CUICOYAN][FORO][Teatro] Foro Alicia · Cuauhtémoc · CY-F-20261001-7KQ2`
- **Cuerpo:** tabla con `Folio`, `Tipo de registro`, `Fecha de envío` y `Categoría principal` y los campos propios de cada formulario (artista: trayectoria, integrantes, disponibilidad, requerimientos técnicos, material; foro: aforo, frecuencia, servicios, convocatorias), más redes como enlaces y celular (los opcionales vacíos se marcan `—`).
- **Responder** al correo contesta directo a la persona (`_replyto`). Quien se registra recibe un autoresponder con su folio.

## Filtros de Gmail sugeridos
Configuración → Filtros y direcciones bloqueadas → Crear filtro:

| Buscar (campo «Asunto») | Acción |
|---|---|
| `[CUICOYAN][ARTISTA]` | Aplicar etiqueta `Cuicoyan/Artistas` |
| `[CUICOYAN][FORO]` | Aplicar etiqueta `Cuicoyan/Foros` |
| `[CUICOYAN][ARTISTA][Danza]` (o cualquier categoría) | Etiqueta `Cuicoyan/Artistas/Danza` |
| `[CUICOYAN]` | Omitir recibidos si se prefiere solo revisar por etiqueta; opcional: marcar con estrella |

Para filtrar por zona o disciplina, busca en Gmail por texto del asunto o cuerpo (`subject:Coyoacán`, `Teatro`). El folio (`CY-A-…` / `CY-F-…`) es único por envío.

## Protecciones
Campo trampa (`_honey`), consentimiento obligatorio y validación en el navegador. Para reforzar contra spam se puede activar reCAPTCHA en FormSubmit (`_captcha`) o cambiar el correo visible por el alias aleatorio que FormSubmit entrega tras activar el formulario.
