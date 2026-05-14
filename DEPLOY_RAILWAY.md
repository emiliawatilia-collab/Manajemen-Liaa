# 🚀 Deploy WhatsApp Bot ke Railway.app

## ✅ Keuntungan Railway:
- **100% GRATIS** ($5 credit/bulan)
- Deploy langsung dari GitHub
- Scan QR code via logs
- Auto-restart jika crash
- Setup 10 menit

---

## 📋 Langkah-Langkah Deploy:

### Step 1: Daftar Railway

1. Buka https://railway.app
2. Klik **"Start a New Project"**
3. Login dengan **GitHub**
4. Authorize Railway

### Step 2: Deploy dari GitHub

1. Klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: **Manajemen-Liaa**
4. Railway akan detect project

### Step 3: ⚠️ PENTING - Set Root Directory

**Build sudah jalan tapi belum benar!** Harus set root directory dulu:

1. Di Railway dashboard, klik **service** yang baru dibuat
2. Klik tab **"Settings"**
3. Scroll ke bawah, cari **"Root Directory"**
4. Klik dropdown, pilih **`/whatsapp-bot-apartemen`**
5. Railway akan **otomatis redeploy** (tunggu 2-3 menit)
6. ✅ Sekarang bot akan jalan dari folder yang benar!

### Step 4: Lihat Logs & Scan QR Code

Setelah redeploy selesai (Step 3):

1. Klik service bot di Railway
2. Klik tab **"Deployments"**
3. Klik deployment yang **paling atas** (terbaru)
4. Klik tab **"View Logs"**
5. Tunggu 30-60 detik, scroll ke bawah
6. Cari **QR code ASCII** (kotak-kotak hitam putih)
7. **Scan dengan WhatsApp** di HP (081522735657)
8. Tunggu sampai muncul: `✅ WhatsApp Bot Connected!`

### Step 5: Generate Domain (URL Bot)

1. Klik tab **"Settings"**
2. Scroll ke **"Networking"**
3. Klik **"Generate Domain"**
4. Copy URL (contoh: `whatsapp-bot-production.up.railway.app`)
5. ✅ Simpan URL ini untuk Step 6

### Step 6: Update Vercel (React App)

Di **Vercel Dashboard**:

1. Buka project **Manajemen-Liaa** di Vercel
2. Klik **"Settings"**
3. Klik **"Environment Variables"**
4. Klik **"Add New"**
5. Isi:
   - **Key**: `VITE_WHATSAPP_BOT_URL`
   - **Value**: `https://whatsapp-bot-production.up.railway.app` (URL dari Step 5)
   - **Environment**: Pilih **Production**, **Preview**, **Development** (centang semua)
6. Klik **"Save"**
7. Klik **"Deployments"** (tab atas)
8. Klik **titik tiga** di deployment teratas
9. Klik **"Redeploy"**
10. ✅ Tunggu redeploy selesai (2-3 menit)

---

## 🎉 Selesai!

Bot WhatsApp sekarang aktif 24/7 dan terhubung dengan aplikasi React!

---

## 🔍 Monitoring

### Cek Status Bot:
```bash
curl https://whatsapp-bot-production.up.railway.app/status
```

### Lihat Logs:
1. Railway dashboard
2. Tab "Deployments"
3. Klik deployment
4. Tab "Logs"

### Test Kirim Pesan:
```bash
curl -X POST https://whatsapp-bot-production.up.railway.app/send-group-message \
  -H "Content-Type: application/json" \
  -d '{"groupId":"120363421176803388@g.us","message":"Test dari Railway!"}'
```

---

## ⚠️ Penting!

### 1. QR Code Expired?
Jika QR code expired atau bot disconnect:
1. Railway dashboard → Service
2. Tab "Settings"
3. Klik **"Restart"**
4. Lihat logs untuk QR code baru
5. Scan ulang

### 2. Session Persistence
Railway akan simpan session di volume. Bot tidak perlu scan ulang setiap restart.

### 3. Free Tier Limits
- $5 credit/bulan
- Cukup untuk bot kecil (24/7)
- Monitor usage di dashboard

### 4. Auto-Sleep?
Railway **TIDAK** auto-sleep seperti Heroku. Bot jalan 24/7.

---

## 🆘 Troubleshooting

### Bot tidak connect?
```bash
# Cek logs
railway logs --service whatsapp-bot

# Restart service
railway restart --service whatsapp-bot
```

### QR code tidak muncul?
- Tunggu 30-60 detik setelah deploy
- Refresh logs
- Pastikan WhatsApp di HP aktif

### Error "No such file or directory"?
- Pastikan Root Directory: `whatsapp-bot-apartemen`
- Cek package.json ada di folder tersebut

### Port already in use?
- Railway otomatis assign port
- Tidak perlu khawatir port conflict

---

## 💰 Biaya

**GRATIS!** Railway memberikan:
- $5 credit/bulan
- Cukup untuk bot WhatsApp 24/7
- Tidak perlu kartu kredit untuk trial

Jika habis:
- Upgrade ke $5/bulan (unlimited)
- Atau pakai VPS (Rp 80k-100k/bulan)

---

## 🎯 Setelah Deploy

1. ✅ Bot running 24/7 di Railway
2. ✅ React app di Vercel connect ke bot
3. ✅ Notifikasi WhatsApp otomatis berfungsi
4. ✅ Monitoring via Railway dashboard

---

## 📱 Alternative: Deploy ke VPS

Jika tidak mau pakai Railway, bisa pakai VPS:
- Niagahoster VPS: Rp 100k/bulan
- Contabo: €4.99/bulan (~Rp 85k)
- DigitalOcean: $6/bulan (~Rp 95k)

Lihat **WHATSAPP_BOT_GUIDE.md** untuk panduan VPS.

---

**Selamat! Bot WhatsApp Anda sekarang aktif 24/7! 🎉**

Support: https://railway.app/help
