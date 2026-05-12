# ⚡ Quick Start - Deploy PWA dalam 5 Menit

## 🎯 Tujuan
Membuat aplikasi ini bisa diinstall di HP seperti aplikasi native.

---

## 📋 Tahap 1: Deploy ke Internet (WAJIB)

PWA hanya jalan di **HTTPS**. Jadi harus deploy dulu ke hosting.

### Opsi Tercepat: Vercel (Gratis)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login
```bash
vercel login
```
Pilih metode login (Email/GitHub)

#### 3. Deploy
```bash
vercel
```
Jawab semua pertanyaan dengan **Enter** (pakai default)

#### 4. Dapat Link
Setelah selesai, dapat link seperti:
```
https://apartemen-management.vercel.app
```

**✅ SELESAI! Aplikasi sudah online dengan HTTPS**

---

## 📱 Tahap 2: Install di HP

### Android (Chrome):
1. Buka link di Chrome
2. Tunggu **popup biru** muncul di bawah
3. Klik **"Install"**
4. ✅ Icon muncul di home screen

### iPhone (Safari):
1. Buka link di **Safari** (bukan Chrome!)
2. Klik tombol **Share (📤)**
3. Pilih **"Add to Home Screen"**
4. Klik **"Add"**
5. ✅ Icon muncul di home screen

---

## 🔄 Update Aplikasi (Setelah Edit Code)

Setiap kali edit code dan mau update:

```bash
vercel --prod
```

Aplikasi akan auto-update di link yang sama.

---

## 🎉 Selesai!

Aplikasi Anda sekarang:
- ✅ Bisa diinstall di HP
- ✅ Buka tanpa browser
- ✅ Terasa seperti aplikasi native
- ✅ Icon di home screen
- ✅ Bisa offline

---

## 🆘 Troubleshooting

### Popup Install Tidak Muncul?
- Pastikan buka di **HTTPS** (link dari Vercel)
- Refresh halaman (pull down)
- Coba buka di **Incognito mode**

### Error saat Deploy?
```bash
# Cek apakah build jalan di local
npm run build

# Kalau error, fix dulu, baru deploy lagi
vercel
```

### Aplikasi Tidak Update?
- Tutup aplikasi sepenuhnya
- Buka lagi
- Atau uninstall dan install ulang

---

## 📞 Need Help?

Baca dokumentasi lengkap:
- `DEPLOY_GUIDE.md` - Panduan deploy detail
- `INSTALL_PWA.md` - Panduan install di berbagai device

---

**Total waktu: 5 menit** ⚡
