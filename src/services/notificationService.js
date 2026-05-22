// Push Notification Service using Firebase Cloud Messaging
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ref, set, get, remove } from 'firebase/database';
import { db } from './firebase';

// VAPID Key - Anda perlu generate ini di Firebase Console
// Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'; // TODO: Ganti dengan VAPID key dari Firebase Console

let messaging = null;

// Initialize messaging (hanya di browser yang support)
export const initializeMessaging = () => {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      messaging = getMessaging();
      return messaging;
    }
    console.warn('Push notifications not supported in this browser');
    return null;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
};

// Request notification permission dan dapatkan FCM token
export const requestNotificationPermission = async (userId, userRole) => {
  try {
    // Hanya admin yang bisa dapat notifikasi
    if (userRole !== 'admin') {
      console.log('Notifikasi hanya untuk admin');
      return null;
    }

    // Cek apakah browser support
    if (!('Notification' in window)) {
      console.warn('Browser tidak support notifikasi');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Initialize messaging jika belum
      if (!messaging) {
        messaging = initializeMessaging();
      }

      if (!messaging) {
        console.error('Messaging not initialized');
        return null;
      }

      // Dapatkan FCM token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log('✅ FCM Token:', token);
        
        // Simpan token ke Firebase
        await saveFCMToken(userId, token);
        
        // Setup listener untuk foreground notifications
        setupForegroundListener();
        
        return token;
      } else {
        console.error('No FCM token available');
        return null;
      }
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Simpan FCM token ke Firebase
const saveFCMToken = async (userId, token) => {
  try {
    const tokenRef = ref(db, `users/${userId}/fcmTokens/${token.substring(0, 20)}`);
    
    await set(tokenRef, {
      token: token,
      deviceName: getDeviceName(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    });
    
    console.log('✅ FCM token saved to Firebase');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Hapus FCM token saat logout
export const removeFCMToken = async (userId, token) => {
  try {
    if (!token) return;
    
    const tokenRef = ref(db, `users/${userId}/fcmTokens/${token.substring(0, 20)}`);
    await remove(tokenRef);
    
    console.log('✅ FCM token removed');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};

// Setup listener untuk notifikasi saat app terbuka (foreground)
const setupForegroundListener = () => {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('📬 Foreground notification received:', payload);
    
    const { title, body, icon, data } = payload.notification || {};
    
    // Tampilkan notifikasi manual (karena browser tidak auto-show saat app terbuka)
    if (Notification.permission === 'granted') {
      const notification = new Notification(title || 'Notifikasi Baru', {
        body: body || '',
        icon: icon || '/favicon.svg',
        badge: '/favicon.svg',
        tag: data?.tag || 'default',
        requireInteraction: true,
        data: data
      });
      
      notification.onclick = () => {
        window.focus();
        if (data?.url) {
          window.location.href = data.url;
        }
        notification.close();
      };
    }
  });
};

// Ambil semua FCM tokens admin
export const getAdminFCMTokens = async () => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const tokens = [];
    snapshot.forEach((userSnapshot) => {
      const user = userSnapshot.val();
      
      // Hanya ambil token dari admin
      if (user.role === 'admin' && user.fcmTokens) {
        Object.values(user.fcmTokens).forEach((tokenData) => {
          tokens.push(tokenData.token);
        });
      }
    });
    
    console.log(`📱 Found ${tokens.length} admin FCM tokens`);
    return tokens;
  } catch (error) {
    console.error('Error getting admin FCM tokens:', error);
    return [];
  }
};

// Kirim notifikasi checkout expired ke admin
export const sendCheckoutExpiredNotification = async (unit) => {
  try {
    const tokens = await getAdminFCMTokens();
    
    if (tokens.length === 0) {
      console.warn('⚠️ No admin tokens found');
      return;
    }
    
    const message = {
      title: '⚠️ Checkout Expired',
      body: `Unit ${unit.unitNumber} - ${unit.tenant?.name || 'Tamu'} (${unit.tenant?.phone || '-'}) checkout sudah lewat!`,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: {
        url: '/units',
        unitId: unit.id,
        type: 'checkout_expired'
      }
    };
    
    // Kirim ke semua admin tokens
    // NOTE: Ini perlu backend/Cloud Function untuk kirim notifikasi
    // Untuk sekarang, kita simpan ke Firebase dan trigger dari Cloud Function
    await saveNotificationToFirebase('checkout_expired', message, tokens);
    
    console.log('✅ Checkout notification queued');
  } catch (error) {
    console.error('Error sending checkout notification:', error);
  }
};

// Kirim notifikasi absensi pegawai ke admin
export const sendAttendanceNotification = async (employeeName, type, time) => {
  try {
    const tokens = await getAdminFCMTokens();
    
    if (tokens.length === 0) {
      console.warn('⚠️ No admin tokens found');
      return;
    }
    
    const typeText = type === 'check-in' ? 'check-in' : 'check-out';
    const emoji = type === 'check-in' ? '✅' : '👋';
    
    const message = {
      title: `${emoji} Absensi Pegawai`,
      body: `${employeeName} berhasil ${typeText} - ${time}`,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: {
        url: '/attendance',
        type: 'attendance',
        employeeName: employeeName
      }
    };
    
    // Simpan ke Firebase untuk trigger Cloud Function
    await saveNotificationToFirebase('attendance', message, tokens);
    
    console.log('✅ Attendance notification queued');
  } catch (error) {
    console.error('Error sending attendance notification:', error);
  }
};

// Simpan notifikasi ke Firebase (untuk trigger Cloud Function)
const saveNotificationToFirebase = async (type, message, tokens) => {
  try {
    const notificationRef = ref(db, `notifications/${Date.now()}`);
    
    await set(notificationRef, {
      type: type,
      message: message,
      tokens: tokens,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving notification to Firebase:', error);
  }
};

// Helper: Dapatkan nama device
const getDeviceName = () => {
  const ua = navigator.userAgent;
  
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  
  return 'Unknown Device';
};

// Cek apakah notifikasi sudah diizinkan
export const isNotificationEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};
