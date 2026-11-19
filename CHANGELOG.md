# Changelog

Semua perubahan penting proyek ini dicatat di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Mode Nulis (`studio/nulis.html`, `studio/css/nulis.css`,
  `studio/js/nulis.js`): mode terpisah dari Cornell Notes, ala JNCK Nulis —
  form tanggal/nama/kelas/fakultas/teks, kertas garis CSS (Kertas 1–3 +
  HVS dot grid), 12 font (Gloria Hallelujah, Shadows Into Light,
  Coming Soon, Covered By Your Grace + 9 font Magernulis), humanizer
  default Wild, tinta/ukuran/line-height/efek scan/backdrop, halaman
  otomatis mengikuti panjang teks, ekspor PNG/ZIP/PDF + salin + cetak,
  simpan lokal otomatis. Tautan dua arah Cornell ↔ Nulis di topbar
  studio + tombol Mode Nulis di landing. Hanya 4 dari 34 font JNCK yang
  tersedia di Google Fonts (lisensi aman); 30 sisanya butuh cek sumber
  & lisensi. Kertas Buku 1–8 (foto buku asli) belum tersedia.
- Undo/Redo di topbar studio (kedua mode, snapshot state penuh, maks 50
  langkah, commit di-debounce 600 mdtk): mengembalikan isi, gaya kertas,
  tinta, font, dan humanizer.
- Ekspor JPG per halaman dari panel Bagikan (selain PNG/ZIP/PDF).
- Edit langsung di kertas, ala Canva (kedua mode): klik teks apa pun di
  kertas — header, pertanyaan, catatan, rangkuman (Cornell) atau baris
  header dan paragraf isi (Nulis) — lalu ketik di tempat; Enter / klik di
  luar / Ctrl+Enter menyimpan, Esc membatalkan. Nilai tersinkron ke panel
  kiri, state, dan undo. Di Nulis, batas paragraf (`\n` tunggal) dijaga
  supaya tidak hilang saat teks disusun ulang dari baris.

### Fixed
- Ekspor PNG/ZIP/PDF dan salin gambar tidak lagi menumpukkan kata saat kertas
  sedang di-zoom: semua capture html2canvas kini jalan dalam keadaan zoom
  100% lalu zoom dikembalikan (`captureWithZoomReset` di `studio/js/index.js`).
- Kertas kepotong saat dibuka (laporan Nabil 20 Nov 2026): viewport tadinya
  flex kolom dengan `justify-content: center`, sehingga kertas yang lebih
  tinggi dari viewport terpotong di ATAS dan potongan itu tidak bisa
  di-scroll. Kini `justify-content: flex-start` + zoom Fit otomatis ala
  Canva saat dibuka (seluruh kertas terlihat; tombol Fit benar-benar fit,
  bukan reset 100%; zoom manual menonaktifkan auto-fit sampai Fit ditekan
  lagi; refit saat resize). Kotak layout wrapper disamakan dengan ukuran
  visual hasil scale supaya tidak ada ruang kosong di bawah kertas.
  Perkuatan: fit dihitung ulang setelah layout settle (frame pertama /
  akhir render pertama / load) dan ruang vertikal diukur dari jendela
  terlihat dikurangi tinggi topbar + bottombar — bukan dari tinggi wadah,
  yang di headless CI bisa lebih tinggi dari layar. (`100dvh` sempat
  dicoba lalu dicabut: di CI malah membuat wadah lebih tinggi.) Transisi
  `transform` di `.canvas-wrapper` DICABUT: transisi membuat skala fit
  belum sampai target saat kertas pertama terlihat (computed transform
  masih 1.0 lalu merangkak ke 0.82) sehingga kertas terukur kepotong.

### Changed
- Pilihan font tulisan tangan dipangkas dari 17 jadi 9: semua font yang rapih
  dihapus (Kalam, Architects Daughter, Patrick Hand, Amatic SC,
  Dancing Script, Satisfy, Sacramento, Marck Script). Tersisa gaya acak
  natural: Just Me Again Down Here, Caveat, Indie Flower, Shadows Into
  Light, Gochi Hand, Loved by the King, Nanum Brush Script, Over the
  Rainbow, Waiting for the Sunrise. Spesimen landing, README, dan tes e2e
  ikut diperbarui.
- UI studio diselaraskan dengan editor Canva (riset langsung canva.com,
  20 Nov 2026, rujukan `~/workspace/canva-editor-recon.md`): top bar
  gradien teal → biru → ungu dengan teks putih, tombol "Bagikan" pill putih
  di kanan atas yang membuka panel samping kanan (pilih jenis file
  PNG/JPG/PDF, preset Digital/Cetak, tombol ungu besar "Unduh", aksi ZIP /
  Cetak / Salin / PNG halaman ini) menggantikan dropdown ekspor, badge
  autosave "Semua perubahan disimpan", dan pill "+ Tambah halaman" di bawah
  kertas (mode Cornell). Library Template / Elemen / Unggahan Canva tidak
  ditiru (di luar cakupan alat catatan). Sejak perbaikan 20 Nov 2026, edit
  teks langsung di kanvas SUDAH ada (klik teks di kertas untuk mengedit).
- Gate anti-slop P0 (`scripts/check-static.mjs`) diberi pengecualian
  disengaja yang sempit untuk penyelarasan Canva di atas (hanya gradien
  top bar + kelas/tombol ungu "Unduh"); gradient ungu/biru lain dan sisa
  tema Canva di mana pun tetap pelanggaran.

## [1.1.0] — 2026-11-19

Rebuild proper (program P1 repo #36): restructure keempat.

### Added
- Landing page (`index.html`): navbar + tautan GitHub, hero editorial
  dengan kartu kertas Cornell contoh, strip catatan pembuat bertanda tangan,
  4 baris fitur bergantian, spesimen 17 font tulisan tangan, cara pakai
  3 langkah, FAQ, footer satu baris.
- Studio dipindah ke `studio/` dan bisa jalan dari root repo.
- CI GitHub Actions (Node 24): static-checks, advisory-sweep OSV,
  Playwright e2e (desktop + mobile), smoke.
- E2E Playwright (`e2e/app.spec.js`): 12 tes landing + studio.
- Skrip: `serve.mjs`, `check-links.mjs`, `check-static.mjs`
  (gate anti-slop P0 + secret-scan), `advisory-sweep.py` (OSV batch),
  `screenshot.mjs`, `smoke.mjs`, `make-video.mjs`.
- Dokumen: `docs/DESIGN.md` (kontrak desain, referensi Ebb Framer),
  `docs/ARCHITECTURE.md`, `docs/USER-GUIDE.md`, `docs/deploy.md`,
  `docs/diagrams.html`, `docs/README.md`; screenshot desktop + mobile;
  video demo `docs/demo/demo.mp4`.
- Logo datar baru `studio/assets/logo.svg` (pulpen biru, garis margin
  merah, ujung stabilo) menggantikan PNG gradient cyan→ungu.
- Fungsi `downloadAllPNGZip` (ZIP beneran via JSZip) dan `printDocument`
  (window.print + print stylesheet).
- Aksesibilitas studio: `focus-visible`, `prefers-reduced-motion`,
  media query mobile 720px (drawer jadi overlay).

### Changed
- Rebrand WriteOnAir → Magernulis di seluruh UI, toast, nama berkas
  ekspor, dan field JSON draft. Key localStorage tema lama
  (`writeonair_theme`) tetap dibaca sebagai fallback migrasi.
- Tema studio: ungu Canva (`#7D2AE8` + gradient cyan→ungu) diganti
  Pulpen Biru solid (`#1D4ED8`); font UI Plus Jakarta Sans diganti
  IBM Plex Sans (landing: Newsreader + IBM Plex Sans).
- Ikon preset (💻📐📜📖) dan ikon daftar halaman (📄) diganti SVG.
- `CornellNote.pdf` dipindah ke `docs/referensi/` sebagai template acuan.
- README, PRD, dan CHANGELOG ditulis ulang sesuai isi repo sebenarnya.

### Removed
- File mati yang tidak pernah dimuat: `js/domImg.js` (vendored
  dom-to-image, 768 baris), `css/fontStyle.css` (kosong),
  `font/My_handwriting.ttf` (tidak direferensikan), `.vscode/`.

### Fixed
- Tombol "Unduh Paket ZIP (Semua Halaman)" mati: memanggil
  `downloadAllPNGZip` yang tidak ada (fungsinya bernama `downloadAllPNG`
  dan mengunduh satu-satu, bukan ZIP). Sekarang ZIP beneran via JSZip.
- Tombol "Cetak Dokumen (Direct Print)" mati: memanggil `printDocument`
  yang tidak ada. Sekarang memanggil `window.print()`.

## [1.0.0] — 2026 (sebelum rebuild)

Aplikasi awal "WriteOnAir": studio catatan Cornell di subfolder
`magernulis/` (HTML/CSS/JS), belum bisa jalan dari root, tanpa CI,
tanpa landing, tanpa deploy.

> Catatan: CHANGELOG lama mengklaim proyek Next.js dengan syntax
> highlighting dan file management — klaim itu tidak sesuai isi repo
> (aplikasi sebenarnya HTML/CSS/JS murni) dan sudah dihapus di v1.1.0.
