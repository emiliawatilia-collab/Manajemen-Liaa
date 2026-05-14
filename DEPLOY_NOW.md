# 🚀 DEPLOY SEKARANG - Langkah Cepat

Build Railway sudah berhasil! Sekarang tinggal 5 langkah lagi:

---

## ✅ LANGKAH 1: Set Root Directory

**PENTING! Harus dilakukan dulu:**

1. Buka Railway dashboard
2. Klik **service** yang baru dibuat
3. Klik tab **"Settings"**
4. Scroll ke bawah, cari **"Root Directory"**
5. Klik **dropdown**, pilih **`/whatsapp-bot-apartemen`**
6. Railway akan **otomatis redeploy** (tunggu 2-3 menit)

**Screenshot lokasi:**
```
Settings → Service Settings → Root Directory → /whatsapp-bot-apartemen
```

---

## ✅ LANGKAH 2: Lihat Logs & Scan QR Code

Setelah redeploy selesai:

1. Klik tab **"Deployments"**
2. Klik deployment **paling atas** (yang terbaru)
3. Klik **"View Logs"**
4. Tunggu 30-60 detik
5. Scroll ke bawah, cari **QR code** (kotak-kotak ASCII)
6. **Scan dengan WhatsApp** di HP (081522735657)
7. Tunggu sampai muncul: `✅ WhatsApp Bot Connected!`

**Jika QR code tidak muncul:**
- Tunggu 1-2 menit lagi
- Refresh halaman logs
- Pastikan deployment status "Success"

---

## ✅ LANGKAH 3: Generate Domain

1. Klik tab **"Settings"**
2. Scroll ke **"Networking"**
3. Klik **"Generate Domain"**
4. Copy URL (contoh: `whatsapp-bot-production-abc123.up.railway.app`)
5. **SIMPAN URL INI** untuk langkah berikutnya

---

## ✅ LANGKAH 4: Update Vercel

1. Buka https://vercel.com/dashboard
2. Klik project **Manajemen-Liaa**
3. Klik **"Settings"** (tab atas)
4. Klik **"Environment Variables"** (menu kiri)
5. Klik **"Add New"**
6. Isi:
   - **Name**: `VITE_WHATSAPP_BOT_URL`
   - **Value**: `https://whatsapp-bot-production-abc123.up.railway.app` (URL dari Langkah 3)
   - **Environment**: Centang **Production**, **Preview**, **Development** (semua)
7. Klik **"Save"**

---

## ✅ LANGKAH 5: Redeploy Vercel

1. Klik **"Deployments"** (tab atas)
2. Cari deployment **paling atas**
3. Klik **titik tiga** (⋮) di sebelah kanan
4. Klik **"Redeploy"**
5. Klik **"Redeploy"** lagi untuk konfirmasi
6. Tunggu 2-3 menit sampai selesai

---

## 🎉 SELESAI!

Cek apakah bot sudah aktif:

1. Buka aplikasi: https://manajemen-liaa.vercel.app
2. Buat booking baru dengan waktu 1 menit
3. Tunggu 1 menit
4. Cek grup WhatsApp "Apartemen"
5. Harus ada notifikasi otomatis!

---

## 🆘 Troubleshooting

### QR Code tidak muncul?
```
Railway → Deployments → Klik deployment → View Logs
Tunggu 1-2 menit, refresh jika perlu
```

### Bot disconnect?
```
Railway → Settings → Restart
Lihat logs untuk QR code baru, scan ulang
```

### Notifikasi tidak masuk?
```
1. Cek Railway logs: ada error?
2. Cek Vercel env variable: sudah benar?
3. Test manual: curl https://URL-RAILWAY/status
```

### Cara test manual:
```bash
curl https://whatsapp-bot-production-abc123.up.railway.app/status
```

Harus return: `{"status":"connected"}`

---

**Butuh bantuan? Lihat DEPLOY_RAILWAY.md untuk panduan lengkap.**
