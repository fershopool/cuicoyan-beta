# Cuicoyan · staging estático

Entrega estática con fixtures locales como fallback. La agenda, el mapa y el detalle pueden consultar el backend Cuicoyan cuando se configura su URL. El acceso de perfiles funciona únicamente por invitación administrativa de Supabase Auth.

## Ejecutar

```bash
cd Cuicoyan/web/frontend
npm run build
npm run dev
```

`npm run build` genera `Cuicoyan/web/dist`. Para publicar, subir el contenido de `dist` a un hosting estático. `npm run preview` sirve la carpeta `dist` en el puerto 4173.

Para GitHub Pages actual, la build usa `/cuicoyan-site/` y publica en [fershopool.github.io/cuicoyan-site](https://fershopool.github.io/cuicoyan-site/). El origen CORS es `https://fershopool.github.io`; el backend no se aloja en GitHub Pages.

`vite.config.js` deja preparado el mapa de entradas MPA para la siguiente iteración. Esta primera entrega usa el generador Node sin dependencias para que `npm ci` y la build funcionen también sin acceso a internet.

## Decisiones

- HTML, CSS y JavaScript nativo por módulos; no hay CDN ni fuentes remotas.
- Tema, intereses y favoritos se guardan localmente bajo `cuicoyan:v1`; no se almacenan datos personales.
- Los formularios de registro de `/unete/` envían cada solicitud por correo al equipo vía FormSubmit; ver `docs/formulario-registro.md` (activación, formato del asunto y filtros de Gmail).
- La interfaz sigue los mockups de `Mockups/`: modo app (≤ 900 px) con dock inferior y escenas por categoría, y adaptación de escritorio. Los estilos de esa capa viven en `frontend/src/styles/mockup.css` (se carga después de `app.css`); los iconos, en `components/icons.js`; las pantallas de app, en `components/app-pages.js`.
- Tipografías de marca (Bricolage Grotesque y Manrope) autoalojadas en `src/assets/fonts`.
- Las rutas tienen `noindex,nofollow` mientras se verifica contenido, derechos y textos legales.

## Publicación actual

La fuente permanece en el repositorio `fershopool/cuicoyan-web`. La copia estática publicada se mantiene en [cuicoyan-site](https://github.com/fershopool/cuicoyan-site). CI valida la fuente; la publicación continúa siendo una sincronización explícita de `dist` hasta definir un único repositorio de despliegue.
