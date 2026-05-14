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

### Step 3: Konfigurasi Service

1. Railway akan detect multiple services
2. Pilih **"whatsapp-bot-apartemen"** folder
3. Atau klik **"Add Service"** → **"GitHub Repo"**
4. Set **Root Directory**: `whatsapp-bot-apartemen`

### Step 4: Set Environment Variables (Opsional)

Di Railway dashboard:
1. Klik service bot
2. Tab **"Variables"**
3. Tambahkan (jika perlu):
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (otomatis dari Railway)

### Step 5: Deploy!

1. Railway otomatis build dan deploy
2. Tunggu 2-3 menit
3. Status akan berubah **"Active"**

### Step 6: Scan QR Code

1. Klik service bot di Railway
2. Tab **"Deployments"** → Klik deployment terbaru
3. Tab **"Logs"**
4. Scroll ke bawah, cari QR code ASCII
5. **Scan dengan WhatsApp** (081522735657)
6. Tunggu sampai muncul: `✅ WhatsApp Bot Connected!`

### Step 7: Dapatkan URL Bot

1. Tab **"Settings"**
2. Scroll ke **"Networking"**
3. Klik **"Generate Domain"**
4. Copy URL (contoh: `whatsapp-bot-production.up.railway.app`)

### Step 8: Update React App

Edit `src/services/whatsappService.js`:

```javascript
const WHATSAPP_BOT_URL = import.meta.env.VITE_WHATSAPP_BOT_URL || 'http://localhost:3001';
```

Lalu di **Vercel**, tambahkan environment variable:
1. Buka project di Vercel
2. Settings → Environment Variables
3. Tambahkan:
   - **Key**: `VITE_WHATSAPP_BOT_URL`
   - **Value**: `https://whatsapp-bot-production.up.railway.app`
4. Redeploy Vercel

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
