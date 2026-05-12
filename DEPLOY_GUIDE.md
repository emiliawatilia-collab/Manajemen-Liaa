# 🚀 Panduan Deploy Aplikasi ke Vercel

## Tahap 1: Install Vercel CLI

Buka terminal di folder project, jalankan:

```bash
npm install -g vercel
```

## Tahap 2: Login ke Vercel

```bash
vercel login
```

Pilih metode login (Email/GitHub/GitLab)

## Tahap 3: Deploy

```bash
vercel
```

Jawab pertanyaan:
- **Set up and deploy?** → Y (Yes)
- **Which scope?** → Pilih akun Anda
- **Link to existing project?** → N (No)
- **What's your project's name?** → apartemen-management (atau nama lain)
- **In which directory is your code located?** → ./ (tekan Enter)
- **Want to override the settings?** → N (No)

Tunggu proses deploy selesai (1-2 menit)

## Tahap 4: Dapat Link Production

Setelah selesai, Anda akan dapat link seperti:
```
https://apartemen-management.vercel.app
```

## Tahap 5: Test PWA

1. Buka link di HP (Chrome/Safari)
2. Tunggu popup "Install" muncul
3. Klik "Install"
4. Aplikasi muncul di home screen! ✅

---

## 🔄 Update Aplikasi (Setelah Edit Code)

Setiap kali ada perubahan code:

```bash
vercel --prod
```

Aplikasi akan auto-update di link yang sama.

---

## 🎯 Cara 2: Deploy via GitHub (Auto Deploy)

### Langkah 1: Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### Langkah 2: Import di Vercel

1. Buka https://vercel.com/dashboard
2. Klik "Add New" → "Project"
3. Import repository dari GitHub
4. Klik "Deploy"
5. Tunggu selesai

### Keuntungan:
- ✅ Auto deploy setiap kali push ke GitHub
- ✅ Tidak perlu manual deploy lagi
- ✅ Ada preview untuk setiap branch

---

## 📱 Setelah Deploy

### Test di HP:

**Android:**
1. Buka link di Chrome
2. Tunggu popup install
3. Klik "Install"
4. Cek home screen

**iPhone:**
1. Buka link di Safari
2. Klik Share → Add to Home Screen
3. Klik "Add"
4. Cek home screen

---

## 🔧 Troubleshooting

### Error: "Command not found: vercel"
```bash
npm install -g vercel
```

### Error: "Not logged in"
```bash
vercel login
```

### Error: "Build failed"
Cek apakah `npm run build` jalan di local:
```bash
npm run build
```

### Popup Install Tidak Muncul
- Pastikan buka di HTTPS (bukan HTTP)
- Coba refresh halaman
- Coba buka di Incognito mode

---

## 🎉 Selesai!

Aplikasi Anda sekarang:
- ✅ Online dengan HTTPS
- ✅ Bisa diinstall sebagai PWA
- ✅ Bisa diakses dari mana saja
- ✅ Auto-update saat deploy

**Link production:** https://your-app.vercel.app

Share link ini ke user untuk install aplikasi! 📱
