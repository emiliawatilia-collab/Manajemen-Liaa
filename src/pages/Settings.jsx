import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlus, faEdit, faTrash, faSave, faTimes, faSync } from '@fortawesome/free-solid-svg-icons';

const Settings = () => {
  const [units, setUnits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: '',
    price: '350000',
    pricePerMonth: '3500000',
  });

  // Force update app
  const handleForceUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Show success message
      alert('✅ Cache berhasil dihapus! App akan reload dengan versi terbaru.');
      
      // Reload page
      window.location.reload(true);
    } catch (error) {
      console.error('Error updating app:', error);
      alert('❌ Gagal update. Coba tutup dan buka app lagi.');
      setIsUpdating(false);
    }
  };

  // Load units from localStorage
  useEffect(() => {
    const savedUnits = localStorage.getItem('apartmentUnits');
    if (savedUnits) {
      setUnits(JSON.parse(savedUnits));
    }
  }, []);

  // Save units to localStorage
  const saveUnits = (updatedUnits) => {
    localStorage.setItem('apartmentUnits', JSON.stringify(updatedUnits));
    setUnits(updatedUnits);
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new Event('unitsUpdated'));
  };

  // Add new unit
  const handleAddUnit = (e) => {
    e.preventDefault();
    const newUnit = {
      id: Date.now(),
      unitNumber: formData.unitNumber,
      status: 'kosong',
      tenant: null,
      price: parseInt(formData.price),
      pricePerMonth: parseInt(formData.pricePerMonth),
    };
    
    const updatedUnits = [...units, newUnit].sort((a, b) => 
      a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
    );
    
    saveUnits(updatedUnits);
    setShowAddModal(false);
    setFormData({ unitNumber: '', price: '350000', pricePerMonth: '3500000' });
  };

  // Edit unit
  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      unitNumber: unit.unitNumber,
      price: unit.price.toString(),
      pricePerMonth: unit.pricePerMonth.toString(),
    });
  };

  // Save edited unit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedUnits = units.map(unit =>
      unit.id === editingUnit.id
        ? {
            ...unit,
            unitNumber: formData.unitNumber,
            price: parseInt(formData.price),
            pricePerMonth: parseInt(formData.pricePerMonth),
          }
        : unit
    ).sort((a, b) => 
      a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
    );
    
    saveUnits(updatedUnits);
    setEditingUnit(null);
    setFormData({ unitNumber: '', price: '350000', pricePerMonth: '3500000' });
  };

  // Delete unit
  const handleDeleteUnit = (unitId) => {
    if (confirm('Yakin ingin menghapus unit ini?')) {
      const updatedUnits = units.filter(unit => unit.id !== unitId);
      saveUnits(updatedUnits);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingUnit(null);
    setFormData({ unitNumber: '', price: '350000', pricePerMonth: '3500000' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top">
        <div className="px-4 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <FontAwesomeIcon icon={faCog} className="text-2xl" />
            <h1 className="text-2xl font-bold">Pengaturan</h1>
          </div>
          <p className="text-primary-100 text-sm">Kelola unit apartemen</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Update App Button */}
        <button
          onClick={handleForceUpdate}
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all mb-4 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faSync} className={isUpdating ? 'animate-spin' : ''} />
          {isUpdating ? 'Mengupdate...' : '🔄 Update App ke Versi Terbaru'}
        </button>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all mb-6"
        >
          <FontAwesomeIcon icon={faPlus} />
          Tambah Unit Baru
        </button>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{units.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total Unit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {units.filter(u => u.status === 'terisi').length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Terisi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {units.filter(u => u.status === 'kosong').length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Kosong</div>
            </div>
          </div>
        </div>

        {/* Units List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Daftar Unit</h2>
          
          {units.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <FontAwesomeIcon icon={faCog} className="text-5xl text-gray-300 mb-3" />
              <p className="text-gray-500">Belum ada unit</p>
              <p className="text-sm text-gray-400 mt-1">Tambah unit pertama Anda</p>
            </div>
          ) : (
            units.map((unit) => (
              <div
                key={unit.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {editingUnit?.id === unit.id ? (
                  // Edit Form
                  <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Unit
                      </label>
                      <input
                        type="text"
                        value={formData.unitNumber}
                        onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga/Hari (Rp)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga/Bulan (Rp)
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerMonth}
                        onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faSave} />
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display Mode
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-gray-900">
                            Unit {unit.unitNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            unit.status === 'terisi'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {unit.status === 'terisi' ? 'Terisi' : 'Kosong'}
                          </span>
                        </div>
                        {unit.tenant && (
                          <p className="text-sm text-gray-600">
                            Penyewa: {unit.tenant.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Harga/Hari</span>
                        <span className="font-semibold text-gray-900">
                          Rp {(unit.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Harga/Bulan</span>
                        <span className="font-semibold text-gray-900">
                          Rp {(unit.pricePerMonth || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUnit(unit)}
                        className="flex-1 bg-primary-50 text-primary-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-100 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUnit(unit.id)}
                        disabled={unit.status === 'terisi'}
                        className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                          unit.status === 'terisi'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Hapus
                      </button>
                    </div>
                    
                    {unit.status === 'terisi' && (
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Unit terisi tidak bisa dihapus
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Tambah Unit Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Unit
                </label>
                <input
                  type="text"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                  placeholder="Contoh: 1088"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Sewa per Hari (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="350000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Sewa per Bulan (Rp)
                </label>
                <input
                  type="number"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                  placeholder="3500000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold shadow-lg"
              >
                Tambah Unit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
