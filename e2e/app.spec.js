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

  test('spesimen menampilkan 17 font tulisan tangan', async ({ page }) => {
    await expect(page.locator('.specimen-row')).toHaveCount(17);
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

  test('menu ekspor terbuka; tombol ZIP dan Cetak terdefinisi', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.locator('.dropdown-toggle').click();
    await expect(page.locator('#export-menu')).toBeVisible();
    // Klik ZIP: memproses (html2canvas/CDN) lalu toast; yang diassert
    // tidak ada ReferenceError + toast muncul.
    await page.locator('.dropdown-item', { hasText: 'Unduh Paket ZIP' }).click();
    await expect(page.locator('#toast')).toBeVisible();
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
