# 📱 Cara Ganti Grup WhatsApp Tujuan Bot

## 🎯 Langkah-Langkah Lengkap

### Step 1: Buat Grup WhatsApp Baru

1. Buka WhatsApp di HP (081522735657)
2. Tap **Menu** (3 titik) → **Grup baru**
3. Beri nama grup, contoh: **"Admin Apartemen Liaa"**
4. Tambahkan anggota admin lainnya
5. Tap **Centang hijau** untuk buat grup

### Step 2: Dapatkan ID Grup

**Pastikan bot sudah running!**

#### Cara A: Pakai Terminal

```bash
curl `http://localhost:3001/chats`
```

#### Cara B: Pakai Browser

Buka: `http://localhost:3001/chats`

**Hasilnya:**
```json
{
  "success": true,
  "groups": [
    {
      "id": "120363426371253627@g.us",
      "name": "bot test",
      "participants": 2
    },
    {
      "id": "120363406683817143@g.us",
      "name": "Admin Apartemen Liaa",
      "participants": 5
    }
  ]
}
```

**Copy ID grup yang baru Anda buat!**

Contoh: `120363406683817143@g.us`

### Step 3: Update Kode

Buka file: `src/services/whatsappService.js`

**Ganti baris ini:**

```javascript
// SEBELUM (grup lama)
const ADMIN_GROUP_ID = '120363426371253627@g.us'; // Grup "bot test"

// SESUDAH (grup baru Anda)
const ADMIN_GROUP_ID = '120363406683817143@g.us'; // Grup "Admin Apartemen Liaa"
```

**Save file!** (Ctrl+S atau Cmd+S)

### Step 4: Test Kirim ke Grup Baru

```bash
curl -X POST http://localhost:3001/send-group-message \
  -H "Content-Type: application/json" \
  -d '{"groupId":"120363406683817143@g.us","message":"✅ Test bot berhasil!\n\nBot sudah terhubung ke grup ini."}'
```

**Ganti `120363406683817143@g.us` dengan ID grup Anda!**

### Step 5: Cek WhatsApp

Buka grup WhatsApp yang baru → Anda akan melihat pesan dari bot!

---

## ✅ Selesai!

Bot sekarang akan kirim notifikasi ke grup baru Anda.

---

## 🔄 Cara Kerja Realtime

Bot sudah **terintegrasi otomatis** dengan Dashboard:

```
Dashboard → Monitoring setiap 60 detik → Cek checkout expired → Kirim ke grup
```

**Tidak perlu klik apa-apa!** Bot bekerja otomatis di background.

---

## 🧪 Test Manual (Opsional)

### Lihat Semua Grup:
```bash
curl http://localhost:3001/chats
```

### Kirim Test ke Grup:
```bash
curl -X POST http://localhost:3001/send-group-message \
  -H "Content-Type: application/json" \
  -d '{"groupId":"ID_GRUP_ANDA@g.us","message":"Test pesan"}'
```

### Cek Status Bot:
```bash
curl http://localhost:3001/status
```

---

## 💡 Tips

1. **Bot harus running** untuk bisa kirim pesan
2. **ID grup format:** `120363xxxxxxxxx@g.us` (harus ada `@g.us`)
3. **Grup harus ada** di WhatsApp yang tersambung dengan bot
4. **Test dulu** sebelum pakai production

---

## ❓ Troubleshooting

### Grup tidak muncul di list?
- Pastikan bot sudah scan QR code
- Pastikan grup sudah dibuat di WhatsApp
- Restart bot: Ctrl+C lalu `node bot-wweb.js`

### Pesan tidak terkirim?
- Cek ID grup sudah benar (ada `@g.us`)
- Cek bot status: `curl http://localhost:3001/status`
- Cek console browser (F12) untuk error

### ID grup salah?
- Jalankan `curl http://localhost:3001/chats` lagi
- Copy ID yang benar
- Update `whatsappService.js`
- Save dan refresh browser

---

**Selesai! Bot siap kirim ke grup baru Anda! 🎉**
