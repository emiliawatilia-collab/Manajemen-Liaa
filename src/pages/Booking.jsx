import { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle } from 'lucide-react';

const Booking = () => {
  const [units, setUnits] = useState([]);
  
  useEffect(() => {
    const loadUnits = () => {
      const savedUnits = localStorage.getItem('apartmentUnits');
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits));
      }
    };
    
    loadUnits();
    
    // Listen for storage changes
    window.addEventListener('storage', loadUnits);
    return () => window.removeEventListener('storage', loadUnits);
  }, []);

  const emptyUnits = units.filter(u => u.status === 'kosong');
  const [formData, setFormData] = useState({
    unitId: '',
    tenantName: '',
    phone: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkInTime: '',
    checkOut: '',
    checkOutTime: '',
    price: '',
    ktpImage: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, ktpImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get selected unit
    const selectedUnit = emptyUnits.find(u => u.id === parseInt(formData.unitId));
    if (!selectedUnit) return;
    
    // Update unit with booking data
    const savedUnits = localStorage.getItem('apartmentUnits');
    if (savedUnits) {
      const allUnits = JSON.parse(savedUnits);
      const updatedUnits = allUnits.map(unit => {
        if (unit.id === selectedUnit.id) {
          return {
            ...unit,
            status: 'terisi',
            tenant: {
              name: formData.tenantName,
              phone: formData.phone,
              checkIn: formData.checkIn,
              checkInTime: formData.checkInTime,
              checkOut: formData.checkOut,
              checkOutTime: formData.checkOutTime,
              ktpImage: formData.ktpImage,
              price: parseInt(formData.price), // Save custom price per booking
            }
          };
        }
        return unit;
      });
      
      // Save to localStorage
      localStorage.setItem('apartmentUnits', JSON.stringify(updatedUnits));
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('unitsUpdated'));
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reset form
      setFormData({
        unitId: '',
        tenantName: '',
        phone: '',
        checkIn: new Date().toISOString().split('T')[0],
        checkInTime: '',
        checkOut: '',
        checkOutTime: '',
        price: '',
        ktpImage: null,
      });
      // Reload units
      const reloadUnits = localStorage.getItem('apartmentUnits');
      if (reloadUnits) {
        setUnits(JSON.parse(reloadUnits));
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top">
        <div className="px-4 pt-6 pb-6">
          <h1 className="text-2xl font-bold mb-1">Booking Baru</h1>
          <p className="text-primary-100 text-sm">Tambah penyewa baru</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Unit
            </label>
            <select
              value={formData.unitId}
              onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">-- Pilih Unit Kosong --</option>
              {emptyUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unitNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Tenant Info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">Data Penyewa</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-gray-400 text-xs">(Opsional)</span>
              </label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                placeholder="Masukkan nama penyewa (opsional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon <span className="text-gray-400 text-xs">(Opsional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx (opsional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">Periode Sewa</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Check-in <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Check-out <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                💡 <strong>Untuk transit/per jam:</strong> Isi jam check-in dan check-out. Contoh: 18.00 - 19.00
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Sewa (Rp/hari)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Contoh: 140000 atau 150000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Harga bisa berbeda setiap booking</p>
            </div>
          </div>

          {/* KTP Upload */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Foto KTP
            </label>
            
            {!formData.ktpImage ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera size={40} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Ambil Foto KTP</span>
                <span className="text-xs text-gray-400 mt-1">atau pilih dari galeri</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={formData.ktpImage}
                  alt="KTP Preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, ktpImage: null })}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-[0.98]"
          >
            Simpan Booking
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Berhasil!</h3>
            <p className="text-gray-600">Data penyewa telah disimpan</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
