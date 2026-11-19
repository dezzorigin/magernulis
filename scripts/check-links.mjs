// check-links.mjs — pemeriksaan statis (tanpa browser):
//   1. Tautan file lokal di README.md + PRD.md + CHANGELOG.md + docs/*.md
//      benar-benar ada di disk.
//   2. Tautan lokal di index.html + studio/index.html (href/src) ada.
//   3. File wajib ada.
// Keluar 1 bila ada satu saja temuan.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (msg) => failures.push(msg);

const mdFiles = ['README.md', 'PRD.md', 'CHANGELOG.md'];
if (existsSync(join(ROOT, 'docs'))) {
  for (const f of readdirSync(join(ROOT, 'docs'))) {
    if (f.endsWith('.md')) mdFiles.push(`docs/${f}`);
  }
}
for (const rel of mdFiles) {
  if (!existsSync(join(ROOT, rel))) continue;
  const content = readFileSync(join(ROOT, rel), 'utf-8');
  for (const m of content.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith('/')
      ? join(ROOT, clean.slice(1))
      : join(ROOT, dirname(rel), clean);
    if (!existsSync(target)) fail(`${rel}: tautan lokal hilang: ${ref}`);
  }
}

// Tautan lokal di index.html + studio/index.html
for (const htmlRel of ['index.html', 'studio/index.html']) {
  const html = readFileSync(join(ROOT, htmlRel), 'utf-8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    if (!clean) continue;
    const base = dirname(htmlRel) === '.' ? ROOT : join(ROOT, dirname(htmlRel));
    if (!existsSync(join(base, clean.replace(/^\//, '')))) {
      fail(`${htmlRel}: aset lokal hilang: ${ref}`);
    }
  }
}

for (const f of [
  'LICENSE', 'README.md', 'PRD.md', 'CHANGELOG.md',
  'index.html', 'css/landing.css',
  'studio/index.html', 'studio/css/style.css', 'studio/js/index.js',
  'studio/assets/logo.svg',
  'docs/DESIGN.md', 'docs/ARCHITECTURE.md', 'docs/USER-GUIDE.md',
  'docs/deploy.md', 'docs/diagrams.html',
  'docs/referensi/CornellNote.pdf',
  'package.json', 'playwright.config.js',
  'e2e/app.spec.js',
]) {
  if (!existsSync(join(ROOT, f))) fail(`file wajib hilang: ${f}`);
}

if (failures.length > 0) {
  console.error('check-links GAGAL:');
  for (const m of failures) console.error(` - ${m}`);
  process.exit(1);
}
console.log('check-links OK');
