# 🤖 Panduan WhatsApp Bot - Notifikasi Checkout Otomatis

Bot WhatsApp ini akan **otomatis mengirim notifikasi ke grup admin** saat waktu checkout unit habis.

## ✅ Status: BERHASIL DIIMPLEMENTASI

Bot menggunakan **whatsapp-web.js** (100% GRATIS) dan sudah berhasil test:
- ✅ Kirim ke nomor pribadi (081522735657)
- ✅ Kirim ke grup "bot test" (120363426371253627@g.us)

---

## 📋 Cara Menjalankan Bot

### 1. Buka Terminal Baru

```bash
cd whatsapp-bot-apartemen
node bot-wweb.js
```

### 2. Scan QR Code

- QR Code akan muncul di terminal
- Buka WhatsApp di HP (081522735657)
- Tap menu (3 titik) → **Perangkat Tertaut**
- Tap **Tautkan Perangkat**
- Scan QR Code

### 3. Tunggu Sampai Connected

Anda akan melihat pesan:
```
✅ WhatsApp Bot Connected!
✅ Bot is ready to send messages!
```

### 4. Jalankan Aplikasi React

Di terminal lain:
```bash
npm run dev
```

---

## 🔄 Cara Kerja Otomatis

1. **Aplikasi React** akan cek status bot setiap kali Dashboard dibuka
2. **Monitoring berjalan otomatis** setiap 60 detik
3. **Saat checkout habis**, bot otomatis kirim pesan ke grup admin:

```
🔔 REMINDER CHECKOUT

Unit: 717
Penyewa: Rita
Nomor HP: +62 877-7190-7999
Check-out: 13 Mei 2026 12:00

⚠️ Waktu checkout sudah habis!
Mohon konfirmasi:
✅ Checkout di aplikasi
✅ Atau hubungi tamu untuk perpanjang
```

4. **Notifikasi hanya dikirim 1x** per booking (tidak spam)
5. **Saat checkout di aplikasi**, flag notifikasi otomatis dibersihkan

---

## ⚙️ Konfigurasi

File: `src/services/whatsappService.js`

```javascript
const WHATSAPP_BOT_URL = 'http://localhost:3001';
const ADMIN_GROUP_ID = '120363426371253627@g.us'; // Grup "bot test"
```

### Ganti Grup Admin:

1. Buat grup WhatsApp baru untuk admin
2. Dapatkan Group ID dengan API:
   ```bash
   curl http://localhost:3001/chats
   ```
3. Copy ID grup (format: `120363xxxxxxxxx@g.us`)
4. Update `ADMIN_GROUP_ID` di `whatsappService.js`

---

## 🧪 Testing Manual

### Test Kirim ke Nomor:
```bash
curl -X POST http://localhost:3001/send-message \
  -H "Content-Type: application/json" \
  -d '{"phone":"081522735657","message":"Test pesan"}'
```

### Test Kirim ke Grup:
```bash
curl -X POST http://localhost:3001/send-group-message \
  -H "Content-Type: application/json" \
  -d '{"groupId":"120363426371253627@g.us","message":"Test pesan grup"}'
```

### Cek Status Bot:
```bash
curl http://localhost:3001/status
```

### Lihat Daftar Grup:
```bash
curl http://localhost:3001/chats
```

---

## 🚀 Deploy ke Production (VPS)

### Option 1: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bot dengan PM2
cd whatsapp-bot-apartemen
pm2 start bot-wweb.js --name whatsapp-bot

# Auto-start on reboot
pm2 startup
pm2 save

# Monitor
pm2 logs whatsapp-bot
pm2 status
```

### Option 2: Screen (Linux)

```bash
# Install screen
sudo apt install screen

# Create new screen session
screen -S whatsapp-bot

# Run bot
cd whatsapp-bot-apartemen
node bot-wweb.js

# Detach: Ctrl+A, then D
# Reattach: screen -r whatsapp-bot
```

### Option 3: Systemd Service (Linux)

Buat file `/etc/systemd/system/whatsapp-bot.service`:

```ini
[Unit]
Description=WhatsApp Bot for Apartemen Management
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/Manajemen-ApartmeenLia/whatsapp-bot-apartemen
ExecStart=/usr/bin/node bot-wweb.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Jalankan:
```bash
sudo systemctl enable whatsapp-bot
sudo systemctl start whatsapp-bot
sudo systemctl status whatsapp-bot
```

---

## 📱 Update URL untuk Production

Saat deploy ke VPS, update URL di `src/services/whatsappService.js`:

```javascript
// Development
const WHATSAPP_BOT_URL = 'http://localhost:3001';

// Production (ganti dengan IP/domain VPS Anda)
const WHATSAPP_BOT_URL = 'http://your-vps-ip:3001';
// atau
const WHATSAPP_BOT_URL = 'https://bot.yourdomain.com';
```

**PENTING:** Jika menggunakan domain, setup reverse proxy (Nginx/Apache) untuk HTTPS.

---

## 🔒 Keamanan

1. **Jangan expose port 3001 ke public** jika tidak perlu
2. **Gunakan firewall** untuk restrict akses
3. **Backup auth session** di folder `whatsapp-bot-apartemen/.wwebjs_auth/`
4. **Jangan commit** folder `.wwebjs_auth/` ke Git (sudah ada di .gitignore)

---

## ❓ Troubleshooting

### Bot tidak connect?
- Pastikan WhatsApp di HP aktif dan terkoneksi internet
- Hapus folder `.wwebjs_auth/` dan scan ulang QR code
- Restart bot: `Ctrl+C` lalu `node bot-wweb.js`

### Notifikasi tidak terkirim?
- Cek bot status: `curl http://localhost:3001/status`
- Cek console browser (F12) untuk error
- Pastikan bot running di background

### QR Code tidak muncul?
- Pastikan tidak ada proses lain di port 3001
- Kill proses: `lsof -ti:3001 | xargs kill -9`
- Jalankan ulang bot

### Pesan "Bot belum siap"?
- Tunggu 5-10 detik setelah scan QR code
- Bot perlu waktu untuk initialize session

---

## 📊 Monitoring

### Cek Log Bot:
```bash
# Jika pakai PM2
pm2 logs whatsapp-bot

# Jika pakai screen
screen -r whatsapp-bot

# Jika pakai systemd
sudo journalctl -u whatsapp-bot -f
```

### Cek Aplikasi React:
Buka browser console (F12) untuk melihat log:
- `✅ WhatsApp Bot terhubung`
- `⏰ Unit XXX checkout expired, mengirim notifikasi...`
- `✅ Notifikasi terkirim untuk unit XXX`

---

## 💰 Biaya

**100% GRATIS!** 🎉

- whatsapp-web.js: Open source, gratis selamanya
- Tidak ada batasan jumlah pesan
- Tidak perlu API key atau subscription

---

## 📞 Support

Jika ada masalah:
1. Cek log bot dan aplikasi
2. Test manual dengan curl
3. Restart bot dan aplikasi
4. Scan ulang QR code jika perlu

---

**Selamat! Bot WhatsApp Anda sudah siap! 🚀**
