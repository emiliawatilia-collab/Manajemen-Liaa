import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLZmMzODVnZCDQZT8iLWFYYWQtNjQzN2ZYTYzYTAz",
  authDomain: "apartemen-management.firebaseapp.com",
  databaseURL: "https://apartemen-management-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "apartemen-management",
  storageBucket: "apartemen-management.firebasestorage.app",
  messagingSenderId: "1097966180816",
  appId: "1:1097966180816:web:8098f2dd75cfed9659b1d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to inject attendance data
async function injectAttendance() {
  try {
    // Get last Wednesday date
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 3 = Wednesday
    const daysToSubtract = dayOfWeek >= 3 ? dayOfWeek - 3 : dayOfWeek + 4;
    const lastWednesday = new Date(today);
    lastWednesday.setDate(today.getDate() - daysToSubtract);
    
    const dateString = lastWednesday.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    console.log('📅 Injecting attendance for:', dateString);
    console.log('👤 Employee: Pegawai 1 (pegawai1)');
    console.log('⏰ Check-in: 09:00');
    console.log('⏰ Check-out: 17:08');
    console.log('✅ Regular work day');
    
    // Attendance data
    const attendanceData = {
      username: 'pegawai1',
      name: 'Pegawai 1',
      date: dateString,
      checkIn: '09:00',
      checkOut: '17:08',
      shift: {
        name: 'Pagi-Sore',
        start: '09:00',
        end: '17:00'
      },
      timestamp: new Date().toISOString()
    };

    // Push to Firebase
    const attendanceRef = ref(database, 'attendance');
    const newAttendanceRef = push(attendanceRef);
    await set(newAttendanceRef, attendanceData);

    console.log('\n✅ Attendance data injected successfully!');
    console.log('🔑 Record ID:', newAttendanceRef.key);
    console.log('\n📊 Data:');
    console.log(JSON.stringify(attendanceData, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error injecting attendance:', error);
    process.exit(1);
  }
}

// Run the injection
injectAttendance();
