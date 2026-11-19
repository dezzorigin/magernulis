# deploy.md — Deploy ke Cloudflare Pages

## Proyek

| Field | Nilai |
|---|---|
| Proyek Pages | `magernulis` |
| URL live | https://magernulis.pages.dev |
| Metode | Direct upload via API (`cf_pages.py`, pola wrangler v4) |
| Isi deploy | Seluruh folder repo (situs statis; tanpa build) |

## Nama

Nama `magernulis` didapat bersih di percobaan pertama (tanpa sufiks,
tanpa HTTP 409). Fallback yang disiapkan (tidak terpakai):
`mager-nulis` → `tulis-mager`.

## Cara deploy ulang

```bash
# dari ~/workspace/github-actions/
python3 cf_pages.py deploy magernulis ~/workspace/magernulis
```

Perintah di atas mengunggah seluruh folder repo sebagai aset statis
(`index.html` di root = landing, `studio/` = aplikasi).

> Catatan: `cf_pages.py deploy` bisa 404 sesaat setelah `create-project`
> — retry setelah ~20 detik, bukan error nama (pelajaran #33).

## Verifikasi pasca-deploy

```bash
curl -s -o /tmp/magernulis-live.html -w "%{http_code}\n" https://magernulis.pages.dev/
grep -o "Magernulis" /tmp/magernulis-live.html | head -1
curl -s -o /dev/null -w "%{http_code}\n" https://magernulis.pages.dev/studio/
```

Lalu play-test di browser sungguhan: ketik di panel → kertas berubah;
klik preset; tambah halaman; buka menu Bagikan/Unduh. (Play-test headless
dari VM untuk situs statis ini dimungkinkan via forwarder — lihat
`scripts/screenshot.mjs`.)

## About repo

Setelah live, pasang tautan live di About repo (homepage) via API:

```bash
# PATCH /repos/dezzorigin/magernulis {"homepage": "https://magernulis.pages.dev"}
# lalu verifikasi GET repo menampilkan homepage tersebut.
```
