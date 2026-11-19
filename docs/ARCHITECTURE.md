# ARCHITECTURE.md — Magernulis

## Ringkasan

Situs statis murni: tanpa framework, tanpa build step, tanpa backend,
tanpa dependensi produksi. Dua permukaan — landing (`/`) dan studio
(`/studio/`) — disajikan apa adanya oleh server statis apa pun, termasuk
Cloudflare Pages.

```
pengguna
  │  GET /              landing (HTML + css/landing.css)
  │  GET /studio/       studio  (HTML + css + js)
  ▼
server statis / Cloudflare Pages
  │  font: Google Fonts (17 font tangan + Newsreader + IBM Plex Sans)
  │  ekspor: cdnjs html2canvas + jsPDF + JSZip
  ▼
browser — semua state di memori + localStorage (tema saja)
```

## Peta file

| Jalur | Isi |
|---|---|
| `index.html` | Landing page (statis, tanpa JS) |
| `css/landing.css` | Gaya landing (token palet Kertas/Tinta/Pulpen) |
| `studio/index.html` | Kerangka studio: topbar, rail, drawer (5 panel), kanvas kertas `#cn`, bottombar, toast, modal |
| `studio/css/style.css` | Gaya studio: token tema gelap/terang, kertas, tinta, efek scan, print, mobile |
| `studio/js/index.js` | Satu-satunya engine: state, render humanizer, halaman, ekspor |
| `studio/assets/logo.svg` | Logo datar (pulpen biru + garis margin merah) |
| `docs/referensi/CornellNote.pdf` | Template kertas Cornell acuan (2 halaman) |

## Alur data studio

```
ketik di textarea ──► bindInputSync ──► renderHumanizedText
                                              │  (per kata: rotasi +
                                              │   offset pseudo-acak
                                              │   dari humanizerSeed)
                                              ▼
                                     span.hw-word di #cn
                                              │
state: pagesData[] ──► loadPageDataIntoForm ──► form + kanvas
(activePageIndex)        (pindah/tambah/hapus halaman)
                                              │
ekspor ──► html2canvas(#cn, scale 2) ──► PNG / ZIP (JSZip) /
                                           PDF (jsPDF A4) / clipboard
```

State hidup di memori (`pagesData`, `activePageIndex`, `humanizerSeed`,
`currentFontFamily`, `currentPaperType`, `currentInkColor`,
`currentScanEffect`, `currentDeskBackdrop`, `documentTitle`). Yang
persisten hanya tema (`localStorage: magernulis_theme`, dengan fallback
baca `writeonair_theme` lama). Draft disimpan/ dibuka sebagai `.json`
oleh pengguna sendiri — tidak ada autosave ke server karena tidak ada
server.

## Humanizer

`renderHumanizedText(el, text)`: teks dipecah per baris lalu per kata.
Tiap kata dibungkus `<span class="hw-word">` dengan
`transform: rotate(R deg) translateY(Y px)`, R/Y dari `pseudoRandom`
(`sin(seed)`) — deterministik per seed, jadi hasil stabil sampai tombol
gacha mengacak `humanizerSeed`. Level 0 (Rapi) menonaktifkan efek dan
memakai `textContent` biasa. Semua kata di-escape (`escapeHTML`) sebelum
masuk `innerHTML` — teks pengguna tidak pernah jadi HTML mentah.

## Ekspor

| Ekspor | Jalur |
|---|---|
| PNG halaman ini | `downloadPNG`: `html2canvas(#cn, scale 2)` → `toDataURL` → unduh |
| ZIP semua halaman | `downloadAllPNGZip`: tiap halaman dirender → blob → `JSZip` → satu `.zip` |
| PDF HD | `exportPDF(all)`: tiap halaman dirender → `jsPDF.addImage` A4 |
| Cetak | `printDocument`: `window.print()`; `@media print` menyembunyikan seluruh UI, hanya `#cn` |
| Clipboard | `copyImageToClipboard`: canvas → blob → `ClipboardItem` |
| Draft | `exportProjectJSON` / `importProjectJSON`: JSON berisi semua state + `pagesData` |

Semua ekspor menunggu `document.fonts.ready` dulu agar font tangan
sudah termuat sebelum render.

## Dependensi runtime (CDN, bukan npm)

| Pustaka | Versi | Dipakai untuk |
|---|---|---|
| html2canvas | 1.4.1 | Render `#cn` jadi canvas |
| jsPDF | 2.5.1 | PDF A4 |
| JSZip | 3.10.1 | ZIP multi-halaman |
| Google Fonts | — | 17 font tangan + Newsreader + IBM Plex Sans |

Tidak ada dependensi npm produksi — `package.json` hanya punya
devDependencies (Playwright + puppeteer-core). Karena itu
`advisory-sweep.py` selalu melaporkan 0 paket produksi; sweep tetap
dijalankan di CI sebagai jaring pengaman bila dependensi produksi
ditambahkan kelak.

## CI & deploy

- CI (`.github/workflows/ci.yml`, Node 24): `static-checks`
  (`check-links` + `check-static`), `advisory-sweep` (OSV batch, tanpa
  auth), `playwright-e2e` (desktop 1440×900 + mobile Pixel 7),
  `smoke` (server lokal + curl ke `/`, `/studio/`, aset).
- Deploy: Cloudflare Pages direct upload (`cf_pages.py`), proyek
  `magernulis` → https://magernulis.pages.dev. Lihat
  [deploy.md](deploy.md).

## Keputusan yang sengaja tidak diambil

- **Tanpa framework/build:** aplikasi kecil dan sudah jalan; build
  menambah rantai gagal tanpa manfaat.
- **Tanpa backend:** tidak ada data yang perlu disimpan di server.
- **Tanpa mode offline penuh:** font + pustaka CDN; membundel lokal
  adalah ide roadmap, bukan kebutuhan v1.1.0.
- **dom-to-image tidak dipakai:** `js/domImg.js` vendored tidak pernah
  dimuat — dihapus di v1.1.0.
