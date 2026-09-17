import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend');
const forbidden = [/\b380\+\b/i, /\b340\+\b/i, /\b142\b.*\brecintos?\b/i, /cero comisiones/i, /W3C/i, /PGP/i, /IPFS/i]; const errors = [];
for (const file of await collect(root)) { if (!/\.(html|js|json|css)$/.test(file)) continue; const text = await readFile(file, 'utf8'); forbidden.forEach((pattern) => { if (pattern.test(text)) errors.push(`${file}: ${pattern}`); }); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log('check:content OK (claims sensibles ausentes)');
async function collect(dir) { const result = []; for (const entry of await readdir(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) result.push(...await collect(file)); else result.push(file); } return result; }
