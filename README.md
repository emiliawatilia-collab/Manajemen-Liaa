# 🏢 Manajemen Apartemen - Mobile-First App

Aplikasi manajemen apartemen modern berbasis web dengan desain mobile-first menggunakan React + Vite + Tailwind CSS.

## ✨ Fitur

- 📊 **Dashboard** - Statistik realtime unit apartemen
- 🏠 **Daftar Unit** - List semua unit dengan filter dan search
- 📅 **Kalender Booking** - View kalender bulanan seperti sistem manual (NEW!)
- ➕ **Booking Baru** - Form booking dengan upload KTP
- 📋 **Histori** - Riwayat booking dan penyewa
- 📱 **Mobile-First** - Optimized untuk penggunaan di HP
- 🎨 **Modern UI** - Design mirip Airbnb host dashboard

## 🚀 Tech Stack

- **React 19** - UI Framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **React Router DOM** - Routing
- **Lucide React** - Icon library

## 📁 Struktur Project

```
src/
├── components/       # Reusable components
│   ├── BottomNav.jsx
│   ├── UnitCard.jsx
│   └── StatCard.jsx
├── pages/           # Page components
│   ├── Dashboard.jsx
│   ├── Units.jsx
│   ├── Booking.jsx
│   └── History.jsx
├── layouts/         # Layout components
│   └── MainLayout.jsx
├── routes/          # Route configuration
│   └── index.jsx
├── services/        # Data & services
│   └── unitData.js
└── assets/          # Static assets
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Routes

- `/` - Dashboard
- `/units` - Daftar Unit
- `/calendar` - Kalender Booking (NEW!)
- `/booking` - Booking Baru
- `/history` - Histori Booking

## 🎨 Design Features

- ✅ Mobile-first responsive design
- ✅ Bottom navigation (native app feel)
- ✅ Rounded cards with soft shadows
- ✅ Blue & white color theme
- ✅ Smooth transitions & animations
- ✅ Clean spacing & typography
- ✅ Safe area support (iOS notch)

## 📊 Data Structure

```javascript
{
  id: 1,
  unitNumber: '1088',
  status: 'terisi' | 'kosong',
  tenant: {
    name: 'Budi Santoso',
    checkIn: '2026-05-10',
    checkOut: '2026-05-20',
    phone: '081234567890',
  },
  price: 350000,
  pricePerMonth: 3500000,
}
```

## 🔮 Future Enhancements

- [ ] PWA support (offline mode)
- [ ] Backend integration (API)
- [ ] Authentication & authorization
- [ ] Push notifications
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Export reports (PDF/Excel)
- [ ] Multi-language support

## 📄 License

MIT

---

Built with ❤️ using React + Vite + Tailwind CSS
