import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const selected = process.argv[2] || 'frontend';
const root = path.join(web, selected);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = http.createServer(async (request, response) => {
  const clean = decodeURIComponent((request.url || '/').split('?')[0]);
  const candidate = clean.endsWith('/') ? `${clean}index.html` : clean;
  const directFile = path.resolve(root, `.${candidate}`);
  const segments = clean.split('/').filter(Boolean);
  const pageDirectory = segments.join('/') || 'inicio';
  const pageName = segments.at(-1) || 'inicio';
  const pageFile = path.resolve(root, 'src', 'pages', pageDirectory, `${pageName}.html`);
  const files = [directFile, pageFile].filter((file, index, list) => list.indexOf(file) === index);
  let file;
  let data;

  for (const candidateFile of files) {
    if (candidateFile !== root && !candidateFile.startsWith(`${root}${path.sep}`)) continue;
    try {
      data = await readFile(candidateFile);
      file = candidateFile;
      break;
    } catch {}
  }

  if (!data) { response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); response.end('<h1>404</h1>'); return; }
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  response.end(data);
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`Cuicoyan disponible en http://localhost:${port}/ (${selected})`));
