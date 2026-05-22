# 🧪 Testing Guide - Push Notification

## 📋 Persiapan Testing

### 1. Generate VAPID Key (WAJIB!)
```
1. Buka: https://console.firebase.google.com
2. Pilih project: manajemen-apartemen-bylia
3. Klik ⚙️ Settings → Project Settings
4. Tab "Cloud Messaging"
5. Scroll ke "Web Push certificates"
6. Klik "Generate key pair"
7. Copy VAPID key (format: BHxxx...)
```

### 2. Update VAPID Key
Edit file: `src/services/notificationService.js`

Cari baris:
```javascript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

Ganti dengan:
```javascript
const VAPID_KEY = 'BHxxx...'; // Paste VAPID key dari Firebase
```

### 3. Jalankan Development Server
```bash
npm run dev
```

---

## 🧪 Test 1: Request Notification Permission

### Langkah:
1. Buka browser (Chrome/Firefox/Edge)
2. Buka aplikasi: http://localhost:5173
3. Login sebagai **admin**:
   - Username: `lia210880`
   - Password: `lia210880`

### Expected Result:
✅ Browser akan muncul popup: "Allow notifications?"
✅ Klik **Allow**
✅ Console log:
```
✅ Notification permission granted
✅ FCM Token: BHxxx...
✅ FCM token saved to Firebase
```

### Cek di Firebase:
```
Firebase Console → Realtime Database
→ users → lia210880_bylia_com → fcmTokens
```

Harus ada token tersimpan!

### ❌ Troubleshooting:
- Jika tidak muncul popup → Cek VAPID key sudah benar
- Jika error di console → Cek Firebase config
- Jika token tidak tersimpan → Cek internet connection

---

## 🧪 Test 2: Attendance Notification (Check-in)

### Langkah:
1. **Logout** dari admin
2. Login sebagai **pegawai**:
   - Username: `ameliaagustina@bylia.com`
   - Password: `amel123`
3. Klik menu **Absensi** (bottom nav)
4. Klik tombol **"Absen Masuk"**

### Expected Result:
✅ Pegawai berhasil check-in
✅ Console log (di tab pegawai):
```
✅ Attendance notification queued
```

### Cek Notifikasi di Admin:
1. Buka tab baru
2. Login sebagai admin (lia210880)
3. Buka Dashboard

**CATATAN:** Notifikasi akan muncul jika:
- Admin sudah allow notification
- Cloud Function sudah setup (optional)
- Atau cek di Firebase Database:

```
Firebase Console → Realtime Database → notifications
```

Harus ada entry baru:
```json
{
  "type": "attendance",
  "message": {
    "title": "✅ Absensi Pegawai",
    "body": "Amelia Agustina berhasil check-in - 09:15"
  },
  "status": "pending"
}
```

---

## 🧪 Test 3: Attendance Notification (Check-out)

### Langkah:
1. Masih login sebagai pegawai (Amelia)
2. Di halaman Absensi
3. Klik tombol **"Absen Pulang"**
4. Konfirmasi "Ya, Absen Pulang"

### Expected Result:
✅ Pegawai berhasil check-out
✅ Console log:
```
✅ Attendance notification queued
```

### Cek di Firebase:
```
Database → notifications
```

Harus ada entry baru:
```json
{
  "type": "attendance",
  "message": {
    "title": "👋 Absensi Pegawai",
    "body": "Amelia Agustina berhasil check-out - 17:30"
  }
}
```

---

## 🧪 Test 4: Checkout Expired Notification

### Persiapan:
Buat unit dengan checkout yang sudah expired (checkout kemarin atau hari ini jam yang sudah lewat)

### Langkah:
1. Login sebagai **admin**
2. Buka menu **Units**
3. Klik **"+ Booking Baru"**
4. Isi form:
   - Unit: Pilih unit kosong
   - Nama: Test User
   - Phone: 081234567890
   - Check-in: Kemarin
   - Check-out: **Kemarin** (atau hari ini jam yang sudah lewat)
   - Jam Check-out: 12:00
   - Harga: 350000
5. Submit

### Test Monitoring:
1. Buka **Dashboard**
2. Tunggu atau refresh halaman
3. Cek Console log:

### Expected Result:
✅ Console log:
```
Unit 1088 checkout expired, mengirim notifikasi...
Notifikasi terkirim untuk unit 1088
```

### Cek di Firebase:
```
Database → notifications
```

Harus ada entry:
```json
{
  "type": "checkout_expired",
  "message": {
    "title": "⚠️ Checkout Expired",
    "body": "Unit 1088 - Test User (081234567890) checkout sudah lewat!"
  }
}
```

### Auto-Check (Setiap 1 Jam):
Dashboard akan otomatis cek setiap 1 jam. Untuk test manual:
1. Refresh halaman Dashboard
2. Monitoring akan jalan lagi

---

## 🧪 Test 5: Foreground Notification (Manual)

Jika sudah setup Cloud Function, test notifikasi langsung:

### Langkah:
1. Login sebagai admin
2. Buka Console browser (F12)
3. Paste code ini:

```javascript
// Test manual notification
if (Notification.permission === 'granted') {
  new Notification('🧪 Test Notification', {
    body: 'Ini adalah test notifikasi manual',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    requireInteraction: true
  });
}
```

### Expected Result:
✅ Notifikasi muncul di browser!

---

## 📊 Monitoring & Debug

### 1. Cek FCM Token
```javascript
// Di browser console (saat login admin)
localStorage.getItem('user')
```

### 2. Cek Notification Permission
```javascript
// Di browser console
console.log('Permission:', Notification.permission);
// Expected: "granted"
```

### 3. Cek Service Worker
```javascript
// Di browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### 4. Cek Firebase Database
```
Firebase Console → Realtime Database
```

Struktur yang harus ada:
```
├── users/
│   └── lia210880_bylia_com/
│       └── fcmTokens/
│           └── {tokenId}/
│               ├── token: "BHxxx..."
│               ├── deviceName: "Chrome"
│               └── createdAt: "2025-01-..."
│
└── notifications/
    └── {timestamp}/
        ├── type: "attendance" | "checkout_expired"
        ├── message: {...}
        ├── tokens: [...]
        └── status: "pending"
```

---

## ✅ Checklist Testing

### Setup:
- [ ] VAPID key sudah di-generate
- [ ] VAPID key sudah di-update di code
- [ ] Dev server running
- [ ] Browser support notification (Chrome/Firefox/Edge)

### Test Admin:
- [ ] Login admin berhasil
- [ ] Popup notification permission muncul
- [ ] Allow notification
- [ ] FCM token tersimpan di Firebase
- [ ] Console log tidak ada error

### Test Attendance:
- [ ] Pegawai check-in berhasil
- [ ] Notification queued di Firebase
- [ ] Pegawai check-out berhasil
- [ ] Notification queued di Firebase

### Test Checkout Expired:
- [ ] Buat booking dengan checkout expired
- [ ] Dashboard detect expired unit
- [ ] Notification queued di Firebase
- [ ] Console log show success

### Test Foreground:
- [ ] Manual notification test berhasil
- [ ] Notification muncul di browser

---

## 🚀 Production Deployment

### 1. Build Production
```bash
npm run build
```

### 2. Deploy ke Hosting
```bash
firebase deploy --only hosting
```

### 3. Setup Cloud Function (Optional)
Untuk auto-send notification:

```bash
cd functions
npm install firebase-functions firebase-admin
firebase deploy --only functions
```

### 4. Test di Production
1. Buka URL production
2. Login admin
3. Allow notification
4. Test semua flow

---

## 🐛 Common Issues

### Issue 1: Notification tidak muncul
**Solusi:**
- Cek VAPID key benar
- Cek permission = "granted"
- Cek FCM token tersimpan
- Cek browser support (bukan Safari iOS)

### Issue 2: Token tidak tersimpan
**Solusi:**
- Cek Firebase config
- Cek internet connection
- Cek Firebase Database rules
- Clear cache & reload

### Issue 3: Monitoring tidak jalan
**Solusi:**
- Cek user role = "admin"
- Cek ada unit expired
- Cek console log untuk error
- Refresh halaman Dashboard

### Issue 4: Service Worker error
**Solusi:**
- Cek file `firebase-messaging-sw.js` ada di `/public`
- Cek Firebase config di service worker
- Unregister & register ulang:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
```

---

## 📞 Support

Jika ada masalah:
1. Cek console log untuk error
2. Cek Firebase Console untuk data
3. Cek dokumentasi: `NOTIFICATION_SETUP.md`
4. Clear cache & reload

---

**Happy Testing! 🎉**
