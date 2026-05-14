# 🚀 DEPLOY KE RENDER.COM - GRATIS SELAMANYA!

Railway cuma 17 hari lagi? Pakai **Render.com** aja - **GRATIS PERMANENT!**

---

## ✅ LANGKAH CEPAT (10 Menit):

### 1️⃣ Push ke GitHub Dulu

Kita sudah fix bot untuk production. Sekarang push:

```bash
git add .
git commit -m "Fix bot for production deployment"
git push origin main
```

---

### 2️⃣ Daftar Render

1. Buka: https://render.com
2. Klik **"Get Started"**
3. Pilih **"Sign up with GitHub"**
4. Authorize Render
5. ✅ Selesai!

---

### 3️⃣ Buat Web Service

1. Klik **"New +"** (pojok kanan atas)
2. Pilih **"Web Service"**
3. Klik **"Connect a repository"**
4. Jika belum ada repo:
   - Klik **"Configure account"**
   - Pilih **"Only select repositories"**
   - Centang: **Manajemen-Liaa**
   - Klik **"Install"**
5. Cari **Manajemen-Liaa**
6. Klik **"Connect"**

---

### 4️⃣ Isi Form Konfigurasi

Copy-paste ini:

| Field | Value |
|-------|-------|
| **Name** | `whatsapp-bot-apartemen` |
| **Region** | `Singapore` (atau terdekat) |
| **Branch** | `main` |
| **Root Directory** | `whatsapp-bot-apartemen` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node bot-wweb.js` |
| **Instance Type** | `Free` |

**PENTING:** Root Directory harus `whatsapp-bot-apartemen`

---

### 5️⃣ Deploy!

1. Scroll ke bawah
2. Klik **"Create Web Service"** (tombol biru besar)
3. Tunggu 3-5 menit (lihat progress di logs)
4. Status akan jadi **"Live"** (hijau)

---

### 6️⃣ Scan QR Code

1. Klik tab **"Logs"** (di atas)
2. Tunggu sampai muncul QR code (kotak-kotak ASCII)
3. **Scan dengan WhatsApp** di HP (081522735657)
4. Tunggu: `✅ WhatsApp Bot Connected!`

**QR code tidak muncul?**
- Tunggu 1-2 menit lagi
- Refresh halaman logs
- Pastikan status "Live"

---

### 7️⃣ Copy URL Bot

Render otomatis buat URL:
```
https://whatsapp-bot-apartemen.onrender.com
```

**Cara lihat URL:**
- Ada di bagian atas dashboard service
- Atau klik nama service, URL ada di atas

**SIMPAN URL INI!**

---

### 8️⃣ Update Vercel

1. Buka: https://vercel.com/dashboard
2. Klik project: **Manajemen-Liaa**
3. Klik **"Settings"**
4. Klik **"Environment Variables"**
5. Klik **"Add New"**
6. Isi:
   - **Name**: `VITE_WHATSAPP_BOT_URL`
   - **Value**: `https://whatsapp-bot-apartemen.onrender.com`
   - **Environment**: Centang **semua** (Production, Preview, Development)
7. Klik **"Save"**
8. Klik **"Deployments"** (tab atas)
9. Klik **titik tiga** (⋮) di deployment teratas
10. Klik **"Redeploy"**
11. ✅ Tunggu 2-3 menit

---

## 🎉 SELESAI!

Test sekarang:

1. Buka: https://manajemen-liaa.vercel.app
2. Buat booking baru (waktu 1 menit)
3. Tunggu 1 menit
4. Cek grup WhatsApp "Apartemen"
5. Harus ada notifikasi! 🎊

---

## ⚠️ PENTING: Auto-Sleep

Render free tier **sleep setelah 15 menit idle**.

**Solusi: Setup UptimeRobot (GRATIS)**

1. Daftar: https://uptimerobot.com
2. Klik **"Add New Monitor"**
3. Isi:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: WhatsApp Bot
   - **URL**: `https://whatsapp-bot-apartemen.onrender.com/status`
   - **Monitoring Interval**: 5 minutes
4. Klik **"Create Monitor"**
5. ✅ Bot tidak akan sleep lagi!

---

## 🆘 Troubleshooting

### Bot tidak connect?
```
Render → Service → Logs
Cari error, biasanya QR code expired
Restart: Manual Deploy → Clear build cache & deploy
```

### Notifikasi tidak masuk?
```
1. Test manual: curl https://whatsapp-bot-apartemen.onrender.com/status
2. Harus return: {"connected":true}
3. Jika false, scan QR ulang
```

### Build failed?
```
Pastikan:
- Root Directory: whatsapp-bot-apartemen
- Start Command: node bot-wweb.js
- Branch: main
```

---

## 💰 Biaya

**100% GRATIS SELAMANYA!**

Render free tier:
- ✅ 750 jam/bulan (cukup 24/7)
- ✅ Tidak perlu kartu kredit
- ✅ Tidak ada batas waktu (beda dengan Railway)
- ⚠️ Auto-sleep 15 menit (fix dengan UptimeRobot)

Upgrade $7/bulan (opsional):
- No auto-sleep
- Lebih cepat
- Priority support

---

**Selamat! Bot aktif 24/7 GRATIS! 🎉**

Butuh bantuan? Lihat **DEPLOY_RENDER.md** untuk detail lengkap.
