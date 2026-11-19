# DESIGN.md — Magernulis (kontrak arah desain)

Ditulis SEBELUM coding, mengikuti standar anti AI slop
(`~/workspace/github-actions/ui-anti-slop.md`). Semua keputusan di bawah
mengikat landing (`index.html`) dan studio (`studio/`).

## Referensi (riset dulu, baru bangun)

Kandidat yang ditinjau (19 Nov 2026):

1. **Ebb — Framer template (PEMENANG)**
   https://www.framer.com/marketplace/templates/ebb/
   Landing aplikasi jurnal malam. Yang dicloning strukturnya: hero editorial
   dengan kartu kertas miring + tanda tangan tulisan tangan, strip "catatan
   dari pembuat" sebagai pengganti deretan statistik, tipografi serif yang
   tenang. Cocok karena produk kita juga soal kertas + tulisan tangan.
2. **Footnote — Framer Community**
   https://www.framer.com/community/posts/WZragatyTVFNH3qVwsj2mf/
   Landing SaaS yang tenang dan mengutamakan tipografi di atas halaman
   putih-kertas. Diambil semangatnya (type-first, tanpa foto stok) tapi
   bukan struktur utamanya.
3. **The Draft — Framer template**
   https://www.framer.com/marketplace/templates/the-draft/
   Estetika editorial untuk penulis. Ditolak sebagai pemenang karena
   terlalu berorientasi publikasi panjang, bukan alat.

Yang diubah dari Ebb dan kenapa: Ebb memakai mockup ponsel (produknya
aplikasi mobile); Magernulis memakai kartu kertas Cornell asli sebagai
preview hero — karena produknya memang menghasilkan selembar kertas, bukan
layar ponsel. Tanda tangan "pembuat" diganti catatan dari pembuat
Magernulis. Palet Ebb yang hangat diganti palet dunia alat tulis
(pulpen biru, merah margin, stabilo kuning).

## Palet (6 warna bernama, tiap warna punya tugas)

| Nama | Hex | Peran |
|---|---|---|
| Kertas | `#FDFCF6` | Latar halaman landing + kertas |
| Tinta | `#23272E` | Teks utama, judul |
| Pulpen Biru | `#1D4ED8` | Aksi utama, tautan, aksen studio (pengganti ungu Canva `#7D2AE8`) |
| Merah Margin | `#B91C1C` | Garis margin Cornell, koreksi, aksi bahaya |
| Stabilo | `#FDE68A` | Sorotan wash di belakang frasa kunci (bukan warna teks) |
| Abu Pensil | `#6B7280` | Teks sekunder, label |

Bukan satu hue: putih-kertas, hitam-tinta, biru, merah, kuning, abu.
Tidak ada gradient ungu/biru, tidak ada headline gradient.

## Tipografi (maksimal 2 keluarga font UI)

- Display: **Newsreader** (serif editorial — dunia kertas/buku).
- Body/UI: **IBM Plex Sans** (teks landing + seluruh UI studio,
  menggantikan Plus Jakarta Sans di studio).
- Font tulisan tangan (17 font Google yang sudah dipakai produk: Caveat,
  Kalam, Patrick Hand, dsb.) adalah **konten produk**, bukan font UI —
  dipakai untuk merender catatan dan spesimen font, bukan untuk judul/tombol.

## Layout (satu kalimat + satu detail khas)

Editorial kertas: hero kiri (judul, subjudul, satu CTA utama "Buka Studio")
+ kanan kartu kertas Cornell miring 2°; diikuti strip catatan pembuat
bertanda tangan, empat baris fitur bergantian, strip spesimen 17 font,
tiga langkah cara pakai, FAQ, footer satu baris.

**Detail khas:** garis margin merah vertikal + tiga lubang binder di tepi
kiri setiap kartu kertas, dan satu frasa yang disorot stabilo kuning.
Motif ini dipakai di hero, di strip catatan pembuat, dan di kartu kertas
studio (sudah ada di produk).

## Beda dari repo sebelumnya (#35 tiktok-likes-tool, minimal 3 dari 5 sumbu)

#35: palet terang Kertas/Tinta/Merah Hati, Bricolage Grotesque + Public
Sans, layout konsol kiriman dengan log berjalan, referensi Plumb Proof.

| Sumbu | #35 | #36 Magernulis |
|---|---|---|
| Palet | Merah hati satu aksen | Biru pulpen + merah margin + stabilo kuning |
| Tipografi | Bricolage Grotesque (grotesk) | Newsreader (serif editorial) |
| Layout | Konsol + struk di tengah | Editorial kiri + kartu kertas miring |
| Radius/spacing | Kartu konsol radius besar | Kartu kertas radius 4px, garis keras 1px |
| Detail khas | Log berjalan di konsol | Garis margin merah + lubang binder + stabilo |

Beda 5/5 sumbu.

## Larangan yang ditegakkan

- Nol P0: tanpa gradient ungu/biru, tanpa `bg-clip-text`, tanpa Inter/
  Roboto, tanpa hero tengah + 3 kartu identik, tanpa emoji mentah sebagai
  ikon fungsi (preset memakai SVG), tanpa statistik vanity, tanpa satu kata
  headline di-italic/diwarnai, tanpa tema mentah, tanpa `rounded-2xl
  shadow-lg` di semua permukaan, tanpa footer 4 kolom, tanpa copy generik.
- Logo lama (PNG gradient cyan→ungu) diganti mark SVG datar: pulpen di
  atas kertas dengan garis margin merah.
- Data contoh dilabeli "contoh" (preset, contoh catatan, spesimen font).

## Studio

Tema ungu Canva (`--canva-purple #7D2AE8`, gradient cyan→ungu, judul
gradient) diganti seluruhnya ke Pulpen Biru solid. Struktur editor
Canva-like (topbar + rail + drawer + kanvas + bottombar) dipertahankan
karena itu alur kerja produknya, bukan template. Ditambah: `focus-visible`,
`prefers-reduced-motion`, dan media query mobile 720px.

## Gate 7 sumbu (diisi setelah play-test, sebelum merge)

Dinilai 19 Nov 2026 dari play-test lokal (e2e 24/24 + screenshot
desktop/mobile). Semua sumbu ≥ 4 — lolos.

1. anti-slop purity: **5/5** — nol P0 (dibuktikan `npm run validate`:
   tanpa gradient ungu/biru, tanpa headline gradient, tanpa Inter/Roboto,
   tanpa emoji ikon, tanpa statistik vanity, tanpa footer 4 kolom); nol
   default orde-kedua (palet kertas/tinta/biru pulpen/merah margin/stabilo,
   bukan krim+terracotta atau near-black+lime).
2. UX speed & 1-to-3: **4/5** — landing 1 aksi utama per viewport
   ("Buka Studio"); studio adalah editor sehingga panelnya padat, tapi
   aksi utama (Bagikan/Unduh) selalu terlihat di topbar.
3. tipografi: **5/5** — 2 font UI (Newsreader + IBM Plex Sans); font
   tangan adalah konten produk; body ≤ 62ch.
4. spacing & geometri: **4/5** — padding kartu ≥ 16px; radius luar 10px,
   dalam 6px, kartu kertas 4px; grid berbasis kelipatan 4/8.
5. motion: **4/5** — transisi 150ms ease-out; drawer 250ms (satu-satunya
   di atas 200ms, disengaja agar panel terasa mantap); `prefers-reduced-motion`
   dihormati; tombol aktif scale 0.97.
6. a11y: **4/5** — `focus-visible` di semua kontrol, tag semantik
   (header/nav/main/section/footer), kontras AA (Tinta #23272E di atas
   Kertas #FDFCF6 ≈ 14:1; Pulpen #1D4ED8 ≈ 6:1); tombol ikon bertitel.
7. mobile: **4/5** — landing 390px stack rapi tanpa scroll horizontal;
   studio 390px: drawer default tertutup agar kertas langsung terlihat,
   topbar bisa di-scroll horizontal, kanvas bisa di-scroll.

Tes siluet: thumbnail hitam-putih landing masih terbaca sebagai "alat
catatan kertas bertulisan tangan" (kartu kertas miring + garis margin
merah) — bukan halaman produk generik mana pun. Lolos.
