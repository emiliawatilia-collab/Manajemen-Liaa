import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faCalendarCheck, 
  faClipboardList,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faMoneyBillWave,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { 
  getAllAttendance,
  getAllLeaves,
  approveLeave,
  rejectLeave
} from '../services/attendanceService';
import Swal from 'sweetalert2';

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState('today'); // today, history, leaves
  const [allAttendance, setAllAttendance] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const attendance = await getAllAttendance();
    const leaves = await getAllLeaves();
    setAllAttendance(attendance);
    setAllLeaves(leaves);
    setLoading(false);
  };

  const handleApproveLeave = async (leaveId) => {
    const result = await Swal.fire({
      title: 'Setujui Pengajuan',
      text: 'Yakin ingin menyetujui pengajuan ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;
    
    const approveResult = await approveLeave(leaveId);
    if (approveResult.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengajuan berhasil disetujui',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
      loadData();
    } else {
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal: ' + approveResult.error,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleRejectLeave = async (leaveId) => {
    const result = await Swal.fire({
      title: 'Tolak Pengajuan',
      text: 'Yakin ingin menolak pengajuan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Tolak',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;
    
    const rejectResult = await rejectLeave(leaveId);
    if (rejectResult.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengajuan berhasil ditolak',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
      loadData();
    } else {
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal: ' + rejectResult.error,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Export salary data
  const exportSalaryData = (emp) => {
    const salary = calculateMonthlySalary(emp.username);
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    let text = '';
    text += '═══════════════════════════════════\n';
    text += '       SLIP GAJI PEGAWAI\n';
    text += '    SewaApartemenByLia\n';
    text += '═══════════════════════════════════\n\n';
    text += `Nama      : ${emp.name}\n`;
    text += `Periode   : ${monthName}\n`;
    text += `Shift     : ${emp.shift}\n`;
    text += `Sistem    : ${emp.paymentType === 'monthly' ? 'Per Bulan' : 'Per Minggu'}\n\n`;
    text += '───────────────────────────────────\n';
    
    if (emp.paymentType === 'monthly') {
      // Monthly breakdown
      text += 'RINCIAN GAJI:\n\n';
      text += `Hari Kerja       : ${salary.workDays} hari\n`;
      text += `Gaji Harian      : Rp 60.000 x ${salary.workDays}\n`;
      text += `                 : Rp ${(salary.workDays * 60000).toLocaleString('id-ID')}\n\n`;
      text += `Hari Lembur      : ${salary.overtimeDays} hari\n`;
      text += `Bonus Lembur     : Rp 30.000 x ${salary.overtimeDays}\n`;
      text += `                 : Rp ${(salary.overtimeDays * 30000).toLocaleString('id-ID')}\n\n`;
    } else {
      // Weekly breakdown
      text += 'RINCIAN GAJI PER MINGGU:\n\n';
      
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]) - 1;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      let currentWeekStart = new Date(firstDay);
      const dayOfWeek = currentWeekStart.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      currentWeekStart.setDate(currentWeekStart.getDate() + diff);
      
      let weekNum = 1;
      while (currentWeekStart <= lastDay) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekStartStr = currentWeekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        
        const weekAttendance = allAttendance.filter(a => 
          a.username === emp.username && 
          a.date >= weekStartStr && 
          a.date <= weekEndStr &&
          a.checkOut
        );
        
        const weekWorkDays = weekAttendance.length;
        const weekOvertimeDays = weekAttendance.filter(a => a.overtime).length;
        const weekSalary = (weekWorkDays * 60000) + (weekOvertimeDays * 30000);
        
        const startDate = currentWeekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const endDate = weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        text += `Minggu ${weekNum} (${startDate} - ${endDate})\n`;
        text += `  Hari Kerja  : ${weekWorkDays} hari\n`;
        text += `  Lembur      : ${weekOvertimeDays} hari\n`;
        text += `  Total       : Rp ${weekSalary.toLocaleString('id-ID')}\n\n`;
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekNum++;
      }
    }
    
    text += '───────────────────────────────────\n';
    text += `TOTAL GAJI ${monthName.toUpperCase()}\n`;
    text += `Rp ${salary.totalSalary.toLocaleString('id-ID')}\n`;
    text += '═══════════════════════════════════\n\n';
    text += 'Terima kasih atas dedikasi Anda!\n';
    text += 'SewaApartemenByLia\n';
    
    // Create and download file
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Slip_Gaji_${emp.name.replace(/\s+/g, '_')}_${selectedMonth}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    Swal.fire({
      title: 'Berhasil!',
      text: 'Slip gaji berhasil diunduh',
      icon: 'success',
      confirmButtonColor: '#3b82f6',
      timer: 2000
    });
  };

  // Get today's attendance
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = allAttendance.filter(a => a.date === todayDate);

  // Get pending leaves
  const pendingLeaves = allLeaves.filter(l => l.status === 'pending');

  // Calculate monthly salary
  const calculateMonthlySalary = (username) => {
    const monthAttendance = allAttendance.filter(a => 
      a.username === username && a.date.startsWith(selectedMonth)
    );
    
    const workDays = monthAttendance.filter(a => a.checkOut).length;
    const overtimeDays = monthAttendance.filter(a => a.overtime).length;
    
    const dailyWage = 60000;
    const overtimeBonus = 30000;
    
    const totalSalary = (workDays * dailyWage) + (overtimeDays * overtimeBonus);
    
    return {
      workDays,
      overtimeDays,
      totalSalary
    };
  };

  const employees = [
    { 
      username: 'ameliaagustina@bylia.com', 
      name: 'Amelia Agustina', 
      shift: 'Pagi-Sore',
      paymentType: 'monthly'
    },
    { 
      username: 'devanoerhadinata@bylia.com', 
      name: 'Devano Erhadinata', 
      shift: 'Sore-Malam',
      paymentType: 'weekly'
    }
  ];

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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top">
        <div className="px-4 pt-6 pb-8">
          <h1 className="text-2xl font-bold mb-1">Monitoring Absensi</h1>
          <p className="text-primary-100 text-sm">Kelola absensi & izin pegawai</p>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <FontAwesomeIcon icon={faUsers} className="text-2xl text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            <p className="text-xs text-gray-600">Pegawai</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{todayAttendance.length}</p>
            <p className="text-xs text-gray-600">Hadir Hari Ini</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{pendingLeaves.length}</p>
            <p className="text-xs text-gray-600">Izin Pending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'today'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'leaves'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Izin/Cuti
              {pendingLeaves.length > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'salary'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gaji
            </button>
          </div>
        </div>

        {/* Today's Attendance */}
        {activeTab === 'today' && (
          <div className="space-y-3 pb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Absensi Hari Ini</h3>
            
            {employees.map(emp => {
              const attendance = todayAttendance.find(a => a.username === emp.username);
              
              return (
                <div key={emp.username} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.shift}</p>
                    </div>
                    {attendance ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        ✓ Hadir
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                        Belum Absen
                      </span>
                    )}
                  </div>
                  
                  {attendance && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Masuk</p>
                        <p className="text-lg font-bold text-gray-900">{attendance.checkIn}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Pulang</p>
                        <p className="text-lg font-bold text-gray-900">
                          {attendance.checkOut || '-'}
                        </p>
                      </div>
                      {attendance.overtime && (
                        <div className="col-span-2 bg-yellow-50 rounded-lg p-3 text-center">
                          <p className="text-sm font-medium text-yellow-700">
                            💰 Lembur (+Rp 30.000)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Leaves Management */}
        {activeTab === 'leaves' && (
          <div className="space-y-3 pb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Pengajuan Izin/Cuti</h3>
            
            {allLeaves.length > 0 ? (
              allLeaves.map(leave => (
                <div key={leave.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{leave.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{leave.type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {leave.status === 'approved' ? (
                        <><FontAwesomeIcon icon={faCheckCircle} /> Disetujui</>
                      ) : leave.status === 'rejected' ? (
                        <><FontAwesomeIcon icon={faTimesCircle} /> Ditolak</>
                      ) : (
                        <><FontAwesomeIcon icon={faHourglassHalf} /> Pending</>
                      )}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      {new Date(leave.startDate).toLocaleDateString('id-ID')}
                      {leave.endDate && leave.endDate !== leave.startDate && 
                        ` - ${new Date(leave.endDate).toLocaleDateString('id-ID')}`
                      }
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 mt-2">
                      {leave.reason}
                    </p>
                  </div>
                  
                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveLeave(leave.id)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} /> Setujui
                      </button>
                      <button
                        onClick={() => handleRejectLeave(leave.id)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">Belum ada pengajuan izin/cuti</p>
              </div>
            )}
          </div>
        )}

        {/* Salary Calculation */}
        {activeTab === 'salary' && (
          <div className="space-y-3 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Perhitungan Gaji</h3>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {employees.map(emp => {
              const salary = calculateMonthlySalary(emp.username);
              
              return (
                <div key={emp.username} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.shift}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        emp.paymentType === 'monthly' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {emp.paymentType === 'monthly' ? '📅 Per Bulan' : '📆 Per Minggu'}
                      </span>
                    </div>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-2xl text-green-600" />
                  </div>
                  
                  {emp.paymentType === 'monthly' ? (
                    // Monthly Payment
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Hari Kerja</span>
                          <span className="font-semibold text-gray-900">{salary.workDays} hari</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Gaji Harian (Rp 60.000)</span>
                          <span className="font-semibold text-gray-900">
                            Rp {(salary.workDays * 60000).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Lembur ({salary.overtimeDays} hari)</span>
                          <span className="font-semibold text-gray-900">
                            Rp {(salary.overtimeDays * 30000).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-gray-900">Total Gaji Bulan Ini</span>
                          <span className="text-2xl font-bold text-green-600">
                            Rp {salary.totalSalary.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <button
                          onClick={() => exportSalaryData(emp)}
                          className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          Ekspor Slip Gaji
                        </button>
                      </div>
                    </>
                  ) : (
                    // Weekly Payment
                    <>
                      <div className="space-y-3 mb-4">
                        {/* Get weeks in selected month */}
                        {(() => {
                          const year = parseInt(selectedMonth.split('-')[0]);
                          const month = parseInt(selectedMonth.split('-')[1]) - 1;
                          const firstDay = new Date(year, month, 1);
                          const lastDay = new Date(year, month + 1, 0);
                          
                          // Calculate weeks
                          const weeks = [];
                          let currentWeekStart = new Date(firstDay);
                          
                          // Adjust to Monday
                          const dayOfWeek = currentWeekStart.getDay();
                          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                          currentWeekStart.setDate(currentWeekStart.getDate() + diff);
                          
                          let weekNum = 1;
                          while (currentWeekStart <= lastDay) {
                            const weekEnd = new Date(currentWeekStart);
                            weekEnd.setDate(weekEnd.getDate() + 6);
                            
                            const weekStartStr = currentWeekStart.toISOString().split('T')[0];
                            const weekEndStr = weekEnd.toISOString().split('T')[0];
                            
                            // Count work days in this week
                            const weekAttendance = allAttendance.filter(a => 
                              a.username === emp.username && 
                              a.date >= weekStartStr && 
                              a.date <= weekEndStr &&
                              a.checkOut
                            );
                            
                            const weekWorkDays = weekAttendance.length;
                            const weekOvertimeDays = weekAttendance.filter(a => a.overtime).length;
                            const weekSalary = (weekWorkDays * 60000) + (weekOvertimeDays * 30000);
                            
                            weeks.push({
                              num: weekNum,
                              start: currentWeekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                              end: weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                              workDays: weekWorkDays,
                              overtimeDays: weekOvertimeDays,
                              salary: weekSalary
                            });
                            
                            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
                            weekNum++;
                          }
                          
                          return weeks.map((week, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  Minggu {week.num} ({week.start} - {week.end})
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  Rp {week.salary.toLocaleString('id-ID')}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>{week.workDays} hari kerja</span>
                                <span>{week.overtimeDays} hari lembur</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-gray-900">Total Bulan Ini</span>
                          <span className="text-2xl font-bold text-green-600">
                            Rp {salary.totalSalary.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <button
                          onClick={() => exportSalaryData(emp)}
                          className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          Ekspor Slip Gaji
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Gaji harian Rp 60.000, bonus lembur Rp 30.000 per hari. 
                Lembur dihitung jika pulang lebih dari 1 jam setelah jam kerja selesai.
                <br />
                <strong>Amelia:</strong> Gaji dibayar per bulan.
                <br />
                <strong>Devano:</strong> Gaji dibayar per minggu.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
