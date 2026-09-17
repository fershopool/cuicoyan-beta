# Cuicoyan · staging estático

Entrega inicial ejecutable sin base de datos, backend, autenticación ni cuentas. Los registros de agenda, artistas y foros son fixtures locales marcados como demostración.

## Ejecutar

```bash
cd Cuicoyan/web/frontend
npm run build
npm run dev
```

`npm run build` genera `Cuicoyan/web/dist`. Para publicar, subir el contenido de `dist` a un hosting estático. `npm run preview` sirve la carpeta `dist` en el puerto 4173.

`vite.config.js` deja preparado el mapa de entradas MPA para la siguiente iteración. Esta primera entrega usa el generador Node sin dependencias para que `npm ci` y la build funcionen también sin acceso a internet.

## Decisiones

- HTML, CSS y JavaScript nativo por módulos; no hay CDN ni fuentes remotas.
- Tema, intereses y favoritos se guardan localmente bajo `cuicoyan:v1`; no se almacenan datos personales.
- Los formularios de participación permanecen pendientes hasta configurar un canal externo aprobado mediante `.env`.
- Las rutas tienen `noindex,nofollow` mientras se verifica contenido, derechos y textos legales.

## Publicación actual

La fuente permanece en el repositorio privado `fershopool/cuicoyan-web`. La copia estática publicada se mantiene en [cuicoyan-site](https://github.com/fershopool/cuicoyan-site) y se sirve en [fershopool.github.io/cuicoyan-site](https://fershopool.github.io/cuicoyan-site/).
