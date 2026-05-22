# 📬 Push Notification Setup Guide

## ✅ Status Integrasi

- ✅ Notification Service (notificationService.js)
- ✅ Service Worker (firebase-messaging-sw.js)
- ✅ Firebase Config (firebase.js)
- ✅ AuthContext Integration (request permission saat login admin)
- ✅ Dashboard Integration (monitor checkout expired setiap jam)
- ✅ Attendance Integration (kirim notif saat absen)
- ✅ Manifest.json (PWA support dengan FCM)

## 🎯 Fitur Notifikasi

### 1. Checkout Expired Notification ⏰
- **Trigger**: Otomatis setiap 1 jam
- **Target**: Admin only
- **Kondisi**: Unit terisi dengan checkout sudah lewat waktu
- **Lokasi**: Dashboard.jsx
- **Pesan**: "⚠️ Checkout Expired - Unit {number} - {nama} ({phone}) checkout sudah lewat!"

### 2. Attendance Notification ✅
- **Trigger**: Saat pegawai check-in/check-out
- **Target**: Admin only
- **Lokasi**: attendanceService.js
- **Pesan Check-in**: "✅ Absensi Pegawai - {nama} berhasil check-in - {time}"
- **Pesan Check-out**: "👋 Absensi Pegawai - {nama} berhasil check-out - {time}"

## 🔧 Setup Firebase Cloud Messaging

### Step 1: Generate VAPID Key
1. Buka Firebase Console: https://console.firebase.google.com
2. Pilih project: **manajemen-apartemen-bylia**
3. Masuk ke **Project Settings** (⚙️ icon)
4. Tab **Cloud Messaging**
5. Scroll ke **Web Push certificates**
6. Klik **Generate key pair**
7. Copy VAPID key yang muncul

### Step 2: Update VAPID Key
Edit file: `src/services/notificationService.js`

```javascript
// Ganti baris ini:
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';

// Dengan VAPID key dari Firebase Console:
const VAPID_KEY = 'BHxxx...'; // Paste key di sini
```

### Step 3: Deploy Service Worker
Service worker sudah ada   di: `public/firebase-messaging-sw.js`

Pastikan file ini accessible di root URL:
- ✅ https://your-domain.com/firebase-messaging-sw.js

### Step 4: Test Notification Permission
1. Login sebagai admin (lia210880)
2. Browser akan minta permission untuk notifikasi
3. Klik **Allow**
4. FCM token akan tersimpan di Firebase Database

## 📱 Cara Kerja

### Flow Checkout Notification:
```
Dashboard (setiap 1 jam)
  ↓
monitorCheckouts(units)
  ↓
Cek unit terisi dengan checkout expired
  ↓
sendCheckoutExpiredNotification(unit)
  ↓
Simpan ke Firebase Database (notifications/)
  ↓
Cloud Function (optional) kirim ke FCM
  ↓
Admin terima notifikasi
```

### Flow Attendance Notification:
```
Pegawai check-in/out
  ↓
checkIn() / checkOut()
  ↓
sendAttendanceNotification(name, type, time)
  ↓
Simpan ke Firebase Database (notifications/)
  ↓
Cloud Function (optional) kirim ke FCM
  ↓
Admin terima notifikasi
```

## 🚀 Next Steps (Optional)

### Setup Cloud Function untuk Auto-Send
Untuk mengirim notifikasi otomatis, perlu setup Firebase Cloud Function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.database
  .ref('/notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.val();
    
    if (notification.status !== 'pending') return;
    
    const message = {
      notification: notification.message,
      tokens: notification.tokens
    };
    
    try {
      await admin.messaging().sendMulticast(message);
      await snapshot.ref.update({ status: 'sent' });
    } catch (error) {
      console.error('Error sending notification:', error);
      await snapshot.ref.update({ status: 'failed' });
    }
  });
```

Deploy:
```bash
firebase deploy --only functions
```

## 📊 Monitoring

### Cek FCM Tokens di Firebase:
```
Database → users → {userId} → fcmTokens
```

### Cek Notification Queue:
```
Database → notifications
```

### Debug Console:
- Browser Console akan show log:
  - ✅ FCM Token saved
  - 📬 Notification received
  - ⏰ Checkout expired detected

## 🔒 Security Rules

Update Firebase Database Rules:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$userId === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "notifications": {
      ".read": "root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": true
    }
  }
}
```

## 🎨 Customization

### Ubah Interval Monitoring:
Edit `Dashboard.jsx`:
```javascript
// Default: 1 jam (3600000 ms)
const interval = setInterval(() => {
  monitorCheckouts(units);
}, 3600000);

// Ubah ke 30 menit:
}, 1800000);
```

### Ubah Notifikasi Sound/Icon:
Edit `notificationService.js`:
```javascript
const notification = new Notification(title, {
  body: body,
  icon: '/custom-icon.png', // Ganti icon
  badge: '/badge.png',
  sound: '/notification.mp3', // Tambah sound
  vibrate: [200, 100, 200] // Tambah vibration
});
```

## 📝 Notes

- Notifikasi hanya untuk **admin**
- Pegawai tidak terima notifikasi
- FCM token disimpan per device
- Token auto-refresh jika expired
- Notifikasi work di background & foreground
- Support Chrome, Firefox, Edge (tidak support Safari iOS)

## 🐛 Troubleshooting

### Notifikasi tidak muncul?
1. Cek permission: `Notification.permission === 'granted'`
2. Cek VAPID key sudah benar
3. Cek service worker registered: `navigator.serviceWorker.ready`
4. Cek FCM token tersimpan di Firebase
5. Cek browser console untuk error

### Token tidak tersimpan?
1. Pastikan user login sebagai admin
2. Cek Firebase config benar
3. Cek internet connection
4. Clear browser cache & reload

---

Built with ❤️ using Firebase Cloud Messaging
