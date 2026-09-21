import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Vite queda preparado para la siguiente iteración. La build sin dependencias
// usa ../scripts/prepare-dist.mjs, por lo que el prototipo también funciona
// en entornos offline y en servidores de archivos estáticos.
const pages = [
  ['index', 'inicio/inicio'],
  ['explorar-index', 'explorar/explorar'],
  ['eventos-index', 'eventos/eventos'],
  ['eventos-sones-del-barrio', 'eventos/sones-del-barrio/sones-del-barrio'],
  ['artistas-index', 'artistas/artistas'],
  ['artistas-luna-mestiza', 'artistas/luna-mestiza/luna-mestiza'],
  ['foros-index', 'foros/foros'],
  ['foros-foro-alicia', 'foros/foro-alicia/foro-alicia'],
  ['mapa-index', 'mapa/mapa'],
  ['favoritos-index', 'favoritos/favoritos'],
  ['onboarding-intereses', 'onboarding/intereses/intereses'],
  ['para-creadores-index', 'para-creadores/para-creadores'],
  ['unete-index', 'unete/unete'],
  ['convocatorias-index', 'convocatorias/convocatorias'],
  ['sobre-cuicoyan-index', 'sobre-cuicoyan/sobre-cuicoyan'],
  ['ayuda-index', 'ayuda/ayuda'],
  ['accesibilidad-index', 'accesibilidad/accesibilidad'],
  ['privacidad-index', 'privacidad/privacidad'],
  ['terminos-index', 'terminos/terminos'],
];

export default defineConfig({ root: '.', base: '/', build: { outDir: '../dist-vite', emptyOutDir: true, rollupOptions: { input: Object.fromEntries(pages.map(([name, page]) => [name, resolve(process.cwd(), `src/pages/${page}.html`)])) } } });
