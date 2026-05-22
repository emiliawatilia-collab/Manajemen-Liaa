// Checkout Monitor Service
// Monitor unit checkout expired dan kirim notifikasi ke admin

import { sendCheckoutExpiredNotification } from './notificationService';

// Track units yang sudah dikirim notifikasi (agar tidak spam)
const notifiedUnits = new Map();

// Monitor checkout expired units
export const monitorCheckouts = async (units) => {
  const now = new Date();
  
  // Filter unit yang terisi dan checkout sudah lewat
  const expiredUnits = units.filter(unit => {
    if (unit.status !== 'terisi' || !unit.tenant) return false;
    
    const checkOutDate = new Date(unit.tenant.checkOut);
    const checkOutTime = unit.tenant.checkOutTime || '12:00';
    const [hours, minutes] = checkOutTime.split(':');
    
    checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Cek apakah checkout sudah lewat
    return now > checkOutDate;
  });
  
  // Kirim notifikasi untuk unit yang expired
  for (const unit of expiredUnits) {
    const unitKey = `${unit.firebaseId}_${unit.tenant.checkOut}`;
    
    // Cek apakah sudah pernah kirim notifikasi untuk unit ini
    if (!notifiedUnits.has(unitKey)) {
      console.log('Unit ' + unit.unitNumber + ' checkout expired, mengirim notifikasi...');
      
      try {
        await sendCheckoutExpiredNotification(unit);
        
        // Tandai sudah kirim notifikasi
        notifiedUnits.set(unitKey, {
          sentAt: new Date().toISOString(),
          unitNumber: unit.unitNumber
        });
        
        console.log('Notifikasi terkirim untuk unit ' + unit.unitNumber);
      } catch (error) {
        console.error('Gagal kirim notifikasi untuk unit ' + unit.unitNumber + ':', error);
      }
    }
  }
  
  // Cleanup: hapus notifikasi lama (lebih dari 7 hari)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  for (const [key, value] of notifiedUnits.entries()) {
    const sentAt = new Date(value.sentAt);
    if (sentAt < sevenDaysAgo) {
      notifiedUnits.delete(key);
    }
  }
};

// Clear notification flag (dipanggil saat checkout unit)
export const clearNotificationFlag = (firebaseId, checkOutDate) => {
  const unitKey = `${firebaseId}_${checkOutDate}`;
  notifiedUnits.delete(unitKey);
  console.log('Cleared notification flag for ' + unitKey);
};
