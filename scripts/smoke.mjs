// smoke.mjs — verifikasi folder repo (persis yang di-deploy ke Pages):
// file wajib ada + server lokal merespons / (200, ada judul Magernulis),
// /studio/ (200, ada judul studio), aset CSS/JS (200).
// Hanya GET lokal. Pola #29: curl -o file lalu grep file (tanpa pipefail).
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

for (const f of ['index.html', 'css/landing.css', 'studio/index.html', 'studio/css/style.css', 'studio/js/index.js', 'studio/assets/logo.svg']) {
  if (!existsSync(join(ROOT, f))) failures.push(`${f} hilang`);
}
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const PORT = 8392;
const srv = spawn(process.execPath, ['scripts/serve.mjs'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const tmp = mkdtempSync(join(tmpdir(), 'magernulis-smoke-'));

async function check(path, needle, label) {
  const out = join(tmp, label.replace(/\W+/g, '_') + '.html');
  execFileSync('curl', ['-sS', '-o', out, '-w', '%{http_code}', `http://127.0.0.1:${PORT}${path}`], { stdio: 'pipe' });
  const body = readFileSync(out, 'utf-8');
  if (!body.includes(needle)) failures.push(`${path}: tidak mengandung ${label}`);
}

try {
  await wait(1500);
  await check('/', 'Magernulis', 'judul-landing');
  await check('/', 'Buka Studio', 'cta-studio');
  await check('/studio/', 'Studio Catatan Tangan Cornell', 'judul-studio');
  await check('/studio/', 'downloadAllPNGZip', 'tombol-zip');
  await check('/css/landing.css', '--pulpen', 'token-palet');
  await check('/studio/css/style.css', '--pulpen', 'token-studio');
  await check('/studio/js/index.js', 'downloadAllPNGZip', 'fungsi-zip');
  await check('/studio/js/index.js', 'printDocument', 'fungsi-print');
} finally {
  srv.kill();
}

if (failures.length > 0) {
  console.error('smoke GAGAL:');
  for (const m of failures) console.error(` - ${m}`);
  process.exit(1);
}
console.log('smoke OK');
