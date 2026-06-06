# Deploy VPS

Panduan ini untuk deploy app ke VPS Linux pada folder `/var/www/amt` dengan domain `amt.erp.my.id`.

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
ADMIN_REPORT_EMAIL="admin@amt.erp.my.id"
APP_URL="https://amt.erp.my.id"
```

Catatan:

- Gunakan `ADMIN_PASSWORD_SHA256` agar password tidak disimpan plaintext.
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

## 6. Konfigurasi Nginx

Buat file:

```bash
sudo nano /etc/nginx/sites-available/amt.erp.my.id
```

Isi:

```nginx
server {
    listen 80;
    server_name amt.erp.my.id;

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
sudo ln -s /etc/nginx/sites-available/amt.erp.my.id /etc/nginx/sites-enabled/amt.erp.my.id
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Aktifkan HTTPS

Pastikan DNS `amt.erp.my.id` sudah mengarah ke IP VPS, lalu jalankan:

```bash
sudo certbot --nginx -d amt.erp.my.id
```

Setelah selesai, uji:

```bash
curl -I https://amt.erp.my.id
```

## 8. Update Deploy Berikutnya

```bash
cd /var/www/amt
git pull origin main
npm ci
npm run build
pm2 restart amt
pm2 logs amt
```

## 9. Checklist Singkat

- DNS domain sudah mengarah ke VPS
- `.env` production sudah diisi
- `npm run build` sukses
- `pm2 status` menunjukkan app `online`
- `curl http://127.0.0.1:3001/api/health` mengembalikan `{"status":"ok"}`
- `https://amt.erp.my.id` terbuka normal
- `https://amt.erp.my.id/#admin` bisa login
