// E2E: landing + studio Magernulis terhadap server lokal (scripts/serve.mjs).
// Tidak menyentuh jaringan luar kecuali CDN font/pustaka (sudah dimuat
// halaman); ekspor PNG/PDF/ZIP hanya diuji sampai toast "memproses"
// muncul tanpa pageerror — unduhan berkas tidak diassert di sini.
import { test, expect } from '@playwright/test';

test.describe('landing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(/Ketik sekali, jadi tulisan tangan/);
  });

  test('navbar, hero, dan tautan GitHub hidup', async ({ page }) => {
    await expect(page).toHaveTitle(/Magernulis/);
    await expect(page.locator('.brand-name')).toHaveText('Magernulis');
    const gh = page.locator('.github-link');
    await expect(gh).toHaveAttribute('href', 'https://github.com/dezzorigin/magernulis');
    await expect(page.locator('.hero-cta .btn-primary')).toHaveAttribute('href', './studio/');
    await expect(page.locator('#fitur')).toBeVisible();
    await expect(page.locator('#font')).toBeVisible();
    await expect(page.locator('#cara-pakai')).toBeVisible();
    await expect(page.locator('#faq')).toBeVisible();
    await expect(page.locator('footer')).toContainText('MIT');
  });

  test('spesimen menampilkan 9 font tulisan tangan', async ({ page }) => {
    await expect(page.locator('.specimen-row')).toHaveCount(9);
  });

  test('CTA hero menuju studio', async ({ page }) => {
    await page.locator('.hero-cta .btn-primary').click();
    await expect(page).toHaveURL(/\/studio\//);
    await expect(page.locator('#cn')).toBeVisible();
  });
});

test.describe('studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio/');
    await expect(page.locator('#cn')).toBeVisible();
    // Di mobile drawer default tertutup (lihat index.js) — buka dulu agar
    // kontrol panel bisa diklik.
    await page.locator('.rail-btn[data-rail="content"]').click();
  });

  test('catatan contoh ter-render di kertas', async ({ page }) => {
    await expect(page.locator('#topic')).toContainText('Algoritma');
    await expect(page.locator('#note')).toContainText('Algoritma adalah');
    await expect(page.locator('#current-page-num')).toHaveText('1');
  });

  test('mengetik di panel mengubah kertas secara langsung', async ({ page }) => {
    await page.locator('#note-input').fill('Catatan uji end-to-end.');
    await expect(page.locator('#note')).toContainText('Catatan uji end-to-end');
  });

  test('preset Matematika mengisi kertas', async ({ page }) => {
    await page.locator('.preset-card', { hasText: 'Matematika' }).click();
    await expect(page.locator('#topic')).toContainText('Kalkulus');
    await expect(page.locator('#toast')).toContainText('berhasil diterapkan');
  });

  test('ganti kertas dan tinta mengubah kelas kanvas', async ({ page }) => {
    await page.locator('.rail-btn[data-rail="style"]').click();
    await page.locator('.paper-opt[data-paper="grid"]').click();
    await expect(page.locator('#cn')).toHaveClass(/paper-grid/);
    await page.locator('.ink-opt[data-ink="blue"]').click();
    await expect(page.locator('#cn')).toHaveClass(/ink-blue/);
  });

  test('tambah halaman lalu hapus kembali', async ({ page }) => {
    await page.locator('.rail-btn[data-rail="pages"]').click();
    await page.locator('button', { hasText: 'Tambah Kertas Baru' }).click();
    await expect(page.locator('#total-page-num')).toHaveText('2');
    await expect(page.locator('#page-count-badge')).toHaveText('2');
    await page.locator('#btn-delete-page').click();
    await page.locator('#modal-confirm-btn').click();
    await expect(page.locator('#total-page-num')).toHaveText('1');
  });

  test('gacha humanizer menampilkan toast tanpa error', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.locator('.rail-btn[data-rail="humanizer"]').click();
    await page.locator('button', { hasText: 'Gacha Acak Tulisan Humanis' }).click();
    await expect(page.locator('#toast')).toContainText('Gacha Berhasil');
    expect(errors).toEqual([]);
  });

  test('panel Bagikan terbuka; pilih PDF lalu Unduh memproses', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.locator('.btn-canva-share', { hasText: 'Bagikan' }).click();
    await expect(page.locator('#share-panel')).toBeVisible();
    await expect(page.locator('#share-file-type')).toHaveValue('pdf');
    await expect(page.locator('#share-download-label')).toHaveText('Unduh PDF (Semua Halaman)');
    await page.locator('.btn-canva-purple').click();
    await expect(page.locator('#toast')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('undo/redo mengembalikan isi catatan', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await expect(page.locator('#btn-undo')).toBeDisabled();
    await page.locator('#note-input').fill('Catatan uji undo end-to-end.');
    await page.waitForTimeout(900); // commit snapshot (debounce 600 mdtk)
    await expect(page.locator('#btn-undo')).toBeEnabled();
    await page.locator('#btn-undo').click();
    await expect(page.locator('#note-input')).not.toHaveValue('Catatan uji undo end-to-end.');
    await expect(page.locator('#btn-redo')).toBeEnabled();
    await page.locator('#btn-redo').click();
    await expect(page.locator('#note-input')).toHaveValue('Catatan uji undo end-to-end.');
    expect(errors).toEqual([]);
  });

  test('ganti tema gelap/terang', async ({ page }) => {
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
  });

  test('zoom slider mengubah skala kanvas', async ({ page }) => {
    await page.locator('#zoom-range').fill('50');
    await expect(page.locator('#zoom-value')).toHaveText('50%');
  });
});

test.describe('mode nulis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio/nulis.html');
    await expect(page.locator('.nulis-paper.active')).toBeVisible();
    await page.locator('.rail-btn[data-rail="content"]').click();
  });

  test('form JNCK dan 12 font + 4 kertas tersedia', async ({ page }) => {
    await expect(page.locator('#nulis-date-input')).toBeVisible();
    await expect(page.locator('#nulis-name-input')).toBeVisible();
    await expect(page.locator('#nulis-class-input')).toBeVisible();
    await expect(page.locator('#nulis-faculty-input')).toBeVisible();
    await expect(page.locator('#nulis-text-input')).toBeVisible();
    await expect(page.locator('#font-select option')).toHaveCount(12);
    await expect(page.locator('.paper-opt')).toHaveCount(4);
    await expect(page.locator('.nulis-paper.active')).toHaveClass(/paper-kertas1/);
  });

  test('contoh ter-render; teks panjang jadi 2 halaman', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.locator('.topbar-action-btn', { hasText: 'Contoh' }).click();
    await expect(page.locator('.nulis-paper.active .nulis-line').first()).toContainText('November 2026');
    // Teks contoh (~380 kata) jadi 2 halaman dengan font Gloria; tapi
    // lebar font fallback (kalau Google Fonts tak terjangkau) berbeda,
    // jadi assert halaman-ganda memakai teks yang sengaja panjang:
    // ~600 kata pasti >26 baris di font tersempit sekalipun.
    const longText = ('Gotong royong membuat pekerjaan berat terasa ringan. ').repeat(60);
    await page.locator('#nulis-text-input').fill(longText);
    await expect(page.locator('#page-count-badge')).toHaveText('2');
    await expect(page.locator('#preview-page-pills .page-pill')).toHaveCount(2);
    expect(errors).toEqual([]);
  });

  test('ganti kertas HVS dan font Caveat mengubah kelas kanvas', async ({ page }) => {
    await page.locator('.rail-btn[data-rail="style"]').click();
    await page.locator('.paper-opt[data-paper="hvs"]').click();
    await expect(page.locator('.nulis-paper.active')).toHaveClass(/paper-hvs/);
    await page.locator('.rail-btn[data-rail="typography"]').click();
    await page.locator('#font-select').selectOption({ label: 'Caveat' });
    await expect(page.locator('.nulis-paper.active .nulis-line').first()).toHaveCSS('font-family', /Caveat/);
  });

  test('tautan Mode Cornell dan sebaliknya hidup', async ({ page }) => {
    await page.locator('.topbar-action-btn[href="./index.html"]').click();
    await expect(page).toHaveURL(/\/studio\/(index\.html)?$/);
    await expect(page.locator('#cn')).toBeVisible();
    await page.locator('.topbar-action-btn[href="./nulis.html"]').click();
    await expect(page).toHaveURL(/nulis\.html/);
    await expect(page.locator('.nulis-paper.active')).toBeVisible();
  });

  test('panel Bagikan terbuka di mode nulis', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.locator('.btn-canva-share', { hasText: 'Bagikan' }).click();
    await expect(page.locator('#share-panel')).toBeVisible();
    await page.locator('#share-file-type').selectOption('png');
    await expect(page.locator('#share-download-label')).toHaveText('Unduh PNG (Halaman Ini)');
    await page.locator('.btn-canva-purple').click();
    await expect(page.locator('#toast')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
