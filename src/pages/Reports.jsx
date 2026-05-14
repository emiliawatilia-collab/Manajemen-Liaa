import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faCalendar, 
  faDollarSign, 
  faBuilding,
  faChevronDown,
  faChevronUp,
  faFileExport
} from '@fortawesome/free-solid-svg-icons';
import { useUnits } from '../hooks/useUnits';

const Reports = () => {
  const { units, loading } = useUnits();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedUnit, setExpandedUnit] = useState(null);

  // Generate list of months
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Generate years (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Get all bookings from history
  const getAllBookings = () => {
    const bookings = [];
    
    units.forEach(unit => {
      // Current tenant
      if (unit.tenant) {
        bookings.push({
          ...unit.tenant,
          unitNumber: unit.unitNumber,
          unitId: unit.id,
          firebaseId: unit.firebaseId,
          isCurrent: unit.status === 'terisi'
        });
      }
      
      // History
      if (unit.history && unit.history.length > 0) {
        unit.history.forEach(hist => {
          bookings.push({
            ...hist,
            unitNumber: unit.unitNumber,
            unitId: unit.id,
            firebaseId: unit.firebaseId,
            isCurrent: false
          });
        });
      }
    });
    
    return bookings;
  };

  // Filter bookings by month and year
  const getMonthlyBookings = () => {
    const allBookings = getAllBookings();
    
    return allBookings.filter(booking => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      
      // Check if booking overlaps with selected month
      const monthStart = new Date(selectedYear, selectedMonth, 1);
      const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
      
      return (
        (checkInDate <= monthEnd && checkOutDate >= monthStart)
      );
    });
  };

  const monthlyBookings = getMonthlyBookings();

  // Calculate statistics
  const totalRevenue = monthlyBookings.reduce((sum, booking) => {
    return sum + (booking.price || 0);
  }, 0);

  const totalBookings = monthlyBookings.length;

  const uniqueUnits = new Set(monthlyBookings.map(b => b.unitNumber)).size;

  // Group bookings by unit
  const bookingsByUnit = monthlyBookings.reduce((acc, booking) => {
    const unit = booking.unitNumber;
    if (!acc[unit]) {
      acc[unit] = [];
    }
    acc[unit].push(booking);
    return acc;
  }, {});

  // Calculate revenue per unit
  const revenueByUnit = Object.entries(bookingsByUnit).map(([unitNumber, bookings]) => {
    const revenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    return {
      unitNumber,
      bookings: bookings.length,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format short currency
  const formatShortCurrency = (amount) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`;
    } else {
      return `Rp ${amount}`;
    }
  };

  // Export to text
  const exportReport = () => {
    let report = `LAPORAN PENDAPATAN\n`;
    report += `Periode: ${months[selectedMonth]} ${selectedYear}\n`;
    report += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n`;
    report += `\n${'='.repeat(50)}\n\n`;
    
    report += `RINGKASAN:\n`;
    report += `- Total Pendapatan: ${formatCurrency(totalRevenue)}\n`;
    report += `- Total Booking: ${totalBookings}\n`;
    report += `- Unit Aktif: ${uniqueUnits}\n`;
    report += `\n${'='.repeat(50)}\n\n`;
    
    report += `DETAIL PER UNIT:\n\n`;
    
    revenueByUnit.forEach((item, index) => {
      report += `${index + 1}. Unit ${item.unitNumber}\n`;
      report += `   Booking: ${item.bookings}x\n`;
      report += `   Revenue: ${formatCurrency(item.revenue)}\n`;
      
      const unitBookings = bookingsByUnit[item.unitNumber];
      unitBookings.forEach((booking, idx) => {
        report += `   ${idx + 1}) ${booking.name || 'Tamu'}\n`;
        report += `      ${new Date(booking.checkIn).toLocaleDateString('id-ID')} - ${new Date(booking.checkOut).toLocaleDateString('id-ID')}\n`;
        report += `      ${formatCurrency(booking.price || 0)}\n`;
      });
      report += `\n`;
    });
    
    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_${months[selectedMonth]}_${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top">
        <div className="px-4 pt-6 pb-8">
          <h1 className="text-2xl font-bold mb-1">Laporan Pendapatan</h1>
          <p className="text-primary-100 text-sm">SewaApartemenByLia</p>
        </div>
      </div>

      {/* Month & Year Selector */}
      <div className="px-4 -mt-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-2">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-1 gap-3">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon icon={faDollarSign} className="text-2xl opacity-80" />
              <span className="text-sm opacity-90">Total Pendapatan</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm opacity-90 mt-1">{months[selectedMonth]} {selectedYear}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendar} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Booking</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faBuilding} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unit Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueUnits}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="px-4 mb-6">
        <button
          onClick={exportReport}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faFileExport} />
          Export Laporan
        </button>
      </div>

      {/* Revenue by Unit */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pendapatan per Unit</h2>
        
        {revenueByUnit.length > 0 ? (
          <div className="space-y-3">
            {revenueByUnit.map((item) => (
              <div key={item.unitNumber} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedUnit(expandedUnit === item.unitNumber ? null : item.unitNumber)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faBuilding} className="text-primary-600 text-lg" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Unit {item.unitNumber}</p>
                      <p className="text-sm text-gray-500">{item.bookings} booking</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatShortCurrency(item.revenue)}</p>
                    </div>
                    <FontAwesomeIcon 
                      icon={expandedUnit === item.unitNumber ? faChevronUp : faChevronDown} 
                      className="text-gray-400"
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedUnit === item.unitNumber && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-3 mt-3">
                      {bookingsByUnit[item.unitNumber].map((booking, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{booking.name || 'Tamu'}</p>
                              <p className="text-xs text-gray-500">{booking.phone || '-'}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              booking.isCurrent 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {booking.isCurrent ? 'Aktif' : 'Selesai'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {new Date(booking.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              {' - '}
                              {new Date(booking.checkOut).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(booking.price || 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <FontAwesomeIcon icon={faChartLine} className="text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500">Tidak ada data untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
