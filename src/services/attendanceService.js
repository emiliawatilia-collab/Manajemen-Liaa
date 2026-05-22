import { ref, push, set, get, update } from 'firebase/database';
import { database } from './firebase';
import { sendAttendanceNotification } from './notificationService';

// Check-in
export const checkIn = async (username, name, shift, customTime = null) => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = customTime || now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    const attendanceData = {
      username,
      name,
      date: dateStr,
      checkIn: timeStr,
      checkOut: null,
      shift: shift,
      overtime: false,
      status: 'hadir',
      timestamp: now.toISOString()
    };

    const attendanceRef = ref(database, 'attendance');
    const newAttendanceRef = push(attendanceRef);
    await set(newAttendanceRef, attendanceData);

    // Send notification to admin
    await sendAttendanceNotification(name, 'check-in', timeStr);

    return { success: true, id: newAttendanceRef.key, data: attendanceData };
  } catch (error) {
    console.error('Error check-in:', error);
    return { success: false, error: error.message };
  }
};

// Check-out
export const checkOut = async (attendanceId, shift, customTime = null) => {
  try {
    const now = new Date();
    const timeStr = customTime || now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // Calculate if overtime (with 1 hour tolerance)
    const [checkOutHour, checkOutMinute] = timeStr.split(':').map(Number);
    const [shiftEndHour, shiftEndMinute] = shift.end.split(':').map(Number);
    
    // Add 1 hour tolerance to shift end time
    let toleranceHour = shiftEndHour + 1;
    let toleranceMinute = shiftEndMinute;
    
    // Handle 24-hour overflow
    if (toleranceHour >= 24) {
      toleranceHour = toleranceHour - 24;
    }
    
    let overtime = false;
    
    // Handle midnight crossing for shift 2 (17:00-00:00)
    // Tolerance becomes 01:00 (00:00 + 1 hour)
    if (shiftEndHour === 0) {
      // If checkout after 01:00
      if (checkOutHour > toleranceHour || 
         (checkOutHour === toleranceHour && checkOutMinute > toleranceMinute)) {
        overtime = true;
      }
    } else {
      // Normal shift
      // For shift 1 (09:00-17:00), tolerance is 18:00
      if (checkOutHour > toleranceHour || 
         (checkOutHour === toleranceHour && checkOutMinute > toleranceMinute)) {
        overtime = true;
      }
    }

    const attendanceRef = ref(database, `attendance/${attendanceId}`);
    await update(attendanceRef, {
      checkOut: timeStr,
      overtime: overtime
    });

    // Get employee name for notification
    const snapshot = await get(attendanceRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      await sendAttendanceNotification(data.name, 'check-out', timeStr);
    }

    return { success: true, overtime };
  } catch (error) {
    console.error('Error check-out:', error);
    return { success: false, error: error.message };
  }
};

// Get today's attendance for user
export const getTodayAttendance = async (username) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendanceRef = ref(database, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Find today's record for this user
      for (const [id, record] of Object.entries(data)) {
        if (record.username === username && record.date === today) {
          return { id, ...record };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting today attendance:', error);
    return null;
  }
};

// Get all attendance (for admin)
export const getAllAttendance = async () => {
  try {
    const attendanceRef = ref(database, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([id, record]) => ({
        id,
        ...record
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting all attendance:', error);
    return [];
  }
};

// Get attendance by user
export const getAttendanceByUser = async (username) => {
  try {
    const attendanceRef = ref(database, 'attendance');
    const snapshot = await get(attendanceRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const userAttendance = [];
      
      for (const [id, record] of Object.entries(data)) {
        if (record.username === username) {
          userAttendance.push({ id, ...record });
        }
      }
      
      return userAttendance;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user attendance:', error);
    return [];
  }
};

// Submit leave request (izin/cuti)
export const submitLeave = async (username, name, type, startDate, endDate, reason) => {
  try {
    const leaveData = {
      username,
      name,
      type, // 'izin' or 'cuti'
      startDate,
      endDate,
      reason,
      status: 'pending', // pending, approved, rejected
      submittedAt: new Date().toISOString()
    };

    const leaveRef = ref(database, 'leaves');
    const newLeaveRef = push(leaveRef);
    await set(newLeaveRef, leaveData);

    return { success: true, id: newLeaveRef.key };
  } catch (error) {
    console.error('Error submitting leave:', error);
    return { success: false, error: error.message };
  }
};

// Get leaves by user
export const getLeavesByUser = async (username) => {
  try {
    const leaveRef = ref(database, 'leaves');
    const snapshot = await get(leaveRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const userLeaves = [];
      
      for (const [id, record] of Object.entries(data)) {
        if (record.username === username) {
          userLeaves.push({ id, ...record });
        }
      }
      
      return userLeaves;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user leaves:', error);
    return [];
  }
};

// Get all leaves (for admin)
export const getAllLeaves = async () => {
  try {
    const leaveRef = ref(database, 'leaves');
    const snapshot = await get(leaveRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([id, record]) => ({
        id,
        ...record
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting all leaves:', error);
    return [];
  }
};

// Approve/Reject leave (admin only)
export const updateLeaveStatus = async (leaveId, status) => {
  try {
    const leaveRef = ref(database, `leaves/${leaveId}`);
    await update(leaveRef, {
      status,
      reviewedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating leave status:', error);
    return { success: false, error: error.message };
  }
};

// Approve leave
export const approveLeave = async (leaveId) => {
  return updateLeaveStatus(leaveId, 'approved');
};

// Reject leave
export const rejectLeave = async (leaveId) => {
  return updateLeaveStatus(leaveId, 'rejected');
};

// Calculate salary for a user in a month
export const calculateMonthlySalary = (attendanceRecords, leaveRecords) => {
  const DAILY_SALARY = 60000;
  const OVERTIME_BONUS = 30000;

  let workDays = 0;
  let overtimeDays = 0;
  let leaveDays = 0;

  // Count work days and overtime
  attendanceRecords.forEach(record => {
    if (record.status === 'hadir' && record.checkOut) {
      workDays++;
      if (record.overtime) {
        overtimeDays++;
      }
    }
  });

  // Count approved leave days
  leaveRecords.forEach(leave => {
    if (leave.status === 'approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      leaveDays += days;
    }
  });

  const baseSalary = workDays * DAILY_SALARY;
  const overtimeBonus = overtimeDays * OVERTIME_BONUS;
  const totalSalary = baseSalary + overtimeBonus;

  return {
    workDays,
    overtimeDays,
    leaveDays,
    baseSalary,
    overtimeBonus,
    totalSalary
  };
};
