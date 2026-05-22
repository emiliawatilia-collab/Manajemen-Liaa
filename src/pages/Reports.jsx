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
import jsPDF from 'jspdf';

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

  // Get all bookings from history (including all past bookings)
  const getAllBookings = () => {
    const bookings = [];
    const seenBookings = new Set(); // Track unique bookings
    
    units.forEach(unit => {
      // Current tenant
      if (unit.tenant) {
        const bookingKey = `${unit.unitNumber}-${unit.tenant.name}-${unit.tenant.checkIn}-${unit.tenant.checkOut}`;
        if (!seenBookings.has(bookingKey)) {
          bookings.push({
            ...unit.tenant,
            unitNumber: unit.unitNumber,
            unitId: unit.id,
            firebaseId: unit.firebaseId,
            isCurrent: unit.status === 'terisi'
          });
          seenBookings.add(bookingKey);
        }
      }
      
      // History
      if (unit.history && unit.history.length > 0) {
        unit.history.forEach(hist => {
          const bookingKey = `${unit.unitNumber}-${hist.name}-${hist.checkIn}-${hist.checkOut}`;
          if (!seenBookings.has(bookingKey)) {
            bookings.push({
              ...hist,
              unitNumber: unit.unitNumber,
              unitId: unit.id,
              firebaseId: unit.firebaseId,
              isCurrent: false
            });
            seenBookings.add(bookingKey);
          }
        });
      }
    });
    
    console.log('Total bookings found:', bookings.length);
    return bookings;
  };

  // Get ALL units with their booking history (not filtered by month)
  const getAllUnitsWithHistory = () => {
    const allBookings = getAllBookings();
    
    // Group all bookings by unit
    const bookingsByUnit = {};
    
    // Initialize all units (even those without bookings)
    units.forEach(unit => {
      bookingsByUnit[unit.unitNumber] = {
        unitNumber: unit.unitNumber,
        bookings: [],
        totalRevenue: 0,
        totalBookings: 0
      };
    });
    
    // Add bookings to their respective units
    allBookings.forEach(booking => {
      const unitNumber = booking.unitNumber;
      if (bookingsByUnit[unitNumber]) {
        // Check if this booking already exists (avoid duplicates)
        const isDuplicate = bookingsByUnit[unitNumber].bookings.some(b => 
          b.name === booking.name && 
          b.checkIn === booking.checkIn && 
          b.checkOut === booking.checkOut
        );
        
        if (!isDuplicate) {
          bookingsByUnit[unitNumber].bookings.push(booking);
          bookingsByUnit[unitNumber].totalRevenue += (booking.price || 0);
          bookingsByUnit[unitNumber].totalBookings += 1;
        }
      }
    });
    
    // Convert to array and sort by total revenue (highest first)
    return Object.values(bookingsByUnit).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const allUnitsWithHistory = getAllUnitsWithHistory();
  
  // Debug: Log untuk melihat data
  useEffect(() => {
    console.log('All units with history:', allUnitsWithHistory);
    console.log('Total units:', units.length);
  }, [allUnitsWithHistory, units]);

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

  // Get units for selected month (including units without bookings)
  const getUnitsForSelectedMonth = () => {
    // Group monthly bookings by unit
    const bookingsByUnit = {};
    
    // Initialize ALL units first
    units.forEach(unit => {
      bookingsByUnit[unit.unitNumber] = {
        unitNumber: unit.unitNumber,
        bookings: [],
        totalRevenue: 0,
        totalBookings: 0
      };
    });
    
    // Add bookings for this month
    monthlyBookings.forEach(booking => {
      const unitNumber = booking.unitNumber;
      if (bookingsByUnit[unitNumber]) {
        // Check if this booking already exists (avoid duplicates)
        const isDuplicate = bookingsByUnit[unitNumber].bookings.some(b => 
          b.name === booking.name && 
          b.checkIn === booking.checkIn && 
          b.checkOut === booking.checkOut
        );
        
        if (!isDuplicate) {
          bookingsByUnit[unitNumber].bookings.push(booking);
          bookingsByUnit[unitNumber].totalRevenue += (booking.price || 0);
          bookingsByUnit[unitNumber].totalBookings += 1;
        }
      }
    });
    
    // Convert to array and sort: units with bookings first (by revenue), then units without bookings (by unit number)
    return Object.values(bookingsByUnit).sort((a, b) => {
      if (a.totalBookings > 0 && b.totalBookings === 0) return -1;
      if (a.totalBookings === 0 && b.totalBookings > 0) return 1;
      if (a.totalBookings > 0 && b.totalBookings > 0) return b.totalRevenue - a.totalRevenue;
      return parseInt(a.unitNumber) - parseInt(b.unitNumber);
    });
  };

  const unitsForSelectedMonth = getUnitsForSelectedMonth();

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

  // Export to PDF
  const exportReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    
    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('LAPORAN PENDAPATAN', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('SewaApartemenByLia', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Periode: ${months[selectedMonth]} ${selectedYear}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, yPos, { align: 'center' });
    
    // Line separator
    yPos += 8;
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Summary
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RINGKASAN', 15, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Pendapatan: ${formatCurrency(totalRevenue)}`, 20, yPos);
    
    yPos += 6;
    doc.text(`Total Booking: ${totalBookings}`, 20, yPos);
    
    yPos += 6;
    doc.text(`Unit Aktif: ${uniqueUnits}`, 20, yPos);
    
    // Line separator
    yPos += 8;
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Detail per unit
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DETAIL PER UNIT', 15, yPos);
    
    yPos += 8;
    
    unitsForSelectedMonth.forEach((item, index) => {
      // Check if need new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      // Unit header
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. Unit ${item.unitNumber}`, 15, yPos);
      
      yPos += 6;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      if (item.totalBookings > 0) {
        doc.text(`Total: ${item.totalBookings} booking | ${formatCurrency(item.totalRevenue)}`, 20, yPos);
        yPos += 6;
        
        // Bookings detail
        item.bookings
          .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))
          .forEach((booking, idx) => {
            // Check if need new page
            if (yPos > pageHeight - 30) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFontSize(9);
            doc.text(`   ${idx + 1}) ${booking.name || 'Tamu'}`, 20, yPos);
            
            yPos += 5;
            doc.setFontSize(8);
            doc.text(`      ${new Date(booking.checkIn).toLocaleDateString('id-ID')} - ${new Date(booking.checkOut).toLocaleDateString('id-ID')}`, 20, yPos);
            
            yPos += 5;
            doc.text(`      ${formatCurrency(booking.price || 0)} | ${booking.isCurrent ? 'Sedang Menginap' : 'Selesai'}`, 20, yPos);
            
            yPos += 6;
          });
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text(`Tidak ada booking di ${months[selectedMonth]}`, 20, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 6;
      }
      
      yPos += 4;
    });
    
    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Dokumen ini dibuat secara otomatis oleh sistem SewaApartemenByLia', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save PDF
    doc.save(`Laporan_${months[selectedMonth]}_${selectedYear}.pdf`);
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
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Semua Unit - {months[selectedMonth]} {selectedYear}
        </h2>
        
        {unitsForSelectedMonth.length > 0 ? (
          <div className="space-y-3">
            {unitsForSelectedMonth.map((item) => (
              <div key={item.unitNumber} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {item.totalBookings > 0 ? (
                  // Unit with bookings - clickable
                  <>
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
                          <p className="text-sm text-gray-500">{item.totalBookings} booking</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatShortCurrency(item.totalRevenue)}</p>
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
                        <div className="py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-700">
                            Total: {item.totalBookings} booking • {formatCurrency(item.totalRevenue)}
                          </p>
                        </div>
                        <div className="space-y-3 mt-3">
                          {item.bookings
                            .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))
                            .map((booking, index) => (
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
                                  {booking.isCurrent ? 'Sedang Menginap' : 'Selesai'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  {new Date(booking.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {' - '}
                                  {new Date(booking.checkOut).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                  </>
                ) : (
                  // Unit without bookings - not clickable
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Unit {item.unitNumber}</p>
                        <p className="text-sm text-gray-500">Tidak ada booking di {months[selectedMonth]}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <FontAwesomeIcon icon={faChartLine} className="text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500">Tidak ada data unit</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
