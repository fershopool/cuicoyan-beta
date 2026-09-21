import { cp, rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(web, 'frontend');
const dist = path.join(web, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(source, dist, { recursive: true, filter: (entry) => !entry.includes(`${path.sep}node_modules${path.sep}`) && !entry.endsWith(`${path.sep}dist`) });
await materializePages(path.join(source, 'src/pages'), dist);
await rm(path.join(dist, 'src/pages'), { recursive: true, force: true });
const baseUrl = process.env.VITE_BASE_URL || '/';
await writeFile(path.join(dist, 'src/config/site-base.js'), `export const siteBase = ${JSON.stringify(baseUrl)};\n`);
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
    await cp(page, path.join(outputDirectory, 'index.html'));
  }
}
