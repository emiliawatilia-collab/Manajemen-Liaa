# WhatsApp Bot - Apartemen Management

Bot WhatsApp untuk mengirim notifikasi checkout otomatis ke admin apartemen.

## 🚀 Cara Menjalankan Bot

### 1. Install Dependencies
```bash
cd whatsapp-bot-apartemen
npm install
```

### 2. Jalankan Bot
```bash
npm start
```

### 3. Scan QR Code
- QR Code akan muncul di terminal
- Buka WhatsApp di HP (nomor: **081522735657**)
- Klik titik 3 → **Linked Devices** → **Link a Device**
- Scan QR Code yang muncul di terminal

### 4. Bot Siap Digunakan!
Setelah scan, bot akan terhubung dan siap menerima request.

---

## 📡 API Endpoints

### 1. Kirim Pesan ke Nomor HP
```bash
POST http://localhost:3001/send-message
Content-Type: application/json

{
  "phone": "081234567890",
  "message": "Halo, ini pesan dari bot!"
}
```

### 2. Kirim Pesan ke Grup
```bash
POST http://localhost:3001/send-group-message
Content-Type: application/json

{
  "groupId": "120363XXXXXX@g.us",
  "message": "🔔 REMINDER CHECKOUT\n\nUnit: 1010\nPenyewa: Rita\nWaktu Checkout: 13 Mei 2026 12:00\n\n⚠️ Waktu checkout sudah habis!"
}
```

### 3. Lihat Daftar Grup
```bash
GET http://localhost:3001/groups
```

Response:
```json
{
  "success": true,
  "groups": [
    {
      "id": "120363XXXXXX@g.us",
      "name": "Admin Apartemen",
      "participants": 5
    }
  ]
}
```

### 4. Cek Status Koneksi
```bash
GET http://localhost:3001/status
```

---

## 🔧 Integrasi dengan Aplikasi Web

Setelah bot berjalan, tambahkan kode ini di aplikasi web untuk kirim notifikasi:

```javascript
// Kirim notifikasi checkout ke grup admin
async function sendCheckoutReminder(unit) {
  const message = `🔔 REMINDER CHECKOUT

Unit: ${unit.unitNumber}
Penyewa: ${unit.tenant.name || 'Tamu'}
Nomor HP: ${unit.tenant.phone || '-'}
Waktu Checkout: ${new Date(unit.tenant.checkOut).toLocaleString('id-ID')}

⚠️ Waktu checkout sudah habis!
Mohon konfirmasi:
✅ Checkout di aplikasi
✅ Atau hubungi tamu untuk perpanjang

Link App: https://manajemen-liaa.vercel.app`;

  try {
    const response = await fetch('http://localhost:3001/send-group-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: 'GRUP_ID_ANDA@g.us', // Ganti dengan ID grup admin
        message: message
      })
    });
    
    const result = await response.json();
    console.log('Notifikasi terkirim:', result);
  } catch (error) {
    console.error('Gagal kirim notifikasi:', error);
  }
}
```

---

## 📝 Cara Mendapatkan Group ID

1. Jalankan bot: `npm start`
2. Scan QR Code dengan WA nomor **081522735657**
3. Buka browser: http://localhost:3001/groups
4. Copy **id** grup yang muncul (contoh: `120363XXXXXX@g.us`)
5. Gunakan ID tersebut di aplikasi web

---

## 🌐 Deploy ke Server (Opsional)

### Deploy ke Railway.app (Gratis)
1. Push folder `whatsapp-bot-apartemen` ke GitHub
2. Daftar di https://railway.app
3. Connect GitHub repository
4. Deploy otomatis
5. Scan QR Code dari logs Railway

### Deploy ke VPS
```bash
# Install PM2
npm install -g pm2

# Jalankan bot dengan PM2
pm2 start index.js --name whatsapp-bot

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## ⚠️ Catatan Penting

- Bot harus **selalu running** untuk bisa kirim pesan
- Jika bot mati, harus scan QR lagi
- Nomor WA yang dipakai: **081522735657**
- Jangan logout dari WhatsApp Web/Linked Devices

---

## 🐛 Troubleshooting

**Bot disconnect terus?**
- Pastikan koneksi internet stabil
- Jangan logout dari Linked Devices di WA
- Restart bot: `npm start`

**Pesan tidak terkirim?**
- Cek status: http://localhost:3001/status
- Pastikan `connected: true`
- Cek Group ID sudah benar

**QR Code tidak muncul?**
- Hapus folder `auth_info_baileys`
- Jalankan ulang: `npm start`
