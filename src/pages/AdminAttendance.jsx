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
  faDownload,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { 
  getAllAttendance,
  getAllLeaves,
  approveLeave,
  rejectLeave
} from '../services/attendanceService';
import { 
  subscribeToEmployees, 
  addEmployee, 
  deleteEmployee,
  addUser 
} from '../services/firebase';
import { ref, get, remove } from 'firebase/database';
import { database } from '../services/firebase';
import Swal from 'sweetalert2';

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState('today'); // today, history, leaves
  const [allAttendance, setAllAttendance] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    shift: 'Pagi-Sore',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    paymentType: 'monthly'
  });

  useEffect(() => {
    loadData();
    
    // Subscribe to employees
    const unsubscribe = subscribeToEmployees((data) => {
      // If no employees in Firebase, use default employees
      if (data.length === 0) {
        const defaultEmployees = [
          { 
            id: 'default-1',
            email: 'ameliaagustina@bylia.com', 
            name: 'Amelia Agustina', 
            shift: 'Pagi-Sore',
            shiftStart: '09:00',
            shiftEnd: '17:00',
            paymentType: 'monthly'
          },
          { 
            id: 'default-2',
            email: 'devanoerhadinata@bylia.com', 
            name: 'Devano Erhadinata', 
            shift: 'Sore-Malam',
            shiftStart: '17:00',
            shiftEnd: '00:00',
            paymentType: 'weekly'
          }
        ];
        setEmployees(defaultEmployees);
      } else {
        setEmployees(data);
      }
    });
    
    return () => unsubscribe();
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
    const salary = calculateMonthlySalary(emp.email);
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
          a.username === emp.email && 
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

  // Handle add employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    try {
      // Check if this is the first employee being added
      const isFirstEmployee = employees.length > 0 && employees[0].id?.startsWith('default-');
      
      // If first employee, migrate default employees first
      if (isFirstEmployee) {
        const defaultEmployees = [
          {
            name: 'Amelia Agustina',
            email: 'ameliaagustina@bylia.com',
            password: 'amel123',
            shift: 'Pagi-Sore',
            shiftStart: '09:00',
            shiftEnd: '17:00',
            paymentType: 'monthly'
          },
          {
            name: 'Devano Erhadinata',
            email: 'devanoerhadinata@bylia.com',
            password: 'deva123',
            shift: 'Sore-Malam',
            shiftStart: '17:00',
            shiftEnd: '00:00',
            paymentType: 'weekly'
          }
        ];
        
        // Add default employees to Firebase first
        for (const emp of defaultEmployees) {
          const employeeData = {
            name: emp.name,
            email: emp.email,
            shift: emp.shift,
            shiftStart: emp.shiftStart,
            shiftEnd: emp.shiftEnd,
            paymentType: emp.paymentType,
            createdAt: new Date().toISOString()
          };
          
          await addEmployee(employeeData);
          
          const userData = {
            username: emp.email,
            password: emp.password,
            role: 'pegawai',
            name: emp.name,
            shift: {
              start: emp.shiftStart,
              end: emp.shiftEnd,
              name: emp.shift
            },
            paymentType: emp.paymentType
          };
          
          await addUser(userData);
        }
      }
      
      // Add new employee to Firebase
      const employeeData = {
        name: newEmployee.name,
        email: newEmployee.email,
        shift: newEmployee.shift,
        shiftStart: newEmployee.shiftStart,
        shiftEnd: newEmployee.shiftEnd,
        paymentType: newEmployee.paymentType,
        createdAt: new Date().toISOString()
      };
      
      await addEmployee(employeeData);
      
      // Add user account
      const userData = {
        username: newEmployee.email,
        password: newEmployee.password,
        role: 'pegawai',
        name: newEmployee.name,
        shift: {
          start: newEmployee.shiftStart,
          end: newEmployee.shiftEnd,
          name: newEmployee.shift
        },
        paymentType: newEmployee.paymentType
      };
      
      await addUser(userData);
      
      Swal.fire({
        title: 'Berhasil!',
        text: isFirstEmployee 
          ? 'Pegawai berhasil ditambahkan. Amelia & Devano juga sudah disimpan ke Firebase.'
          : 'Pegawai berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 3000
      });
      
      // Reset form
      setNewEmployee({
        name: '',
        email: '',
        password: '',
        shift: 'Pagi-Sore',
        shiftStart: '09:00',
        shiftEnd: '17:00',
        paymentType: 'monthly'
      });
      setShowAddEmployeeModal(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal menambahkan pegawai: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };
  
  // Migrate existing employees to Firebase
  const handleMigrateEmployees = async () => {
    const result = await Swal.fire({
      title: 'Migrate Data Pegawai',
      text: 'Simpan data Amelia & Devano ke Firebase?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal'
    });
    
    if (!result.isConfirmed) return;
    
    const existingEmployees = [
      {
        name: 'Amelia Agustina',
        email: 'ameliaagustina@bylia.com',
        password: 'amel123',
        shift: 'Pagi-Sore',
        shiftStart: '09:00',
        shiftEnd: '17:00',
        paymentType: 'monthly'
      },
      {
        name: 'Devano Erhadinata',
        email: 'devanoerhadinata@bylia.com',
        password: 'deva123',
        shift: 'Sore-Malam',
        shiftStart: '17:00',
        shiftEnd: '00:00',
        paymentType: 'weekly'
      }
    ];
    
    try {
      for (const emp of existingEmployees) {
        // Add employee
        const employeeData = {
          name: emp.name,
          email: emp.email,
          shift: emp.shift,
          shiftStart: emp.shiftStart,
          shiftEnd: emp.shiftEnd,
          paymentType: emp.paymentType,
          createdAt: new Date().toISOString()
        };
        
        await addEmployee(employeeData);
        
        // Add user account
        const userData = {
          username: emp.email,
          password: emp.password,
          role: 'pegawai',
          name: emp.name,
          shift: {
            start: emp.shiftStart,
            end: emp.shiftEnd,
            name: emp.shift
          },
          paymentType: emp.paymentType
        };
        
        await addUser(userData);
      }
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data pegawai berhasil disimpan ke Firebase',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } catch (error) {
      console.error('Migration error:', error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal menyimpan data: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };
  const handleDeleteEmployee = async (employeeId, employeeName) => {
    const result = await Swal.fire({
      title: 'Hapus Pegawai',
      text: `Yakin ingin menghapus ${employeeName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      // Get employee data first to get email
      const employee = employees.find(e => e.id === employeeId);
      
      // Delete from employees collection
      await deleteEmployee(employeeId);
      
      // Delete from users collection
      if (employee && employee.email) {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          const users = snapshot.val();
          
          // Find and delete user by username (email)
          for (const [userId, user] of Object.entries(users)) {
            if (user.username === employee.email) {
              const userRef = ref(database, `users/${userId}`);
              await remove(userRef);
              console.log('User account deleted:', employee.email);
              break;
            }
          }
        }
      }
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pegawai dan akun login berhasil dihapus',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal menghapus pegawai',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
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

        {/* Add Employee Button */}
        <button
          onClick={() => setShowAddEmployeeModal(true)}
          className="w-full mb-2 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Tambah Pegawai Baru
        </button>

        {/* Migrate Button - Always show if using default employees */}
        {employees.length > 0 && employees[0].id?.startsWith('default-') && (
          <button
            onClick={handleMigrateEmployees}
            className="w-full mb-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Simpan Amelia & Devano ke Firebase
          </button>
        )}

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
            
            {employees.length === 0 && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ Tidak ada data pegawai. Silakan tambah pegawai atau klik tombol migrate.
                </p>
              </div>
            )}
            
            {employees.map(emp => {
              const attendance = todayAttendance.find(a => a.username === emp.email);
              
              return (
                <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.shift}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {attendance ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                          ✓ Hadir
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                          Belum Absen
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Pegawai"
                        disabled={emp.id.startsWith('default-')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
              const salary = calculateMonthlySalary(emp.email);
              
              return (
                <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
                              a.username === emp.email && 
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

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Tambah Pegawai Baru</h3>
              <button
                onClick={() => setShowAddEmployeeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Contoh: John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Username Login) *
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Contoh: johndoe@bylia.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Email ini akan digunakan sebagai username login</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                />
              </div>

              {/* Shift Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Shift *
                </label>
                <input
                  type="text"
                  value={newEmployee.shift}
                  onChange={(e) => setNewEmployee({ ...newEmployee, shift: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Contoh: Pagi-Sore"
                  required
                />
              </div>

              {/* Shift Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    value={newEmployee.shiftStart}
                    onChange={(e) => setNewEmployee({ ...newEmployee, shiftStart: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    value={newEmployee.shiftEnd}
                    onChange={(e) => setNewEmployee({ ...newEmployee, shiftEnd: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistem Pembayaran *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewEmployee({ ...newEmployee, paymentType: 'monthly' })}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      newEmployee.paymentType === 'monthly'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📅 Per Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEmployee({ ...newEmployee, paymentType: 'weekly' })}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      newEmployee.paymentType === 'weekly'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📆 Per Minggu
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Catatan:</strong> Setelah pegawai ditambahkan, mereka dapat login menggunakan email dan password yang telah dibuat.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  Tambah Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
