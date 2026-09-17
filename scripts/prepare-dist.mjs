import { cp, rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(web, 'frontend');
const dist = path.join(web, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(source, dist, { recursive: true, filter: (entry) => !entry.includes(`${path.sep}node_modules${path.sep}`) && !entry.endsWith(`${path.sep}dist`) });
const baseUrl = process.env.VITE_BASE_URL || '/';
await writeFile(path.join(dist, 'src/config/site-base.js'), `export const siteBase = ${JSON.stringify(baseUrl)};\n`);
// Evita publicar el manifiesto de desarrollo de npm en el hosting estático.
await rm(path.join(dist, 'package.json'), { force: true });
await rm(path.join(dist, 'vite.config.js'), { force: true });
console.log(`Cuicoyan: salida estática lista en ${dist}`);
console.log(`Rutas HTML: ${(await findHtml(dist)).length}`);

async function findHtml(dir) { const entries = await readdir(dir, { withFileTypes: true }); const result = []; for (const entry of entries) { const file = path.join(dir, entry.name); if (entry.isDirectory()) result.push(...await findHtml(file)); else if (entry.name.endsWith('.html')) result.push(file); } return result; }
