import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import UnitCard from '../components/UnitCard';

const Units = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, terisi, kosong
  const [units, setUnits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState('');
  
  useEffect(() => {
    const loadUnits = () => {
      const savedUnits = localStorage.getItem('apartmentUnits');
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits));
      }
    };
    
    loadUnits();
    
    // Listen for storage changes
    const handleStorageChange = () => loadUnits();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('unitsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('unitsUpdated', handleStorageChange);
    };
  }, []);

  // Add new unit
  const handleAddUnit = (e) => {
    e.preventDefault();
    
    const newUnit = {
      id: Date.now(),
      unitNumber: newUnitNumber,
      status: 'kosong',
      tenant: null,
      price: 0,
      pricePerMonth: 0,
    };
    
    const updatedUnits = [...units, newUnit].sort((a, b) => 
      (a.unitNumber || '').localeCompare(b.unitNumber || '', undefined, { numeric: true })
    );
    
    localStorage.setItem('apartmentUnits', JSON.stringify(updatedUnits));
    setUnits(updatedUnits);
    window.dispatchEvent(new Event('unitsUpdated'));
    
    setShowAddModal(false);
    setNewUnitNumber('');
  };

  // Checkout function
  const handleCheckout = (unitId) => {
    if (!confirm('Yakin ingin checkout unit ini?')) return;
    
    const updatedUnits = units.map(unit => {
      if (unit.id === unitId) {
        return {
          ...unit,
          status: 'kosong',
          tenant: null,
        };
      }
      return unit;
    });
    
    localStorage.setItem('apartmentUnits', JSON.stringify(updatedUnits));
    setUnits(updatedUnits);
    
    // Trigger custom event
    window.dispatchEvent(new Event('unitsUpdated'));
  };

  // Delete unit function
  const handleDeleteUnit = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    
    // Check if unit is occupied
    if (unit && unit.status === 'terisi') {
      alert('Unit sedang terisi! Checkout dulu sebelum menghapus.');
      return;
    }
    
    if (!confirm(`Yakin ingin menghapus Unit ${unit?.unitNumber}?`)) return;
    
    const updatedUnits = units.filter(u => u.id !== unitId);
    
    localStorage.setItem('apartmentUnits', JSON.stringify(updatedUnits));
    setUnits(updatedUnits);
    
    // Trigger custom event
    window.dispatchEvent(new Event('unitsUpdated'));
  };

  // Filter units based on search and status
  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (unit.tenant?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top">
        <div className="px-4 pt-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Daftar Unit</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari unit atau nama penyewa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua ({units.length})
            </button>
            <button
              onClick={() => setFilterStatus('terisi')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'terisi'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Terisi ({units.filter(u => u.status === 'terisi').length})
            </button>
            <button
              onClick={() => setFilterStatus('kosong')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'kosong'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Kosong ({units.filter(u => u.status === 'kosong').length})
            </button>
          </div>
        </div>
      </div>

      {/* Units Grid */}
      <div className="px-4 py-4">
        {filteredUnits.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredUnits.map((unit) => (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                onCheckout={handleCheckout}
                onDelete={handleDeleteUnit}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 mt-8">
            <Filter size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Tidak ada unit ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Unit Baru</h3>
            <form onSubmit={handleAddUnit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Unit
                </label>
                <input
                  type="text"
                  value={newUnitNumber}
                  onChange={(e) => setNewUnitNumber(e.target.value)}
                  placeholder="Contoh: 1088, 2011"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUnitNumber('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
