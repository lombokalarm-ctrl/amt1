# Release Checklist

Status rilis saat ini: `NO-GO`

Gunakan dokumen ini sebagai checklist final sebelum deploy production.

## Cara Pakai

- Ubah status item menjadi `DONE` saat selesai diverifikasi.
- Pertahankan item `BLOCKED` untuk hal yang menghentikan go-live.
- Isi nama PIC aktual bila owner masih generik.
- Lampirkan bukti verifikasi pada PR, tiket, atau catatan rilis internal.

## Ringkasan Go/No-Go

| Area | Status | Catatan |
| --- | --- | --- |
| Build & Lint | DONE | Build dan lint terakhir lolos |
| Security Hardening | DONE | Auth server-side, rate limit, CSP, validasi request sudah aktif |
| SEO Technical | DONE | Metadata server-side, canonical, dan route artikel sudah aktif |
| Production Env | BLOCKED | Nilai env production belum diisi |
| Legal & Content Verification | BLOCKED | Klaim bisnis/legal belum disetujui final |
| Persistence Strategy | BLOCKED | Masih memakai file lokal `data/cms-db.json` |
| Final Domain Smoke Test | PENDING | Harus dijalankan setelah domain/env final siap |

## Release Blockers

### 1. Production Environment

- [ ] Owner: `Ops`
  Status: `BLOCKED`
  File: [.env.example](file:///e:/Project/web/amt1/.env.example)
  Action: Isi `APP_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_SHA256` atau `ADMIN_PASSWORD`, `ADMIN_REPORT_EMAIL`, dan `GEMINI_API_KEY` bila fitur AI tetap dipakai.

- [ ] Owner: `Ops/Security`
  Status: `BLOCKED`
  File: [.env.example](file:///e:/Project/web/amt1/.env.example)
  Action: Gunakan password admin yang kuat dan utamakan `ADMIN_PASSWORD_SHA256` dibanding plaintext.

### 2. Legal, Brand, And Public Copy

- [ ] Owner: `Business/Legal`
  Status: `BLOCKED`
  File: [seed.ts](file:///e:/Project/web/amt1/src/seed.ts)
  Action: Verifikasi nomor izin, alamat kantor, nomor telepon, email, nama brand, dan semua copy publik.

- [ ] Owner: `Business/Legal`
  Status: `BLOCKED`
  File: [Hero.tsx](file:///e:/Project/web/amt1/src/components/Hero.tsx), [FAQ.tsx](file:///e:/Project/web/amt1/src/components/FAQ.tsx), [Footer.tsx](file:///e:/Project/web/amt1/src/components/Footer.tsx)
  Action: Verifikasi klaim hotel, penerbangan, layanan, izin PPIU, refund, dan wording compliance.

### 3. Persistence And Data Safety

- [ ] Owner: `Ops/Product`
  Status: `BLOCKED`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Putuskan apakah launch boleh memakai file lokal `data/cms-db.json` atau harus pindah ke database sebelum go-live.

- [ ] Owner: `Ops`
  Status: `PENDING`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Jika tetap memakai file lokal, siapkan backup, restore, dan prosedur rotasi data.

## Final QA Checklist

### 4. Public Site

- [ ] Owner: `QA`
  Status: `PENDING`
  File: [App.tsx](file:///e:/Project/web/amt1/src/App.tsx), [Header.tsx](file:///e:/Project/web/amt1/src/components/Header.tsx)
  Action: Verifikasi `CMS Admin` tidak muncul di navigasi publik production.

- [ ] Owner: `QA`
  Status: `PENDING`
  File: [BookingForm.tsx](file:///e:/Project/web/amt1/src/components/BookingForm.tsx), [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Verifikasi form booking berhasil submit dari domain production.

- [ ] Owner: `QA/Content`
  Status: `PENDING`
  File: [Articles.tsx](file:///e:/Project/web/amt1/src/components/Articles.tsx), [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Uji minimal 3 URL artikel `/artikel/<slug>` dan pastikan title, description, canonical, serta OG image sesuai.

- [ ] Owner: `QA`
  Status: `PENDING`
  File: [Hero.tsx](file:///e:/Project/web/amt1/src/components/Hero.tsx), [seed.ts](file:///e:/Project/web/amt1/src/seed.ts)
  Action: Verifikasi semua gambar memuat dari path production valid, bukan path source mentah.

### 5. Admin CMS

- [ ] Owner: `QA`
  Status: `PENDING`
  File: [AdminCMS.tsx](file:///e:/Project/web/amt1/src/components/AdminCMS.tsx), [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Verifikasi login admin, logout, sesi berakhir, dan re-login bekerja di production.

- [ ] Owner: `QA`
  Status: `PENDING`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Verifikasi endpoint sensitif menolak akses tanpa sesi admin yang valid.

- [ ] Owner: `QA`
  Status: `PENDING`
  File: [AdminCMS.tsx](file:///e:/Project/web/amt1/src/components/AdminCMS.tsx)
  Action: Verifikasi create, edit, delete paket, blog, dan header/footer dari CMS.

- [ ] Owner: `QA`
  Status: `PENDING`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Verifikasi generate report dan SEO analyzer berfungsi sesuai env yang tersedia.

## SEO And Domain Checklist

- [ ] Owner: `Ops/SEO`
  Status: `BLOCKED`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Isi `APP_URL` dengan domain production agar canonical dan OG URL tidak memakai host sementara.

- [ ] Owner: `SEO`
  Status: `NOT STARTED`
  File: `public/robots.txt`
  Action: Tambahkan `robots.txt` final.

- [ ] Owner: `SEO`
  Status: `NOT STARTED`
  File: `public/sitemap.xml`
  Action: Tambahkan `sitemap.xml` final.

- [ ] Owner: `Design/Dev`
  Status: `NOT STARTED`
  File: [index.html](file:///e:/Project/web/amt1/index.html)
  Action: Tambahkan favicon dan icon brand final.

## Operations Checklist

- [ ] Owner: `Ops`
  Status: `PENDING`
  File: [package.json](file:///e:/Project/web/amt1/package.json)
  Action: Verifikasi command deploy production memakai build artifact terbaru dan env yang benar.

- [ ] Owner: `Ops`
  Status: `PENDING`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Verifikasi HTTPS aktif di edge/platform agar HSTS dan secure cookie efektif.

- [ ] Owner: `Ops`
  Status: `PENDING`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Verifikasi endpoint `GET /api/health` dan `GET /api/ready` dari environment production.

- [ ] Owner: `Ops`
  Status: `NOT STARTED`
  File: [README.md](file:///e:/Project/web/amt1/README.md)
  Action: Tambahkan prosedur rollback, restore data, dan catatan operasional singkat.

- [ ] Owner: `Ops`
  Status: `NOT STARTED`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Tambahkan logging/monitoring platform bila belum tersedia.

## Already Completed

- [x] Owner: `Dev`
  Status: `DONE`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts), [AdminCMS.tsx](file:///e:/Project/web/amt1/src/components/AdminCMS.tsx)
  Action: Auth admin dipindah ke sesi server-side `HttpOnly`.

- [x] Owner: `Dev`
  Status: `DONE`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Endpoint sensitif admin diproteksi.

- [x] Owner: `Dev`
  Status: `DONE`
  File: [App.tsx](file:///e:/Project/web/amt1/src/App.tsx)
  Action: App publik tidak lagi fetch stats/reports admin.

- [x] Owner: `Dev`
  Status: `DONE`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: Validasi payload, rate limiting, health, dan ready endpoint sudah aktif.

- [x] Owner: `Dev`
  Status: `DONE`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts)
  Action: CSP dan security headers production sudah aktif.

- [x] Owner: `Dev`
  Status: `DONE`
  File: [server.ts](file:///e:/Project/web/amt1/server.ts), [index.html](file:///e:/Project/web/amt1/index.html), [Articles.tsx](file:///e:/Project/web/amt1/src/components/Articles.tsx)
  Action: Metadata SEO server-side dan route artikel production-ready sudah aktif.

- [x] Owner: `Dev`
  Status: `DONE`
  File: [seed.ts](file:///e:/Project/web/amt1/src/seed.ts), [Hero.tsx](file:///e:/Project/web/amt1/src/components/Hero.tsx), [AdminCMS.tsx](file:///e:/Project/web/amt1/src/components/AdminCMS.tsx)
  Action: Asset path gambar sudah dinormalkan untuk build production.

- [x] Owner: `Dev`
  Status: `DONE`
  File: [package.json](file:///e:/Project/web/amt1/package.json)
  Action: Build frontend dan backend lolos dengan bundling asset yang benar.

## Sign-Off

- Product Owner: `______`
- Business/Legal: `______`
- QA: `______`
- Ops/Infra: `______`
- Final Go-Live Decision: `GO / NO-GO`
- Tanggal Rilis: `______`
