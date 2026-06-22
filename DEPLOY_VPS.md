# Deploy VPS

Panduan ini untuk deploy app ke VPS Linux pada folder `/var/www/amt` dengan domain utama `amantubillahi.com`.

## 1. Kebutuhan Server

- Ubuntu/Debian dengan akses `sudo`
- Node.js 22
- npm
- Nginx
- PM2
- Certbot
- Git

Contoh install dasar:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. Pull Project

```bash
cd /var/www/amt
git pull origin main
npm ci
```

Jika branch utama bukan `main`, sesuaikan dengan branch repo Anda.

## 3. Buat Environment

Buat file `.env` di `/var/www/amt`:

```env
GEMINI_API_KEY=""
ADMIN_USERNAME="cmsadmin"
ADMIN_PASSWORD=""
ADMIN_PASSWORD_SHA256="ISI_HASH_SHA256_PASSWORD_ADMIN"
ADMIN_REPORT_EMAIL="admin@amantubillahi.com"
APP_URL="https://amantubillahi.com"
```

Catatan:

- Gunakan `ADMIN_PASSWORD_SHA256` agar password tidak disimpan plaintext.
- `APP_URL` wajib memakai domain canonical final agar canonical tag, Open Graph, sitemap, dan redirect host konsisten.
- Jika memakai fitur AI, isi `GEMINI_API_KEY`.

## 4. Build App

```bash
cd /var/www/amt
npm run build
```

## 5. Jalankan Dengan PM2

Project ini sudah disiapkan untuk dijalankan via `ecosystem.config.cjs`.

```bash
cd /var/www/amt
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Cek status:

```bash
pm2 status
pm2 logs amt
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1:3001/api/ready
```

## 6. DNS Yang Wajib Ada

Sebelum mengaktifkan HTTPS, siapkan record DNS:

- `amantubillahi.com` -> `A` ke IP VPS
- `www.amantubillahi.com` -> `CNAME` ke `amantubillahi.com` atau `A` ke IP VPS yang sama

Verifikasi:

```bash
dig +short amantubillahi.com
dig +short www.amantubillahi.com
```

## 7. Konfigurasi Nginx

Buat file:

```bash
sudo nano /etc/nginx/sites-available/amantubillahi.com
```

Isi:

```nginx
server {
    listen 80;
    server_name amantubillahi.com www.amantubillahi.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/amantubillahi.com /etc/nginx/sites-enabled/amantubillahi.com
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Aktifkan HTTPS Yang Benar

Pastikan DNS apex dan `www` sudah aktif, lalu jalankan:

```bash
sudo certbot --nginx -d amantubillahi.com -d www.amantubillahi.com
```

Setelah selesai, uji:

```bash
curl -I https://amantubillahi.com
curl -I https://www.amantubillahi.com
```

Hasil ideal:

- `https://amantubillahi.com` -> `200`
- `https://www.amantubillahi.com` -> `301` atau `308` ke `https://amantubillahi.com`

## 9. Verifikasi SEO Teknis Setelah Deploy

```bash
curl -I https://amantubillahi.com
curl https://amantubillahi.com/robots.txt
curl https://amantubillahi.com/sitemap.xml
curl https://amantubillahi.com/api/health
curl https://amantubillahi.com/api/ready
```

Checklist hasil:

- Sertifikat valid untuk `amantubillahi.com`
- Sertifikat valid untuk `www.amantubillahi.com`
- `robots.txt` mengembalikan plain text, bukan HTML
- `sitemap.xml` mengembalikan XML sitemap, bukan HTML
- `<link rel="canonical">` di homepage memakai `https://amantubillahi.com/`
- Halaman artikel memakai canonical `https://amantubillahi.com/artikel/<slug>`
- `www` tidak tampil sebagai host final, tetapi diarahkan ke apex

## 10. Update Deploy Berikutnya

```bash
cd /var/www/amt
git pull origin main
npm ci
npm run build
pm2 restart amt
pm2 logs amt
```

## 11. Checklist Singkat

- DNS apex dan `www` sudah mengarah benar
- `.env` production sudah diisi dengan `APP_URL="https://amantubillahi.com"`
- `npm run build` sukses
- `pm2 status` menunjukkan app `online`
- `curl http://127.0.0.1:3001/api/health` mengembalikan `{"status":"ok"}`
- `https://amantubillahi.com` terbuka normal tanpa warning sertifikat
- `https://www.amantubillahi.com` mengarah ke host utama
- `https://amantubillahi.com/robots.txt` valid
- `https://amantubillahi.com/sitemap.xml` valid
- `https://amantubillahi.com/#admin` bisa login
