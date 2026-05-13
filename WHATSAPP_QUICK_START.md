# 🚀 Quick Start - WhatsApp Bot

## ✅ Bot Sudah Tersambung!

Bot WhatsApp sudah berhasil ditest dan berfungsi dengan baik.

---

## 🎯 Cara Pakai (2 Langkah)

### 1️⃣ Jalankan Bot WhatsApp

Buka terminal baru:

```bash
cd whatsapp-bot-apartemen
node bot-wweb.js
```

**Pertama kali:** Scan QR code dengan WhatsApp (081522735657)

**Selanjutnya:** Bot otomatis connect tanpa scan ulang

Tunggu sampai muncul:
```
✅ WhatsApp Bot Connected!
✅ Bot is ready to send messages!
```

### 2️⃣ Jalankan Aplikasi

Terminal lain:

```bash
npm run dev
```

Buka http://localhost:5173

---

## 🤖 Cara Kerja Otomatis

1. **Buka Dashboard** → Bot otomatis cek status
2. **Setiap 60 detik** → Bot cek unit yang checkout expired
3. **Saat expired** → Bot kirim notifikasi ke grup "bot test"
4. **Notifikasi hanya 1x** per booking (tidak spam)

---

## 📱 Notifikasi Dikirim Ke:

**Grup WhatsApp:** bot test (120363426371253627@g.us)

### Ganti Grup Admin:

Edit file `src/services/whatsappService.js`:

```javascript
const ADMIN_GROUP_ID = '120363426371253627@g.us'; // Ganti dengan ID grup Anda
```

Cara dapat ID grup:
```bash
curl http://localhost:3001/chats
```

---

## ✅ Test Berhasil:

- ✅ Kirim ke nomor pribadi (081522735657)
- ✅ Kirim ke grup "bot test"
- ✅ Bot connected dan ready
- ✅ Monitoring otomatis berjalan

---

## 🔧 Troubleshooting

### Bot tidak connect?
```bash
# Kill proses di port 3001
lsof -ti:3001 | xargs kill -9

# Jalankan ulang
cd whatsapp-bot-apartemen
node bot-wweb.js
```

### Notifikasi tidak terkirim?
- Cek console browser (F12)
- Pastikan bot running
- Cek status: `curl http://localhost:3001/status`

---

## 📖 Dokumentasi Lengkap

Lihat **WHATSAPP_BOT_GUIDE.md** untuk:
- Deploy ke production (VPS)
- Setup PM2/systemd
- Konfigurasi advanced
- Testing manual

---

**Bot siap digunakan! 🎉**

Cek WhatsApp grup "bot test" untuk melihat notifikasi otomatis saat ada unit yang checkout expired.
