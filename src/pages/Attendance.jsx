import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faCalendarCheck, 
  faSignOutAlt,
  faHistory,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  checkIn, 
  checkOut, 
  getTodayAttendance,
  getAttendanceByUser,
  submitLeave,
  getLeavesByUser
} from '../services/attendanceService';
import Swal from 'sweetalert2';

const Attendance = () => {
  const { user, logout } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);

  // Leave form state
  const [leaveType, setLeaveType] = useState('izin');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  // Manual time input
  const [showManualTime, setShowManualTime] = useState(false);
  const [manualCheckInTime, setManualCheckInTime] = useState('');
  const [manualCheckOutTime, setManualCheckOutTime] = useState('');

  console.log('Attendance component rendered, user:', user);

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    if (user && user.username) {
      loadTodayAttendance();
      loadHistory();
    } else {
      console.log('User not ready yet');
      setLoading(false);
    }
  }, [user?.username]); // Only depend on username

  const loadTodayAttendance = async () => {
    console.log('Loading today attendance for:', user?.username);
    setLoading(true);
    const attendance = await getTodayAttendance(user.username);
    console.log('Today attendance:', attendance);
    setTodayAttendance(attendance);
    setLoading(false);
  };

  const loadHistory = async () => {
    console.log('Loading history for:', user?.username);
    const attendance = await getAttendanceByUser(user.username);
    const leaves = await getLeavesByUser(user.username);
    console.log('Attendance history:', attendance);
    console.log('Leave history:', leaves);
    setAttendanceHistory(attendance.sort((a, b) => b.date.localeCompare(a.date)));
    setLeaveHistory(leaves.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    
    // Use manual time if provided, otherwise use current time
    const timeToUse = manualCheckInTime || new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    const result = await checkIn(user.username, user.name, user.shift, timeToUse);
    
    if (result.success) {
      setTodayAttendance({ id: result.id, ...result.data });
      setManualCheckInTime('');
      setShowManualTime(false);
      Swal.fire({
        title: 'Berhasil!',
        text: 'Absen masuk berhasil dicatat',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } else {
      Swal.fire({
        title: 'Gagal!',
        text: 'Absen masuk gagal: ' + result.error,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
    
    setActionLoading(false);
  };

  const handleCheckOut = async () => {
    const result = await Swal.fire({
      title: 'Absen Pulang',
      text: 'Yakin ingin absen pulang?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Absen Pulang',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;
    
    setActionLoading(true);
    
    // Use manual time if provided, otherwise use current time
    const timeToUse = manualCheckOutTime || new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    const checkoutResult = await checkOut(todayAttendance.id, user.shift, timeToUse);
    
    if (checkoutResult.success) {
      await loadTodayAttendance();
      setManualCheckOutTime('');
      setShowManualTime(false);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Absen pulang berhasil dicatat',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } else {
      Swal.fire({
        title: 'Gagal!',
        text: 'Absen pulang gagal: ' + checkoutResult.error,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
    
    setActionLoading(false);
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const result = await submitLeave(
      user.username,
      user.name,
      leaveType,
      startDate,
      endDate || startDate,
      reason
    );

    if (result.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengajuan izin/cuti berhasil dikirim',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
      setShowLeaveForm(false);
      setLeaveType('izin');
      setStartDate('');
      setEndDate('');
      setReason('');
      loadHistory();
    } else {
      Swal.fire({
        title: 'Gagal!',
        text: 'Pengajuan gagal: ' + result.error,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }

    setActionLoading(false);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white safe-top">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Absensi</h1>
              <p className="text-primary-100 text-sm">Selamat datang, {user.name}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
            </button>
          </div>

          {/* Current Time */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-sm text-primary-100 mb-1">Waktu Sekarang</p>
            <p className="text-3xl font-bold">{currentTime}</p>
            <p className="text-sm text-primary-100 mt-1">
              Shift: {user?.shift?.name || 'N/A'} ({user?.shift?.start || '00:00'} - {user?.shift?.end || '00:00'})
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Absensi Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Absensi Hari Ini</h2>
            <button
              onClick={() => setShowManualTime(!showManualTime)}
              className="text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              {showManualTime ? 'Otomatis' : 'Atur Jam'}
            </button>
          </div>
          
          {todayAttendance ? (
            <div className="space-y-4">
              {/* Masuk Info */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Masuk</p>
                    <p className="text-xl font-bold text-gray-900">{todayAttendance.checkIn}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  ✓ Hadir
                </span>
              </div>

              {/* Pulang Info or Button */}
              {todayAttendance.checkOut ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pulang</p>
                      <p className="text-xl font-bold text-gray-900">{todayAttendance.checkOut}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faClock} />
                  {actionLoading ? 'Memproses...' : 'Absen Pulang'}
                </button>
              )}
              
              {/* Manual Time Input for Pulang */}
              {showManualTime && !todayAttendance.checkOut && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Pulang Manual (opsional)
                  </label>
                  <input
                    type="time"
                    value={manualCheckOutTime}
                    onChange={(e) => setManualCheckOutTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kosongkan untuk menggunakan waktu sekarang
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Manual Time Input for Masuk */}
              {showManualTime && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Masuk Manual (opsional)
                  </label>
                  <input
                    type="time"
                    value={manualCheckInTime}
                    onChange={(e) => setManualCheckInTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kosongkan untuk menggunakan waktu sekarang
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faClock} />
                {actionLoading ? 'Memproses...' : 'Absen Masuk'}
              </button>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon icon={faHistory} className="text-2xl text-primary-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Riwayat</p>
          </button>
          
          <button
            onClick={() => setShowLeaveForm(!showLeaveForm)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon icon={faFileAlt} className="text-2xl text-primary-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Izin/Cuti</p>
          </button>
        </div>

        {/* Leave Form */}
        {showLeaveForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ajukan Izin/Cuti</h3>
            
            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="izin">Izin</option>
                  <option value="cuti">Cuti</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal {leaveType === 'cuti' ? 'Mulai' : ''}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {leaveType === 'cuti' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alasan</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Jelaskan alasan..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveForm(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                >
                  {actionLoading ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* History */}
        {showHistory && (
          <div className="space-y-4">
            {/* Attendance History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Riwayat Absensi</h3>
              
              {attendanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {attendanceHistory.slice(0, 10).map((record) => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {new Date(record.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Masuk: {record.checkIn}</span>
                        <span>Pulang: {record.checkOut || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Belum ada riwayat</p>
              )}
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Riwayat Izin/Cuti</h3>
              
              {leaveHistory.length > 0 ? (
                <div className="space-y-3">
                  {leaveHistory.map((leave) => (
                    <div key={leave.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900 capitalize">{leave.type}</p>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {leave.status === 'approved' ? 'Disetujui' :
                           leave.status === 'rejected' ? 'Ditolak' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {new Date(leave.startDate).toLocaleDateString('id-ID')}
                        {leave.endDate && leave.endDate !== leave.startDate && 
                          ` - ${new Date(leave.endDate).toLocaleDateString('id-ID')}`
                        }
                      </p>
                      <p className="text-sm text-gray-500">{leave.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Belum ada pengajuan</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
