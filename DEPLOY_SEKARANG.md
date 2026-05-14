# 🚀 DEPLOY BOT KE RENDER - LANGKAH CEPAT

Code sudah di-push ke GitHub! Sekarang deploy bot WhatsApp:

---

## 📝 LANGKAH DEPLOY (10 MENIT):

### 1️⃣ Daftar Render.com

1. Buka: **https://render.com**
2. Klik **"Get Started"**
3. Pilih **"Sign up with GitHub"**
4. Authorize Render
5. ✅ Selesai!

---

### 2️⃣ Buat Web Service

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

### 3️⃣ Isi Form (COPY-PASTE INI):

| Field | Value |
|-------|-------|
| **Name** | `whatsapp-bot-apartemen` |
| **Region** | `Singapore` |
| **Branch** | `main` |
| **Root Directory** | `whatsapp-bot-apartemen` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node bot-wweb.js` |
| **Instance Type** | `Free` |

**PENTING:** Root Directory harus `whatsapp-bot-apartemen`

---

### 4️⃣ Deploy!

1. Scroll ke bawah
2. Klik **"Create Web Service"** (tombol biru)
3. Tunggu 3-5 menit (lihat progress di logs)
4. Status akan jadi **"Live"** (hijau)

---

### 5️⃣ Scan QR Code

1. Klik tab **"Logs"**
2. Tunggu QR code muncul (kotak-kotak ASCII)
3. **Scan dengan WhatsApp** di HP (081522735657)
4. Tunggu: `✅ WhatsApp Bot Connected!`

**QR tidak muncul?**
- Tunggu 1-2 menit lagi
- Refresh halaman logs

---

### 6️⃣ Copy URL Bot

URL otomatis dibuat:
```
https://whatsapp-bot-apartemen.onrender.com
```

**Cara lihat:**
- Ada di bagian atas dashboard service
- Atau klik nama service

**SIMPAN URL INI!**

---

### 7️⃣ Update Vercel

1. Buka: **https://vercel.com/dashboard**
2. Klik project: **Manajemen-Liaa**
3. Klik **"Settings"**
4. Klik **"Environment Variables"**
5. Klik **"Add New"**
6. Isi:
   - **Name**: `VITE_WHATSAPP_BOT_URL`
   - **Value**: `https://whatsapp-bot-apartemen.onrender.com`
   - **Environment**: Centang **semua**
7. Klik **"Save"**

---

### 8️⃣ Redeploy Vercel

1. Klik **"Deployments"** (tab atas)
2. Klik **titik tiga** (⋮) di deployment teratas
3. Klik **"Redeploy"**
4. Tunggu 2-3 menit
5. ✅ Selesai!

---

## 🧪 TEST BOT

1. Buka: **https://manajemen-liaa.vercel.app**
2. Buat booking baru (waktu 1 menit)
3. Tunggu 1 menit
4. Cek grup WhatsApp "Apartemen"
5. Harus ada notifikasi! 🎉

---

## ⚠️ PENTING: Setup UptimeRobot

Render free tier sleep setelah 15 menit idle.

**Solusi (GRATIS):**

1. Daftar: **https://uptimerobot.com**
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

### Build Failed?
```
Pastikan:
- Root Directory: whatsapp-bot-apartemen
- Start Command: node bot-wweb.js
- Branch: main
```

### QR Code Expired?
```
Render → Service → Settings → Restart
Lihat logs untuk QR baru, scan ulang
```

### Notifikasi Tidak Masuk?
```
1. Test manual: curl https://whatsapp-bot-apartemen.onrender.com/status
2. Harus return: {"connected":true}
3. Jika false, scan QR ulang
```

---

## 💰 Biaya

**100% GRATIS SELAMANYA!**

- ✅ 750 jam/bulan (cukup 24/7)
- ✅ Tidak perlu kartu kredit
- ✅ Tidak ada batas waktu
- ⚠️ Auto-sleep 15 menit (fix dengan UptimeRobot)

---

**Selamat! Bot aktif 24/7! 🎉**

Butuh bantuan? Lihat **DEPLOY_RENDER.md** untuk detail lengkap.
