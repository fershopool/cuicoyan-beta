// Proxy local de un solo origen para el e2e (imita Cloudflare delante de la API, /auth y la web estática).
//   /auth/*  -> auth-server     /api/*  -> API Next.js     resto -> servidor estático de la web
// Como Cloudflare: descarta CF-Connecting-IP del cliente y pone la IP del socket. /admin/* NO se expone (es interno).
import http from 'node:http';

const { PORT, AUTH_URL, API_URL, WEB_URL } = process.env;
if (!PORT || !AUTH_URL || !API_URL || !WEB_URL) throw new Error('PORT, AUTH_URL, API_URL y WEB_URL son obligatorios');

function target(path) {
  if (path.startsWith('/auth/') || path === '/healthz') return AUTH_URL;
  if (path.startsWith('/api/')) return API_URL;
  return path.startsWith('/admin/') ? null : WEB_URL;
}

http.createServer((req, res) => {
  const base = target(req.url.split('?')[0]);
  if (!base) { res.writeHead(404).end(); return; }
  const { hostname, port } = new URL(base);
  const headers = { ...req.headers, 'cf-connecting-ip': req.socket.remoteAddress.replace(/^::ffff:/, '') };
  const up = http.request({ hostname, port, path: req.url, method: req.method, headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  up.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
  req.pipe(up);
}).listen(Number(PORT), '127.0.0.1', () => console.log(`proxy de un solo origen en http://localhost:${PORT}`));
