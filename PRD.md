# PRD — Magernulis

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | Magernulis |
| Nama sebelumnya | WriteOnAir (nama internal studio, diganti di v1.1.0) |
| Tech Stack | HTML/CSS/JavaScript murni (tanpa framework, tanpa build) |
| Dependensi produksi | Nol — font via Google Fonts, pustaka ekspor via CDN |
| Status | Live di Cloudflare Pages |
| Penanggung Jawab | Nabil Aulia Dika (dezzorigin) |
| Versi Dokumen | 2.0 (19 Nov 2026) |
| Live | https://magernulis.pages.dev |

## 2. Latar Belakang

Mahasiswa sering harus menyerahkan catatan kuliah bertulisan tangan,
sementara mengetik jauh lebih cepat daripada menulis. Magernulis
menjembatani keduanya: pengguna mengetik, aplikasi merender ketikan itu
sebagai catatan Cornell bertulisan tangan yang terlihat dikerjakan
sungguhan — termasuk ketidaksempurnaan alami tulisan manusia.

Template acuan: `docs/referensi/CornellNote.pdf` — contoh kertas Cornell
2 halaman yang menjadi patokan tata letak (header identitas, kolom
pertanyaan 35% / catatan 65%, rangkuman di bawah).

## 3. Masalah yang Diselesaikan

- Menulis ulang catatan kuliah dengan tangan memakan waktu dan melelahkan.
- Catatan hasil ketikan biasa terlihat seperti dokumen komputer — tidak
  cocok untuk tugas yang meminta tulisan tangan.
- Aplikasi catatan generik tidak mengenal format Cornell (pertanyaan,
  catatan, rangkuman) yang dipakai di perkuliahan.

## 4. Tujuan & Sasaran

- Mengetik satu catatan Cornell lengkap dalam < 5 menit, dari halaman
  kosong sampai siap ekspor.
- Hasil ekspor (PNG/PDF) terlihat seperti hasil scan catatan tangan asli.
- Nol akun, nol server, nol unggahan — semua diproses di browser.

## 5. Pengguna

Mahasiswa (utama) yang mengumpulkan catatan kuliah bertulisan tangan;
juga siapa saja yang butuh catatan Cornell rapi tanpa menulis manual.

## 6. Fitur & Persyaratan Fungsional

### 6.1 Landing page (`/`)

- Navbar: logo + nama, tautan Fitur / Font / Cara pakai / FAQ, tautan
  GitHub, CTA Buka Studio.
- Hero editorial: teks kiri + kartu kertas Cornell contoh (miring 2°,
  garis margin merah, lubang binder, label "contoh").
- Strip catatan pembuat bertanda tangan (pengganti deretan statistik).
- Fitur sebagai 4 baris bergantian; spesimen 17 font; cara pakai 3
  langkah; FAQ; footer satu baris.

### 6.2 Studio (`/studio/`)

| Area | Persyaratan |
|---|---|
| Isi | Header identitas (topik, nama, NIM, tanggal + tombol Hari Ini + toggle tampilkan header); pertanyaan, catatan, rangkuman; 4 template preset (Algoritma, Matematika, Sejarah, Resume Buku); tombol Contoh dan Reset (konfirmasi modal). |
| Gaya kertas | 4 kertas (Folio Bergaris, Grid Binder, Vintage Cream, HVS Putih); 4 tinta (Biru, Hitam, Navy, Merah); 3 backdrop meja (Dot Grid, Meja Kayu, Minimalis); 5 efek scan (tanpa filter, Clean, Shadow, Warm, Photocopy). |
| Humanizer | 4 tingkat (0 Rapi, 1 Halus, 2 Natural, 3 Acak); tombol gacha mengacak seed; tiap kata di-render sebagai span dengan rotasi + offset pseudo-acak berbasis seed. |
| Tipografi | 17 font tulisan tangan; ukuran font 0.9–1.8rem; line-height 1.1–2.0. |
| Halaman | Tambah/hapus lembar (min. 1, hapus pakai konfirmasi); halaman lanjutan default tanpa header; judul per halaman; pill navigasi + daftar halaman. |
| Kanvas | Zoom 30–150% (tombol, slider, reset Fit), fullscreen, tema gelap/terang (tersimpan di localStorage), badge "Tersimpan di Lokal". |
| Ekspor | PNG halaman ini; ZIP semua halaman (JSZip); PDF HD satu/semua halaman (jsPDF A4); cetak (print stylesheet, hanya kertas); salin gambar ke clipboard; simpan/buka draft .json. |

### 6.3 Persyaratan perilaku

- Semua tombol dan tautan harus berfungsi — tombol mati = cacat, PR
  tidak boleh merge. (Riwayat: tombol ZIP dan Cetak pernah mati karena
  fungsinya tidak ada; diperbaiki di v1.1.0.)
- Semua input tersinkron real-time ke kanvas; state halaman tersimpan
  saat pindah halaman.
- Data contoh selalu dilabeli "contoh".
- Escaping HTML di semua teks pengguna yang di-render ke kanvas (XSS).

## 7. Persyaratan Non-Fungsional

- **Performa:** halaman interaktif < 2 dtk di koneksi biasa; ekspor PNG
  satu halaman < 5 dtk.
- **Privasi/keamanan:** tanpa backend; tanpa cookie pelacak; rahasia
  (`.env`) tidak boleh ter-commit; tanpa secret di repo (cek: tidak ada).
- **Aksesibilitas:** `focus-visible`, label pada tombol ikon, tag semantik,
  `prefers-reduced-motion` dihormati, kontras AA, target sentuh ≥ 44px
  di mobile.
- **Responsif:** landing rapi di 390px tanpa scroll horizontal; studio
  bisa dipakai di 390px (drawer jadi overlay).
- **Portabilitas:** jalan di Linux/macOS/Windows, browser modern,
  dari server statis apa pun.

## 8. Arsitektur & Tech Stack

Situs statis murni, tanpa build. Lihat
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) dan
[docs/diagrams.html](docs/diagrams.html).

| Lapisan | Teknologi |
|---|---|
| Landing | HTML + CSS (`css/landing.css`), font Newsreader + IBM Plex Sans |
| Studio | HTML + CSS + JS vanilla (`studio/`) |
| Font tangan | Google Fonts (17 keluarga) |
| Ekspor | html2canvas 1.4.1 + jsPDF 2.5.1 + JSZip 3.10.1 (CDN) |
| State | Variabel JS + localStorage (tema saja) |
| CI | GitHub Actions, Node 24 (build, static-checks, advisory-sweep OSV, Playwright e2e, smoke) |
| Deploy | Cloudflare Pages (direct upload), nama `magernulis` |

## 9. Milestone / Roadmap

| Fase | Status |
|---|---|
| Aplikasi awal (WriteOnAir, di subfolder) | ✅ |
| Restructure ke root + rebrand Magernulis | ✅ (v1.1.0) |
| Landing page + desain anti-slop | ✅ (v1.1.0) |
| Perbaikan tombol mati (ZIP, Cetak) | ✅ (v1.1.0) |
| CI + e2e + deploy Pages | ✅ (v1.1.0) |
| Mode offline penuh (font + pustaka lokal) | ⏳ (ide — butuh bundling, belum diputus) |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Font/CDN tidak termuat (offline) | Fallback font cursive sistem; toast jelas saat modul ekspor belum termuat |
| Ekspor html2canvas gagal di halaman besar | Skala render 2x, tangkap error dan tampilkan toast gagal (bukan diam) |
| Hasil terlihat "terlalu komputer" | Humanizer default Natural (level 2) + gacha |
| Kredensial/API key ter-commit | Secret-scan di CI (`check-static.mjs`); repo tidak memakai key apa pun |

## 11. Kriteria Keberhasilan

- Landing + studio ter-render tanpa error di desktop dan mobile 390px.
- Semua 34 handler tombol di studio terdefinisi dan teruji e2e.
- Ekspor PNG, ZIP, PDF, dan cetak berfungsi (ZIP dan Cetak sudah
  diperbaiki dari kondisi tombol mati).
- CI hijau (4 job) + live terverifikasi HTTP 200 + play-test.
- Gate 7 sumbu desain ≥ 4/5 tiap sumbu (lihat
  [docs/DESIGN.md](docs/DESIGN.md)).
