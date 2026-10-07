import { cp, rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(web, 'frontend');
const dist = path.join(web, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(source, dist, { recursive: true, filter: (entry) => path.basename(entry) !== '.DS_Store' && !entry.includes(`${path.sep}node_modules${path.sep}`) && !entry.endsWith(`${path.sep}dist`) });
await materializePages(path.join(source, 'src/pages'), dist);
await rm(path.join(dist, 'src/pages'), { recursive: true, force: true });
const baseUrl = process.env.VITE_BASE_URL || '/cuicoyan-site/';
const cuicoyanApiUrl = process.env.VITE_CUICOYAN_API_URL || '';
const cuicoyanAllowedOrigins = process.env.VITE_CUICOYAN_ALLOWED_ORIGINS || '';
const idpFailureGraceSeconds = Number(process.env.VITE_IDP_FAILURE_GRACE_SECONDS || 300);
await writeFile(path.join(dist, 'src/config/site-base.js'), `export const siteBase = ${JSON.stringify(baseUrl)};\nexport const cuicoyanApiUrl = ${JSON.stringify(cuicoyanApiUrl)};\nexport const cuicoyanAllowedOrigins = ${JSON.stringify(cuicoyanAllowedOrigins)};\nexport const idpFailureGraceSeconds = ${idpFailureGraceSeconds};\n`);
// Evita publicar el manifiesto de desarrollo de npm en el hosting estático.
await rm(path.join(dist, 'package.json'), { force: true });
await rm(path.join(dist, 'vite.config.js'), { force: true });
console.log(`Cuicoyan: salida estática lista en ${dist}`);
console.log(`Rutas HTML: ${(await findHtml(dist)).length}`);

async function findHtml(dir) { const entries = await readdir(dir, { withFileTypes: true }); const result = []; for (const entry of entries) { const file = path.join(dir, entry.name); if (entry.isDirectory()) result.push(...await findHtml(file)); else if (entry.name.endsWith('.html')) result.push(file); } return result; }

async function materializePages(pages, destinationRoot) {
  for (const page of await findHtml(pages)) {
    const relative = path.relative(pages, page);
    const pageDirectory = path.dirname(relative);
    const pageName = path.basename(relative, '.html');
    const outputDirectory = pageDirectory === 'inicio' && pageName === 'inicio' ? destinationRoot : path.join(destinationRoot, pageDirectory);
    await mkdir(outputDirectory, { recursive: true });
    const outputPage = path.join(outputDirectory, 'index.html');
    await cp(page, outputPage);
    const pageHtml = await readFile(outputPage, 'utf8');
    if (!pageHtml.includes('rel="icon"')) {
      const relativeRoot = path.relative(outputDirectory, destinationRoot).replaceAll(path.sep, '/') || '.';
      const icons = `<link rel="icon" href="${relativeRoot}/public/tab.ico?v=5" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="32x32" href="${relativeRoot}/public/tab-32.png?v=5"><link rel="icon" type="image/png" sizes="64x64" href="${relativeRoot}/public/tab-64.png?v=5">`;
      await writeFile(outputPage, pageHtml.replace('</head>', `${icons}<link rel="apple-touch-icon" href="${relativeRoot}/public/apple-touch-icon.png?v=5"></head>`));
    }
  }
}
