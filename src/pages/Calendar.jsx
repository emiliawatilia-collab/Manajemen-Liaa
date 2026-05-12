import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt, faPlus, faUser, faBuilding, faSun } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useUnits } from '../hooks/useUnits';

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { units, loading } = useUnits();

  // Get month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Navigation
  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Check if unit is occupied on a specific date
  const isUnitOccupied = (unit, date) => {
    if (!unit || unit.status !== 'terisi' || !unit.tenant) return false;
    
    try {
      const checkDate = new Date(year, month, date);
      checkDate.setHours(0, 0, 0, 0);
      
      const checkIn = new Date(unit.tenant.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      
      const checkOut = new Date(unit.tenant.checkOut);
      checkOut.setHours(0, 0, 0, 0);
      
      return checkDate >= checkIn && checkDate <= checkOut;
    } catch (error) {
      return false;
    }
  };

  const getTenantName = (unit) => {
    if (!unit || !unit.tenant) return '';
    if (!unit.tenant.name || unit.tenant.name.trim() === '') return 'Tamu';
    return unit.tenant.name.split(' ')[0];
  };

  const getTenantTime = (unit, date) => {
    if (!unit || !unit.tenant) return '';
    
    const checkDate = new Date(year, month, date);
    checkDate.setHours(0, 0, 0, 0);
    
    const checkIn = new Date(unit.tenant.checkIn);
    checkIn.setHours(0, 0, 0, 0);
    
    const checkOut = new Date(unit.tenant.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    
    const isCheckInDate = checkDate.getTime() === checkIn.getTime();
    const isCheckOutDate = checkDate.getTime() === checkOut.getTime();
    const isSameDay = isCheckInDate && isCheckOutDate;
    
    // If same day booking (transit)
    if (isSameDay && unit.tenant.checkInTime && unit.tenant.checkOutTime) {
      return `${unit.tenant.checkInTime}-${unit.tenant.checkOutTime}`;
    }
    
    // If check-in date with time
    if (isCheckInDate && unit.tenant.checkInTime) {
      return `${unit.tenant.checkInTime}`;
    }
    
    // If check-out date with time
    if (isCheckOutDate && unit.tenant.checkOutTime) {
      return `${unit.tenant.checkOutTime}`;
    }
    
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top sticky top-0 z-20">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Kalender Booking</h1>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Hari Ini
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <FontAwesomeIcon icon={faChevronLeft} className="text-2xl" />
            </button>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-xl" />
              <span className="text-lg font-semibold">{monthName}</span>
            </div>
            <button onClick={goToNextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <FontAwesomeIcon icon={faChevronRight} className="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-gray-900">{units.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total Unit</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-red-600">
              {units.filter(u => u.status === 'terisi').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Terisi</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">
              {units.filter(u => u.status === 'kosong').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Kosong</div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">Belum ada unit</p>
            <p className="text-sm text-gray-400 mb-4">Tambah unit untuk mulai menggunakan kalender</p>
            <button
              onClick={() => navigate('/units')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              Tambah Unit
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto">
            {/* Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {/* Unit Header */}
                  <th className="sticky left-0 z-20 bg-gray-50 border-r-2 border-gray-200 p-3 text-left">
                    <span className="text-xs font-bold text-gray-600">UNIT</span>
                  </th>
                  
                  {/* Date Headers */}
                  {dates.map((date) => {
                    const dayOfWeek = new Date(year, month, date).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const today = new Date();
                    const isToday = 
                      date === today.getDate() && 
                      month === today.getMonth() && 
                      year === today.getFullYear();
                    
                    return (
                      <th
                        key={date}
                        className={`min-w-[64px] p-2 text-center border-r border-gray-200 ${
                          isToday ? 'bg-primary-100' : isWeekend ? 'bg-red-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`text-xs font-bold ${
                          isToday ? 'text-primary-600' : 'text-gray-600'
                        }`}>
                          {date}
                        </div>
                        <div className={`text-[10px] ${
                          isToday ? 'text-primary-500' : 'text-gray-400'
                        }`}>
                          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dayOfWeek]}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* Unit Number */}
                    <td className="sticky left-0 z-10 bg-white border-r border-gray-200 p-3">
                      <span className="text-sm font-bold text-gray-900">{unit.unitNumber}</span>
                    </td>
                    
                    {/* Date Cells */}
                    {dates.map((date) => {
                      const occupied = isUnitOccupied(unit, date);
                      const tenantName = occupied ? getTenantName(unit) : '';
                      const tenantTime = occupied ? getTenantTime(unit, date) : '';
                      const isFirstDay = occupied && (date === 1 || !isUnitOccupied(unit, date - 1));
                      
                      return (
                        <td
                          key={date}
                          className={`min-w-[64px] p-2 border-r border-gray-100 min-h-[60px] align-top ${
                            occupied ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-white'
                          }`}
                        >
                          {isFirstDay && tenantName && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-xs">👤</span>
                                <span className="text-xs font-bold text-red-700">
                                  {tenantName}
                                </span>
                              </div>
                              {tenantTime && (
                                <div className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                  🕐 {tenantTime}
                                </div>
                              )}
                              {unit.tenant?.phone && (
                                <div className="text-[9px] text-red-600">
                                  📞 {unit.tenant.phone.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          )}
                          {occupied && !isFirstDay && (
                            <div className="flex items-center justify-center h-full">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-600" />
            Keterangan
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-red-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Unit Terisi</div>
                <div className="text-xs text-gray-500">Ada penyewa, tampil nama + nomor HP</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border-l-4 border-gray-300">
              <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Unit Kosong</div>
                <div className="text-xs text-gray-500">Tidak ada penyewa, siap disewakan</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-primary-50 rounded-lg border-l-4 border-primary-500">
              <div className="w-8 h-8 bg-primary-100 border-2 border-primary-300 rounded flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Hari Ini</div>
                <div className="text-xs text-gray-500">Tanggal hari ini (biru)</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border-l-4 border-pink-300">
              <div className="w-8 h-8 bg-red-50 border-2 border-pink-200 rounded flex items-center justify-center">
                <FontAwesomeIcon icon={faSun} className="text-pink-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">Weekend</div>
                <div className="text-xs text-gray-500">Sabtu & Minggu (pink muda)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
