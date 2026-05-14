# 💻 Jalankan Bot di Laptop/PC Sendiri (100% GRATIS)

## ✅ Keuntungan:
- **100% GRATIS** - Tidak ada biaya bulanan
- Full control
- Tidak ada batasan
- Tidak perlu deploy ke cloud

## ❌ Kekurangan:
- Laptop harus nyala 24/7
- Perlu internet stabil
- Konsumsi listrik

---

## 📋 Cara Setup (10 menit)

### Step 1: Install PM2

PM2 adalah process manager untuk Node.js yang akan menjaga bot tetap running.

**Buka Terminal/Command Prompt:**

```bash
npm install -g pm2
```

### Step 2: Jalankan Bot dengan PM2

```bash
cd whatsapp-bot-apartemen
pm2 start bot-wweb.js --name whatsapp-bot
```

### Step 3: Scan QR Code

```bash
pm2 logs whatsapp-bot
```

Scan QR code yang muncul dengan WhatsApp (081522735657)

### Step 4: Save PM2 Config

```bash
pm2 save
```

### Step 5: Auto-Start on Reboot

**Mac/Linux:**
```bash
pm2 startup
```

**Windows:**
```bash
pm2-startup install
pm2 save
```

---

## 🔧 Perintah PM2 Berguna

### Lihat Status:
```bash
pm2 status
```

### Lihat Logs:
```bash
pm2 logs whatsapp-bot
```

### Restart Bot:
```bash
pm2 restart whatsapp-bot
```

### Stop Bot:
```bash
pm2 stop whatsapp-bot
```

### Hapus Bot:
```bash
pm2 delete whatsapp-bot
```

---

## 🌐 Akses dari Luar (Opsional)

Jika ingin Vercel bisa akses bot di laptop:

### Option 1: Ngrok (Paling Mudah)

1. **Install Ngrok:**
   - Download: https://ngrok.com/download
   - Extract dan install

2. **Jalankan Ngrok:**
   ```bash
   ngrok http 3001
   ```

3. **Copy URL:**
   ```
   https://abc123.ngrok.io
   ```

4. **Update Vercel:**
   - Environment Variable: `VITE_WHATSAPP_BOT_URL`
   - Value: `https://abc123.ngrok.io`

**Catatan:** Ngrok free tier, URL berubah setiap restart.

### Option 2: Cloudflare Tunnel (Permanent URL)

1. **Install Cloudflared:**
   ```bash
   # Mac
   brew install cloudflare/cloudflare/cloudflared
   
   # Windows
   # Download dari: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **Login:**
   ```bash
   cloudflared tunnel login
   ```

3. **Buat Tunnel:**
   ```bash
   cloudflared tunnel create whatsapp-bot
   ```

4. **Jalankan Tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```

5. **Dapatkan URL permanent**

---

## 💡 Tips Hemat Listrik

### 1. Gunakan Laptop Lama
- Laptop lama yang tidak terpakai
- Konsumsi listrik lebih rendah

### 2. Optimasi Power
- Matikan layar
- Brightness minimum
- Tutup aplikasi lain

### 3. Estimasi Biaya Listrik

Laptop 50W x 24 jam x 30 hari = 36 kWh/bulan

Jika tarif Rp 1.500/kWh:
36 x 1.500 = **Rp 54.000/bulan**

Masih lebih murah dari VPS! 😊

---

## 🔒 Keamanan

### 1. Firewall
Pastikan port 3001 tidak terbuka ke public jika tidak perlu.

### 2. Backup Session
Backup folder `.wwebjs_auth/` secara berkala:
```bash
cp -r .wwebjs_auth/ backup-session/
```

### 3. Update Berkala
```bash
cd whatsapp-bot-apartemen
npm update
pm2 restart whatsapp-bot
```

---

## 🆘 Troubleshooting

### Bot Mati Setelah Restart Laptop?
```bash
pm2 startup
pm2 save
```

### Laptop Sleep, Bot Mati?
- Disable sleep mode
- Atau gunakan "prevent sleep" app

### Internet Putus?
- PM2 akan auto-restart bot
- Bot akan reconnect otomatis

---

## 📊 Monitoring

### Dashboard PM2:
```bash
pm2 monit
```

### Web Dashboard (Opsional):
```bash
pm2 install pm2-server-monit
```

Buka: http://localhost:9615

---

## 💰 Perbandingan Biaya

| Solusi | Biaya/Bulan | Kelebihan |
|--------|-------------|-----------|
| **Laptop Sendiri** | Rp 50k (listrik) | Full control, gratis |
| **Render.com** | Gratis | No maintenance, auto-sleep |
| **Railway** | Gratis/$5 | No sleep, mudah |
| **VPS** | Rp 80-100k | Professional, 24/7 |

---

**Pilih yang sesuai kebutuhan Anda! 🚀**
