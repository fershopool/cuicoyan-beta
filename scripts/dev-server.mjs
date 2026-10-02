import http from 'node:http';
import { readFile, open, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const selected = process.argv[2] || 'frontend';
const root = path.join(web, selected);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
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

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
  for (const candidateFile of files) {
    if (candidateFile !== root && !candidateFile.startsWith(`${root}${path.sep}`)) continue;
    try {
      if (range) {
        // PMTiles necesita peticiones Range (igual que el hosting estático); se lee solo el tramo pedido.
        const { size } = await stat(candidateFile);
        const start = range[1] === '' ? Math.max(size - Number(range[2]), 0) : Number(range[1]);
        const end = range[1] === '' || range[2] === '' ? size - 1 : Math.min(Number(range[2]), size - 1);
        if (start > end || start >= size) { response.writeHead(416, { 'Content-Range': `bytes */${size}` }); response.end(); return; }
        const handle = await open(candidateFile);
        const chunk = Buffer.alloc(end - start + 1);
        await handle.read(chunk, 0, chunk.length, start);
        await handle.close();
        response.writeHead(206, { 'Content-Type': mime[path.extname(candidateFile)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': chunk.length });
        response.end(chunk);
        return;
      }
      data = await readFile(candidateFile);
      file = candidateFile;
      break;
    } catch {}
  }

  if (!data) { response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); response.end('<h1>404</h1>'); return; }
  const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
  response.writeHead(200, { ...headers, 'Content-Length': data.length });
  response.end(data);
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`Cuicoyan disponible en http://localhost:${port}/ (${selected})`));
