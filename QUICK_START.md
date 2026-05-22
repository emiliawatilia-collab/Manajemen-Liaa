# 🚀 Quick Start - Test Notifikasi (5 Menit)

## Step 1: Generate VAPID Key (2 menit)

1. Buka: https://console.firebase.google.com
2. Pilih project: **manajemen-apartemen-bylia**
3. Klik ⚙️ → **Project Settings** → Tab **Cloud Messaging**
4. Scroll ke **Web Push certificates**
5. Klik **"Generate key pair"**
6. **Copy** VAPID key (format: BHxxx...)

## Step 2: Update Code (1 menit)

Edit file: `src/services/notificationService.js`

Cari baris 9:
```javascript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

Ganti dengan VAPID key yang di-copy:
```javascript
const VAPID_KEY = 'BHxxx...'; // Paste di sini
```

Save file!

## Step 3: Jalankan App (30 detik)

```bash
npm run dev
```

Buka: http://localhost:5173

## Step 4: Test Admin Notification (1 menit)

1. **Login admin:**
   - Username: `lia210880`
   - Password: `lia210880`

2. **Allow notification** saat popup muncul

3. **Cek console** (F12):
   ```
   ✅ Notification permission granted
   ✅ FCM Token: BHxxx...
   ✅ FCM token saved to Firebase
   ```

4. **Cek Firebase Database:**
   - Buka: https://console.firebase.google.com
   - Realtime Database → `users` → `lia210880_bylia_com` → `fcmTokens`
   - Harus ada token tersimpan! ✅

## Step 5: Test Attendance Notification (1 menit)

1. **Logout** dari admin

2. **Login pegawai:**
   - Username: `ameliaagustina@bylia.com`
   - Password: `amel123`

3. Klik menu **Absensi** (bottom nav)

4. Klik **"Absen Masuk"**

5. **Cek Firebase Database:**
   - Realtime Database → `notifications`
   - Harus ada entry baru dengan message:
   ```json
   {
     "title": "✅ Absensi Pegawai",
     "body": "Amelia Agustina berhasil check-in - 09:15"
   }
   ```

## ✅ Selesai!

Jika semua step berhasil:
- ✅ Admin bisa terima notification permission
- ✅ FCM token tersimpan di Firebase
- ✅ Attendance notification masuk ke queue

## 🧪 Test Lanjutan

Lihat file: **TESTING_GUIDE.md** untuk:
- Test checkout expired notification
- Test check-out notification
- Test foreground notification
- Troubleshooting

## 🐛 Troubleshooting Cepat

**Popup notification tidak muncul?**
- Cek VAPID key sudah benar
- Cek browser = Chrome/Firefox/Edge (bukan Safari)
- Clear cache & reload

**Token tidak tersimpan?**
- Cek Firebase config di `firebase.js`
- Cek internet connection
- Cek console untuk error

**Notification tidak masuk queue?**
- Cek console log
- Cek Firebase Database rules
- Refresh halaman

---

**Butuh bantuan?** Lihat: `TESTING_GUIDE.md` atau `NOTIFICATION_SETUP.md`
