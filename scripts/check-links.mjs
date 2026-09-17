import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend');
const files = await collect(root); const errors = [];
for (const file of files.filter((f) => f.endsWith('.html') || f.endsWith('.js'))) { const text = await readFile(file, 'utf8'); if (text.includes('href="#"')) errors.push(`${file}: href="#"`); if (text.includes('googleusercontent.com')) errors.push(`${file}: imagen remota`); if (/<(?:button|a)[^>]+onclick\s*=/.test(text)) errors.push(`${file}: handler inline`); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log(`check:links OK (${files.length} archivos revisados)`);
async function collect(dir) { const result = []; for (const entry of await readdir(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) result.push(...await collect(file)); else result.push(file); } return result; }
