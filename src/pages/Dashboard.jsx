import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHome, faChartLine, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import StatCard from '../components/StatCard';
import UnitCard from '../components/UnitCard';
import { useUnits } from '../hooks/useUnits';
import { monitorCheckouts } from '../services/checkoutMonitor';
import { checkBotStatus } from '../services/whatsappService';

const Dashboard = () => {
  const { units, loading, checkoutUnit } = useUnits();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [botConnected, setBotConnected] = useState(false);

  // Check bot status on mount
  useEffect(() => {
    checkBotStatus().then(connected => {
      setBotConnected(connected);
      if (connected) {
        console.log('✅ WhatsApp Bot terhubung');
      } else {
        console.warn('⚠️ WhatsApp Bot tidak terhubung. Jalankan: cd whatsapp-bot-apartemen && node bot-wweb.js');
      }
    });
  }, []);

  // Monitor checkouts every minute (otomatis kirim ke grup WhatsApp)
  useEffect(() => {
    if (!botConnected || units.length === 0) return;

    // Check immediately
    monitorCheckouts(units);

    // Check every minute
    const interval = setInterval(() => {
      monitorCheckouts(units);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [units, botConnected]);

  const occupiedUnits = units.filter(u => u.status === 'terisi');
  const emptyUnits = units.filter(u => u.status === 'kosong');
  const occupancyRate = units.length > 0 
    ? ((occupiedUnits.length / units.length) * 100).toFixed(1) 
    : 0;

  // Calculate total revenue from occupied units (use booking price, not unit price)
  const totalRevenue = occupiedUnits.reduce((sum, unit) => {
    const bookingPrice = unit.tenant?.price || unit.price || 0;
    return sum + bookingPrice;
  }, 0);

  // Get recent bookings (occupied units) - show all
  const recentBookings = occupiedUnits;

  // Show detail function
  const handleShowDetail = (unit) => {
    setSelectedUnit(unit);
    setShowDetailModal(true);
  };

  // Checkout function
  const handleCheckout = async (firebaseId) => {
    if (!confirm('Yakin ingin checkout unit ini?')) return;
    
    try {
      await checkoutUnit(firebaseId);
    } catch (error) {
      console.error('Error checkout:', error);
      alert('Gagal checkout unit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top">
        <div className="px-4 pt-6 pb-8">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-primary-100 text-sm">Manajemen ApartemenByliaa</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-4 mb-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard
            icon={faBuilding}
            label="Total Unit"
            value={units.length}
            color="blue"
          />
          <StatCard
            icon={faHome}
            label="Unit Terisi"
            value={occupiedUnits.length}
            color="red"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={faChartLine}
            label="Occupancy"
            value={`${occupancyRate}%`}
            color="green"
          />
          <StatCard
            icon={faDollarSign}
            label="Revenue/Hari"
            value={`Rp ${(totalRevenue / 1000).toFixed(0)}K`}
            color="purple"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Unit Kosong</p>
              <p className="text-3xl font-bold text-green-600">{emptyUnits.length}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-500 mb-1">Siap Disewakan</p>
              <p className="text-3xl font-bold text-primary-600">{emptyUnits.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Unit Terisi Hari Ini</h2>
          <a href="/units" className="text-sm text-primary-600 font-medium">
            Lihat Semua
          </a>
        </div>

        {recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((unit) => (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                onShowDetail={handleShowDetail}
                onCheckout={handleCheckout}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <FontAwesomeIcon icon={faBuilding} className="text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500">Belum ada unit terisi</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Detail Unit {selectedUnit.unitNumber}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedUnit.status === 'terisi'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedUnit.status === 'terisi' ? 'Unit Terisi' : 'Unit Kosong'}
                </span>
              </div>

              {selectedUnit.status === 'terisi' && selectedUnit.tenant && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">Informasi Penyewa</h4>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Nama Penyewa</p>
                        <p className="font-semibold text-gray-900">{selectedUnit.tenant.name || 'Tamu'}</p>
                      </div>
                    </div>

                    {selectedUnit.tenant.phone && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Nomor Telepon</p>
                          <p className="font-semibold text-gray-900">{selectedUnit.tenant.phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Periode Menginap</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedUnit.tenant.checkIn).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {selectedUnit.tenant.checkInTime && ` ${selectedUnit.tenant.checkInTime}`}
                          {' - '}
                          {new Date(selectedUnit.tenant.checkOut).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {selectedUnit.tenant.checkOutTime && ` ${selectedUnit.tenant.checkOutTime}`}
                        </p>
                      </div>
                    </div>

                    {selectedUnit.tenant.price && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Harga Sewa/Hari</p>
                          <p className="font-semibold text-gray-900">
                            Rp {selectedUnit.tenant.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedUnit.tenant.ktpImage && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Foto KTP</h4>
                      <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={selectedUnit.tenant.ktpImage}
                          alt="KTP"
                          className="w-full h-auto"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Klik gambar untuk memperbesar
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
