# 📱 Tutorial Lengkap: Deploy WhatsApp Bot ke Railway.app

## 🎯 Tujuan
Membuat bot WhatsApp aktif 24/7 untuk mengirim notifikasi checkout otomatis ke grup admin.

## ⏱️ Estimasi Waktu: 15-20 menit

---

## 📋 Yang Anda Butuhkan:
- ✅ Akun GitHub (sudah ada)
- ✅ Repository sudah di-push (sudah)
- ✅ HP dengan WhatsApp (081522735657)
- ✅ Koneksi internet stabil

---

# BAGIAN 1: DAFTAR RAILWAY (5 menit)

## Step 1.1: Buka Railway.app

1. Buka browser (Chrome/Safari/Firefox)
2. Ketik di address bar: `https://railway.app`
3. Tekan Enter

## Step 1.2: Login dengan GitHub

1. Klik tombol **"Login"** di pojok kanan atas
2. Pilih **"Login with GitHub"**
3. Jika belum login GitHub, login dulu
4. Klik **"Authorize Railway"** (warna hijau)
5. Tunggu redirect ke Railway dashboard

## Step 1.3: Verifikasi Email (Jika Diminta)

1. Cek email dari Railway
2. Klik link verifikasi
3. Kembali ke Railway dashboard

✅ **Selesai!** Anda sekarang punya akun Railway dengan $5 credit gratis.

---

# BAGIAN 2: DEPLOY BOT (10 menit)

## Step 2.1: Buat Project Baru

1. Di Railway dashboard, klik **"New Project"** (tombol ungu besar)
2. Pilih **"Deploy from GitHub repo"**
3. Jika muncul popup "Install Railway on GitHub":
   - Klik **"Configure GitHub App"**
   - Pilih **"Only select repositories"**
   - Pilih repository: **Manajemen-Liaa**
   - Klik **"Install & Authorize"**

## Step 2.2: Pilih Repository

1. Setelah authorize, Anda kembali ke Railway
2. Pilih repository: **Manajemen-Liaa**
3. Railway akan mulai analyze repository

## Step 2.3: Konfigurasi Service

Railway akan detect ada 2 folder:
- Root folder (React app)
- whatsapp-bot-apartemen (Bot)

**PENTING:** Kita hanya deploy bot, bukan React app!

1. Klik **"Add variables"** atau **"Skip"** (kita set nanti)
2. Railway akan mulai deploy
3. **TUNGGU!** Ini akan error karena deploy root folder

## Step 2.4: Set Root Directory (PENTING!)

1. Klik service yang baru dibuat (ada icon GitHub)
2. Klik tab **"Settings"** (icon gear)
3. Scroll ke bawah, cari **"Root Directory"**
4. Klik **"/"** (default)
5. Ketik: `whatsapp-bot-apartemen`
6. Klik di luar box untuk save
7. Railway akan auto-redeploy

## Step 2.5: Tunggu Build Selesai

1. Klik tab **"Deployments"** (icon rocket)
2. Lihat deployment terbaru (paling atas)
3. Status akan berubah:
   - 🟡 **Building** (1-2 menit)
   - 🟢 **Active** (berhasil!)
   - 🔴 **Failed** (ada error, cek logs)

✅ **Jika status Active, lanjut ke step berikutnya!**

---

# BAGIAN 3: SCAN QR CODE (5 menit)

## Step 3.1: Buka Logs

1. Masih di tab **"Deployments"**
2. Klik deployment yang **Active** (hijau)
3. Klik tab **"Logs"** (icon document)
4. Tunggu 10-20 detik

## Step 3.2: Cari QR Code

Scroll ke bawah di logs, cari text seperti ini:

```
🚀 WhatsApp Bot API running on port 3001
📡 API Endpoints:
   - POST http://localhost:3001/send-message
   - POST http://localhost:3001/send-group-message
   - GET  http://localhost:3001/chats
   - GET  http://localhost:3001/status

📱 Scan QR Code ini dengan WhatsApp Anda:
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ▀██▄█▀▄▀███▄▄▄█ █ ▄▄▄  ▀ ▀█▀█ █▀▄ ▄ ▀▄ ██ ▄▄▄▄▄ █
█ █   █ █ ▀  ▄███ ▄▄█▄▄▀▄▄▀██▀█▀ █▀▄▀▄█ ▄▀▄█▀█ ▄ ██ █   █ █
... (QR code ASCII art)
```

## Step 3.3: Scan dengan WhatsApp

1. **Buka WhatsApp** di HP (081522735657)
2. Tap **menu** (3 titik di pojok kanan atas)
3. Pilih **"Perangkat Tertaut"** atau **"Linked Devices"**
4. Tap **"Tautkan Perangkat"** atau **"Link a Device"**
5. **Arahkan kamera HP ke QR code di layar komputer**
6. Tunggu sampai tersambung

## Step 3.4: Verifikasi Koneksi

Setelah scan, tunggu 5-10 detik. Di logs akan muncul:

```
✅ WhatsApp Authenticated!
✅ WhatsApp Bot Connected!
✅ Bot is ready to send messages!
```

✅ **BERHASIL!** Bot sekarang tersambung!

---

# BAGIAN 4: DAPATKAN URL BOT (3 menit)

## Step 4.1: Generate Domain

1. Kembali ke Railway dashboard
2. Klik service bot Anda
3. Klik tab **"Settings"**
4. Scroll ke **"Networking"**
5. Klik **"Generate Domain"**
6. Railway akan buat URL otomatis

Contoh URL:
```
whatsapp-bot-production-abcd.up.railway.app
```

## Step 4.2: Copy URL

1. Klik icon **copy** di sebelah URL
2. Atau select dan Ctrl+C / Cmd+C
3. **SIMPAN URL INI!** Anda akan butuh nanti

## Step 4.3: Test URL

Buka browser baru, ketik:
```
https://whatsapp-bot-production-abcd.up.railway.app/status
```

Ganti `whatsapp-bot-production-abcd` dengan URL Anda.

Jika berhasil, akan muncul:
```json
{
  "connected": true,
  "ready": true,
  "qrCode": null,
  "message": "Bot siap kirim pesan"
}
```

✅ **Bot sudah online dan siap digunakan!**

---

# BAGIAN 5: HUBUNGKAN KE VERCEL (5 menit)

## Step 5.1: Buka Vercel Dashboard

1. Buka: `https://vercel.com`
2. Login (jika belum)
3. Pilih project: **Manajemen-Liaa**

## Step 5.2: Tambah Environment Variable

1. Klik tab **"Settings"**
2. Klik **"Environment Variables"** di sidebar kiri
3. Klik **"Add New"** atau **"Add"**

## Step 5.3: Isi Variable

**Key (Name):**
```
VITE_WHATSAPP_BOT_URL
```

**Value:**
```
https://whatsapp-bot-production-abcd.up.railway.app
```
*(Ganti dengan URL Railway Anda!)*

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

Klik **"Save"**

## Step 5.4: Redeploy Vercel

1. Klik tab **"Deployments"**
2. Klik **3 titik** di deployment teratas
3. Klik **"Redeploy"**
4. Klik **"Redeploy"** lagi untuk konfirmasi
5. Tunggu 1-2 menit

✅ **Selesai!** Vercel sekarang terhubung ke bot Railway.

---

# BAGIAN 6: TEST BOT (5 menit)

## Step 6.1: Test Manual via Browser

Buka browser, ketik URL ini (ganti dengan URL Anda):

```
https://whatsapp-bot-production-abcd.up.railway.app/chats
```

Akan muncul daftar grup:
```json
{
  "success": true,
  "groups": [
    {
      "id": "120363421176803388@g.us",
      "name": "Apartemen",
      "participants": 6
    }
  ]
}
```

## Step 6.2: Test Kirim Pesan ke Grup

Buka Terminal/Command Prompt, jalankan:

```bash
curl -X POST https://whatsapp-bot-production-abcd.up.railway.app/send-group-message \
  -H "Content-Type: application/json" \
  -d '{"groupId":"120363421176803388@g.us","message":"🎉 Bot WhatsApp sudah aktif di Railway!\n\nNotifikasi checkout otomatis sekarang berfungsi 24/7."}'
```

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Uri "https://whatsapp-bot-production-abcd.up.railway.app/send-group-message" -Method Post -ContentType "application/json" -Body '{"groupId":"120363421176803388@g.us","message":"🎉 Bot WhatsApp sudah aktif di Railway!"}'
```

## Step 6.3: Cek WhatsApp

1. Buka WhatsApp di HP
2. Buka grup **"Apartemen"**
3. Anda akan melihat pesan dari bot!

✅ **BOT BERFUNGSI!**

## Step 6.4: Test dari Aplikasi

1. Buka aplikasi Vercel: `https://manajemen-liaa.vercel.app`
2. Buat booking test dengan checkout 1 menit
3. Tunggu 1 menit
4. Cek grup WhatsApp → Notifikasi masuk otomatis!

✅ **SEMUA BERFUNGSI!**

---

# 🎉 SELESAI!

## ✅ Yang Sudah Berhasil:

1. ✅ Bot WhatsApp running 24/7 di Railway
2. ✅ Bot tersambung dengan WhatsApp (081522735657)
3. ✅ Bot bisa kirim ke grup "Apartemen"
4. ✅ Aplikasi Vercel terhubung ke bot
5. ✅ Notifikasi checkout otomatis aktif
6. ✅ Monitoring via Railway dashboard
7. ✅ 100% GRATIS ($5 credit/bulan)

---

# 📊 MONITORING & MAINTENANCE

## Cek Status Bot

**Via Browser:**
```
https://whatsapp-bot-production-abcd.up.railway.app/status
```

**Via Railway:**
1. Railway dashboard
2. Klik service bot
3. Tab "Deployments"
4. Lihat status (hijau = aktif)

## Lihat Logs

1. Railway dashboard
2. Klik service bot
3. Tab "Deployments"
4. Klik deployment aktif
5. Tab "Logs"

## Restart Bot (Jika Perlu)

1. Railway dashboard
2. Klik service bot
3. Tab "Settings"
4. Scroll ke bawah
5. Klik **"Restart"**

## QR Code Expired?

Jika bot disconnect (jarang terjadi):
1. Restart bot (lihat di atas)
2. Lihat logs untuk QR code baru
3. Scan ulang dengan WhatsApp

---

# 💰 BIAYA & USAGE

## Free Tier Railway:
- $5 credit/bulan
- Cukup untuk bot 24/7
- Monitor usage di dashboard

## Cek Usage:
1. Railway dashboard
2. Klik **"Usage"** di sidebar
3. Lihat credit remaining

## Jika Credit Habis:
- Upgrade ke $5/bulan (unlimited)
- Atau pakai VPS (Rp 80k-100k/bulan)

---

# 🆘 TROUBLESHOOTING

## Bot Tidak Connect?

**Solusi:**
1. Cek logs di Railway
2. Restart service
3. Scan ulang QR code

## Notifikasi Tidak Terkirim?

**Cek:**
1. Bot status: `/status` endpoint
2. Logs Railway untuk error
3. Environment variable di Vercel
4. Grup ID sudah benar?

## QR Code Tidak Muncul?

**Solusi:**
1. Tunggu 30-60 detik
2. Refresh logs
3. Restart service

## Error "Port already in use"?

**Solusi:**
- Railway otomatis assign port
- Tidak perlu action, tunggu saja

## Bot Sering Disconnect?

**Solusi:**
1. Pastikan HP WhatsApp online
2. Jangan logout WhatsApp di HP
3. Jangan hapus "Perangkat Tertaut"

---

# 📞 SUPPORT

## Railway Support:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: team@railway.app

## WhatsApp-Web.js:
- GitHub: https://github.com/pedroslopez/whatsapp-web.js
- Docs: https://wwebjs.dev

---

# 🎯 NEXT STEPS (Opsional)

## 1. Custom Domain

Ganti URL Railway dengan domain sendiri:
1. Railway → Settings → Networking
2. Add custom domain
3. Update DNS records

## 2. Monitoring Advanced

Setup monitoring dengan:
- UptimeRobot (free)
- Better Uptime
- Pingdom

## 3. Backup Session

Download session dari Railway:
1. Railway CLI: `railway run bash`
2. Backup folder `.wwebjs_auth/`

## 4. Multiple Bots

Deploy bot lain untuk grup berbeda:
- Duplicate service di Railway
- Ganti grup ID
- Deploy

---

# ✨ SELAMAT!

Bot WhatsApp Anda sekarang:
- ✅ Aktif 24/7
- ✅ Kirim notifikasi otomatis
- ✅ Monitoring mudah
- ✅ 100% GRATIS

**Aplikasi manajemen apartemen Anda sudah lengkap dan production-ready!** 🎉

---

**Dibuat dengan ❤️ untuk Manajemen Apartemen Liaa**

_Last updated: 2026-05-13_
