import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Vite queda preparado para la siguiente iteración. La build sin dependencias
// usa ../scripts/prepare-dist.mjs, por lo que el prototipo también funciona
// en entornos offline y en servidores de archivos estáticos.
const pages = ['index', 'explorar/index', 'eventos/index', 'eventos/sones-del-barrio/index', 'artistas/index', 'artistas/luna-mestiza/index', 'foros/index', 'foros/foro-alicia/index', 'mapa/index', 'favoritos/index', 'onboarding/intereses/index', 'para-creadores/index', 'unete/index', 'convocatorias/index', 'sobre-cuicoyan/index', 'ayuda/index', 'accesibilidad/index', 'privacidad/index', 'terminos/index'];
export default defineConfig({ root: '.', base: '/', build: { outDir: '../dist-vite', emptyOutDir: true, rollupOptions: { input: Object.fromEntries(pages.map((page) => [page.replaceAll('/', '-'), resolve(process.cwd(), `${page}.html`)])) } } });
