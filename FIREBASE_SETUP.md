# 🔥 Setup Firebase Realtime Database

## 📋 Langkah-langkah Setup Firebase

### Step 1: Buat Firebase Project

1. **Buka Firebase Console:**
   - Kunjungi: https://console.firebase.google.com
   - Login dengan akun Google

2. **Buat Project Baru:**
   - Klik **"Add project"** atau **"Tambahkan project"**
   - Nama project: **"Apartemen Management"** (atau nama lain)
   - Klik **"Continue"**

3. **Google Analytics (Opsional):**
   - Bisa dimatikan (toggle off)
   - Klik **"Create project"**
   - Tunggu 30 detik

4. **Klik "Continue"** setelah selesai

---

### Step 2: Setup Realtime Database

1. **Buka Realtime Database:**
   - Di sidebar kiri, klik **"Build"** → **"Realtime Database"**
   - Klik **"Create Database"**

2. **Pilih Location:**
   - Pilih: **"asia-southeast1 (Singapore)"** (paling dekat)
   - Klik **"Next"**

3. **Security Rules:**
   - Pilih: **"Start in test mode"** (untuk development)
   - Klik **"Enable"**

4. **Database URL:**
   - Setelah selesai, Anda akan dapat URL seperti:
   ```
   https://apartemen-management-xxxxx-default-rtdb.firebaseio.com
   ```
   - **SIMPAN URL INI!** Akan dipakai nanti.

---

### Step 3: Dapatkan Firebase Config

1. **Buka Project Settings:**
   - Klik icon **⚙️ (gear)** di sidebar → **"Project settings"**

2. **Scroll ke bawah:**
   - Di bagian **"Your apps"**
   - Klik icon **"</>"** (Web)

3. **Register App:**
   - App nickname: **"Apartemen Web"**
   - ✅ Centang **"Also set up Firebase Hosting"** (opsional)
   - Klik **"Register app"**

4. **Copy Firebase Config:**
   - Akan muncul code seperti ini:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "apartemen-xxxxx.firebaseapp.com",
     databaseURL: "https://apartemen-xxxxx-default-rtdb.firebaseio.com",
     projectId: "apartemen-xxxxx",
     storageBucket: "apartemen-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:xxxxxxxxxxxxx"
   };
   ```
   - **COPY SEMUA CONFIG INI!**

5. **Klik "Continue to console"**

---

### Step 4: Update Firebase Config di Code

1. **Buka file:** `src/services/firebase.js`

2. **Ganti config:**
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",           // ← Ganti dengan API Key Anda
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **Paste config dari Firebase Console**

4. **Save file**

---

### Step 5: Update Security Rules (Penting!)

Untuk production, update security rules agar lebih aman:

1. **Buka Realtime Database:**
   - Klik tab **"Rules"**

2. **Ganti rules dengan:**
   ```json
   {
     "rules": {
       "units": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

3. **Klik "Publish"**

**Catatan:** Rules ini membolehkan semua orang read/write. Untuk production yang lebih aman, bisa tambahkan authentication.

---

### Step 6: Test Firebase Connection

1. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

2. **Buka browser:**
   - Buka http://localhost:5173
   - Buka Console (F12)
   - Cek apakah ada error Firebase

3. **Test tambah unit:**
   - Tambah unit baru
   - Cek di Firebase Console → Realtime Database
   - Data harus muncul di Firebase

4. **Test realtime sync:**
   - Buka aplikasi di 2 browser/tab berbeda
   - Tambah unit di tab 1
   - Harus langsung muncul di tab 2 (realtime!)

---

### Step 7: Deploy ke Vercel

Setelah Firebase config sudah benar:

```bash
git add .
git commit -m "Add Firebase realtime sync"
git push
```

Vercel akan auto-deploy dalam 1-2 menit.

---

## 🎯 Checklist Setup

- [ ] Buat Firebase project
- [ ] Setup Realtime Database
- [ ] Dapat Firebase config
- [ ] Update `src/services/firebase.js`
- [ ] Test di localhost (2 tab berbeda)
- [ ] Update security rules
- [ ] Deploy ke Vercel
- [ ] Test di 2 HP berbeda

---

## 🔒 Security Rules untuk Production

Untuk production yang lebih aman, gunakan rules ini:

```json
{
  "rules": {
    "units": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

Ini membolehkan semua orang read, tapi hanya user yang login bisa write.

Atau untuk admin only:

```json
{
  "rules": {
    "units": {
      ".read": true,
      ".write": "auth != null && auth.token.admin == true"
    }
  }
}
```

---

## 🆘 Troubleshooting

### Error: "Permission denied"
- Cek security rules di Firebase Console
- Pastikan rules allow read/write

### Error: "Firebase not initialized"
- Cek apakah config sudah benar di `firebase.js`
- Cek apakah semua field config sudah diisi

### Data tidak sync
- Cek internet connection
- Cek Firebase Console apakah data masuk
- Cek browser console untuk error

### Error: "databaseURL is required"
- Pastikan `databaseURL` ada di config
- Format: `https://project-id-default-rtdb.firebaseio.com`

---

## 📞 Need Help?

Jika ada masalah:
1. Cek Firebase Console → Realtime Database
2. Cek browser console (F12)
3. Cek Network tab untuk request Firebase

---

**Setelah setup selesai, data akan sync realtime antar semua device! 🎉**
