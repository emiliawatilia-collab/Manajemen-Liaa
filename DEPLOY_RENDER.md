# 🚀 Deploy WhatsApp Bot ke Render.com (GRATIS)

## ✅ Keuntungan Render:
- **100% GRATIS** (Free tier permanent)
- Deploy langsung dari GitHub
- Scan QR code via logs
- Auto-restart jika crash
- Setup 10 menit
- **Tidak perlu kartu kredit**

---

## 📋 Langkah-Langkah Deploy:

### Step 1: Daftar Render

1. Buka https://render.com
2. Klik **"Get Started"** atau **"Sign Up"**
3. Pilih **"Sign up with GitHub"**
4. Authorize Render
5. Verifikasi email (cek inbox)

### Step 2: Buat Web Service Baru

1. Di Render dashboard, klik **"New +"**
2. Pilih **"Web Service"**
3. Klik **"Connect a repository"**
4. Jika belum connect GitHub:
   - Klik **"Configure account"**
   - Pilih **"Only select repositories"**
   - Pilih: **Manajemen-Liaa**
   - Klik **"Install"**

### Step 3: Pilih Repository

1. Cari repository: **Manajemen-Liaa**
2. Klik **"Connect"**

### Step 4: Konfigurasi Service

Isi form dengan data berikut:

**Name:**
```
whatsapp-bot-apartemen
```

**Region:**
```
Singapore (atau pilih terdekat)
```

**Branch:**
```
main
```

**Root Directory:**
```
whatsapp-bot-apartemen
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install
```

**Start Command:**
```
node bot-wweb.js
```

**Instance Type:**
```
Free
```

### Step 5: Environment Variables (Opsional)

Scroll ke bawah, klik **"Advanced"**

Tambahkan (opsional):
- Key: `NODE_ENV`, Value: `production`

### Step 6: Deploy!

1. Klik **"Create Web Service"** (tombol biru besar)
2. Render akan mulai build
3. Tunggu 3-5 menit
4. Status akan berubah **"Live"** (hijau)

### Step 7: Scan QR Code

1. Klik tab **"Logs"** di atas
2. Tunggu sampai muncul QR code ASCII
3. Scroll untuk lihat QR code lengkap
4. **Scan dengan WhatsApp** (081522735657)
5. Tunggu: `✅ WhatsApp Bot Connected!`

### Step 8: Dapatkan URL Bot

URL otomatis dibuat oleh Render:
```
https://whatsapp-bot-apartemen.onrender.com
```

Copy URL ini!

### Step 9: Update Vercel

1. Buka Vercel dashboard
2. Pilih project: **Manajemen-Liaa**
3. Settings → Environment Variables
4. Add New:
   - **Key**: `VITE_WHATSAPP_BOT_URL`
   - **Value**: `https://whatsapp-bot-apartemen.onrender.com`
5. Save
6. Redeploy

---

## ⚠️ Penting: Free Tier Render

### Auto-Sleep
Render free tier akan **sleep setelah 15 menit tidak ada request**.

**Solusi:**
1. Setup cron job untuk ping bot setiap 10 menit
2. Atau upgrade ke $7/bulan (no sleep)

### Keep-Alive Service

Tambahkan endpoint health check di bot (sudah ada):
```
GET /status
```

Gunakan service gratis untuk ping:
- **UptimeRobot** (https://uptimerobot.com) - GRATIS
- **Cron-job.org** (https://cron-job.org) - GRATIS

Setup:
1. Daftar UptimeRobot
2. Add Monitor
3. URL: `https://whatsapp-bot-apartemen.onrender.com/status`
4. Interval: 5 menit

---

## 🧪 Test Bot

### Test Status:
```bash
curl https://whatsapp-bot-apartemen.onrender.com/status
```

### Test Kirim Pesan:
```bash
curl -X POST https://whatsapp-bot-apartemen.onrender.com/send-group-message \
  -H "Content-Type: application/json" \
  -d '{"groupId":"120363421176803388@g.us","message":"Test dari Render!"}'
```

---

## 🔄 Monitoring

### Lihat Logs:
1. Render dashboard
2. Klik service bot
3. Tab "Logs"

### Restart Service:
1. Render dashboard
2. Klik service bot
3. Tab "Manual Deploy"
4. Klik "Clear build cache & deploy"

---

## 💰 Biaya

**GRATIS!** Render free tier:
- 750 jam/bulan (cukup untuk 24/7)
- Auto-sleep setelah 15 menit idle
- Tidak perlu kartu kredit

**Upgrade ($7/bulan):**
- No auto-sleep
- Lebih cepat
- Priority support

---

## 🆘 Troubleshooting

### Bot Sleep?
- Setup UptimeRobot untuk ping setiap 5 menit
- Atau upgrade ke paid plan

### QR Code Expired?
- Restart service
- Lihat logs untuk QR baru
- Scan ulang

### Build Failed?
- Cek Root Directory: `whatsapp-bot-apartemen`
- Cek Start Command: `node bot-wweb.js`

---

**Selamat! Bot WhatsApp Anda aktif di Render! 🎉**
