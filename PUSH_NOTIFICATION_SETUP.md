# 🔔 Push Notification Setup Guide

Panduan lengkap setup Push Notification untuk Apartemen Management App.

---

## 📋 Fitur Notifikasi

### 1. **Notifikasi Checkout Expired** ⚠️
- Muncul saat unit checkout sudah lewat
- Hanya admin yang dapat
- Contoh: "⚠️ Unit 1017 - Rita (081234567890) checkout sudah lewat!"

### 2. **Notifikasi Absensi Pegawai** ✅
- Muncul saat pegawai check-in/check-out
- Hanya admin yang dapat
- Contoh: "✅ Budi berhasil check-in - 08:05 WIB"

---

## 🚀 Step 1: Setup Firebase Cloud Messaging

### 1.1 Buka Firebase Console
1. Buka: https://console.firebase.google.com
2. Pilih project: **apartemen-management**
3. Klik ⚙️ **Settings** → **Project settings**

### 1.2 Generate VAPID Key
1. Scroll ke bawah ke bagian **"Your apps"**
2. Klik tab **"Cloud Messaging"**
3. Scroll ke **"Web Push certificates"**
4. Klik **"Generate key pair"**
5. Copy **VAPID key** yang muncul (contoh: `BKagOny0KF_2pCJQ3m...`)

### 1.3 Update VAPID Key di Code
Buka file: `src/services/notificationService.js`

Ganti baris ini:
```javascript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

Dengan:
```javascript
const VAPID_KEY = 'BKagOny0KF_2pCJQ3m...'; // VAPID key dari Firebase Console
```

---

## 🔧 Step 2: Setup Cloud Function (Opsional tapi Recommended)

Untuk kirim notifikasi dari server (lebih aman), buat Cloud Function:

### 2.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2.2 Login ke Firebase
```bash
firebase login
```

### 2.3 Init Cloud Functions
```bash
firebase init functions
```

Pilih:
- Language: **JavaScript**
- ESLint: **Yes**
- Install dependencies: **Yes**

### 2.4 Buat Function untuk Kirim Notifikasi

Buka file: `functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Trigger saat ada notifikasi baru di database
exports.sendPushNotification = functions.database
  .ref('/notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.val();
    
    if (notification.status !== 'pending') {
      return null;
    }
    
    const { message, tokens } = notification;
    
    // Kirim notifikasi ke semua admin tokens
    const payload = {
      notification: {
        title: message.title,
        body: message.body,
        icon: message.icon,
        badge: message.badge
      },
      data: message.data || {}
    };
    
    try {
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log('✅ Notification sent:', response);
      
      // Update status
      await snapshot.ref.update({ status: 'sent', sentAt: new Date().toISOString() });
      
      return response;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      await snapshot.ref.update({ status: 'failed', error: error.message });
      return null;
    }
  });
```

### 2.5 Deploy Cloud Function
```bash
firebase deploy --only functions
```

---

## 📱 Step 3: Test Notifikasi

### 3.1 Test di Localhost

1. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

2. **Login sebagai Admin**
   - Email: admin@apartemen.com
   - Password: (password admin Anda)

3. **Allow Notifications**
   - Popup akan muncul: "Allow notifications?"
   - Klik **"Allow"**

4. **Cek Console**
   - Buka DevTools (F12)
   - Lihat console, harus ada:
     ```
     ✅ Notification permission granted
     ✅ FCM Token: eXaMpLeToKeN123...
     ✅ FCM token saved to Firebase
     ```

### 3.2 Test Notifikasi Checkout

1. **Buat unit dengan checkout expired:**
   - Buka halaman Units
   - Booking unit dengan checkout kemarin
   - Tunggu 1 menit

2. **Notifikasi harus muncul:**
   - "⚠️ Checkout Expired"
   - "Unit 1017 - Rita (081234567890) checkout sudah lewat!"

### 3.3 Test Notifikasi Absensi

1. **Login sebagai Pegawai** (di tab/browser lain)
2. **Klik Check-in**
3. **Notifikasi harus muncul di HP/browser admin:**
   - "✅ Absensi Pegawai"
   - "Budi berhasil check-in - 08:05 WIB"

---

## 🌐 Step 4: Deploy ke Production

### 4.1 Build Aplikasi
```bash
npm run build
```

### 4.2 Deploy ke Vercel
```bash
git add .
git commit -m "Add push notifications"
git push
```

Vercel akan auto-deploy.

### 4.3 Test di Production

1. Buka: https://manajemen-liaa.vercel.app
2. Login sebagai admin
3. Allow notifications
4. Test checkout expired & absensi

---

## 🔍 Troubleshooting

### ❌ "Notification permission denied"
**Solusi:**
1. Buka Settings browser
2. Cari "Site settings" atau "Permissions"
3. Cari domain aplikasi Anda
4. Ubah "Notifications" ke "Allow"
5. Refresh halaman

### ❌ "VAPID key not found"
**Solusi:**
1. Pastikan sudah generate VAPID key di Firebase Console
2. Copy paste VAPID key ke `notificationService.js`
3. Restart dev server

### ❌ "Service Worker registration failed"
**Solusi:**
1. Pastikan file `firebase-messaging-sw.js` ada di folder `public/`
2. Cek console untuk error
3. Clear cache browser (Ctrl+Shift+Delete)
4. Refresh halaman

### ❌ Notifikasi tidak muncul
**Solusi:**
1. Cek apakah FCM token tersimpan di Firebase:
   - Buka Firebase Console → Realtime Database
   - Cek `users/{userId}/fcmTokens`
2. Cek apakah Cloud Function jalan:
   - Buka Firebase Console → Functions
   - Lihat logs
3. Cek browser console untuk error

### ❌ Notifikasi muncul di pegawai
**Solusi:**
- Pastikan role user di Firebase adalah "pegawai", bukan "admin"
- Cek di `users/{userId}/role`

---

## 📊 Monitoring

### Cek FCM Tokens di Firebase
1. Buka Firebase Console → Realtime Database
2. Lihat struktur:
   ```
   users/
     userId123/
       email: "admin@apartemen.com"
       role: "admin"
       fcmTokens/
         token1/
           token: "eXaMpLeToKeN..."
           deviceName: "iPhone"
           createdAt: "2026-05-22T10:00:00Z"
   ```

### Cek Notifikasi Queue
1. Buka Firebase Console → Realtime Database
2. Lihat `notifications/` node
3. Status:
   - `pending` → Belum dikirim
   - `sent` → Sudah dikirim
   - `failed` → Gagal kirim

---

## 🎯 Next Steps

Setelah setup selesai:

1. ✅ Test notifikasi di localhost
2. ✅ Deploy ke production
3. ✅ Test di HP admin
4. ✅ Pastikan pegawai tidak dapat notifikasi
5. ✅ Monitor logs di Firebase Console

---

## 📝 Catatan Penting

- **VAPID Key** harus disimpan di code (aman, ini public key)
- **Server Key** JANGAN disimpan di frontend (hanya di Cloud Function)
- **FCM Token** disimpan per device (1 user bisa punya banyak token)
- **Notifikasi** hanya ke admin (berdasarkan role)
- **Cloud Function** optional tapi recommended untuk keamanan

---

**Selamat! Push Notification sudah siap digunakan! 🎉**
