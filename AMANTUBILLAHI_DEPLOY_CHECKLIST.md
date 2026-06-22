# Checklist Deploy `amantubillahi.com`

## Sebelum Deploy

- Pastikan DNS `amantubillahi.com` mengarah ke IP VPS
- Pastikan DNS `www.amantubillahi.com` mengarah ke host yang sama
- Pastikan file `.env` production berisi `APP_URL="https://amantubillahi.com"`
- Pastikan `ADMIN_USERNAME`, `ADMIN_PASSWORD_SHA256`, dan `ADMIN_REPORT_EMAIL` sudah terisi

## Deploy Aplikasi

```bash
cd /var/www/amt
git pull origin main
npm ci
npm run build
pm2 restart amt
pm2 logs amt --lines 50
```

## Validasi Internal

```bash
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1:3001/api/ready
```

Hasil yang diharapkan:

- `/api/health` -> `{"status":"ok"}`
- `/api/ready` -> `{"status":"ready","persistenceAvailable":true,"adminConfigured":true}`

## Validasi HTTPS dan Redirect

```bash
curl -I https://amantubillahi.com
curl -I https://www.amantubillahi.com
```

Hasil yang diharapkan:

- `https://amantubillahi.com` -> `200 OK`
- `https://www.amantubillahi.com` -> `301` atau `308` ke `https://amantubillahi.com`
- Tidak ada error sertifikat SSL

## Validasi SEO Teknis

```bash
curl https://amantubillahi.com/robots.txt
curl https://amantubillahi.com/sitemap.xml
curl -s https://amantubillahi.com | grep canonical
curl -s https://amantubillahi.com/artikel/travel-umroh-lombok-mataram-barat | grep canonical
```

Hasil yang diharapkan:

- `robots.txt` berisi plain text dan URL sitemap
- `sitemap.xml` berisi XML `<urlset>`
- Canonical homepage menunjuk ke `https://amantubillahi.com/`
- Canonical artikel menunjuk ke `https://amantubillahi.com/artikel/<slug>`

## Validasi UI

- Homepage terbuka normal tanpa warning browser
- Footer social link dapat diakses dengan label yang benar
- Tidak ada typo trust utama pada hero dan FAQ
- Halaman artikel tampil normal dan meta artikel sesuai

## Sign-off

- SSL valid
- Redirect host valid
- Canonical valid
- Sitemap valid
- Robots valid
- Admin login valid
