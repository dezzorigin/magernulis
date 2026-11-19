// Screenshot dokumentasi: landing + studio, desktop + mobile, ke
// docs/screenshots/*.png — dipakai README + video demo.
// Prasyarat: puppeteer-core, Chromium di cache
// (~/.cache/ms-playwright/chromium-1234), dan server di PORT (default 8331).
// JANGAN `npx playwright install chromium` di VM ini (menghapus cache
// browser tooling video-demo).
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import net from 'node:net';

// Forwarder egress (127.0.0.1:18081) WAJIB untuk media eksternal dari
// headless Chrome di VM ini (Google Fonts): koneksi langsung browser ->
// egress proxy ditolak 403, dan tanpa proxy font display tidak termuat.
// Probe TCP dulu; kalau forwarder mati, lanjut tanpa proxy (font fallback).
const FORWARDER = 'http://127.0.0.1:18081';
const forwarderAlive = await new Promise((resolve) => {
  const s = net.connect(18081, '127.0.0.1');
  s.once('connect', () => { s.destroy(); resolve(true); });
  s.once('error', () => resolve(false));
  setTimeout(() => { s.destroy(); resolve(false); }, 2000);
});
if (!forwarderAlive) console.warn('PERINGATAN: forwarder 127.0.0.1:18081 mati — font Google mungkin fallback.');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'screenshots');
const PORT = process.env.PORT || '8331';
const BASE = `http://127.0.0.1:${PORT}`;

const require = createRequire(import.meta.url);
let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch {
  try {
    puppeteer = require('/home/hatch/workspace/absensirapat-audit/diag/node_modules/puppeteer-core');
  } catch {
    console.error('puppeteer-core tidak ditemukan. Pasang dulu: npm i -D puppeteer-core.');
    process.exit(1);
  }
}

mkdirSync(OUT, { recursive: true });

const exe =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  join(process.env.HOME, '.cache/ms-playwright/chromium-1234/chrome-linux/chrome');
const browser = await puppeteer.launch({
  executablePath: exe,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage',
    ...(forwarderAlive ? [`--proxy-server=${FORWARDER}`] : [])],
});

async function shot(name, path, width, height, actions = async () => {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));
  await actions(page);
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: join(OUT, name), fullPage: false });
  console.log('shot:', name);
  await page.close();
}

await shot('landing-desktop.png', '/', 1440, 900);
await shot('landing-mobile.png', '/', 390, 844);
await shot('studio-desktop.png', '/studio/', 1440, 900);
await shot('studio-mobile.png', '/studio/', 390, 844);
// Studio dengan panel Gaya Kertas terbuka (memperlihatkan kertas + tinta)
await shot('studio-style-desktop.png', '/studio/', 1440, 900, async (page) => {
  await page.evaluate(() => switchRailTab('style'));
});

await browser.close();
console.log('screenshots OK ->', OUT);
