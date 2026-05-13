import { sendCheckoutReminder } from './whatsappService';

// Track units yang sudah dikirim notifikasi (agar tidak spam)
const notifiedUnits = new Set();

export const checkCheckoutExpired = (unit) => {
  if (!unit.tenant || unit.status !== 'terisi') {
    return false;
  }

  const now = new Date();
  
  // Create check-in datetime
  const checkInDate = new Date(unit.tenant.checkIn);
  if (unit.tenant.checkInTime) {
    const [inHour, inMinute] = unit.tenant.checkInTime.split(':');
    checkInDate.setHours(parseInt(inHour), parseInt(inMinute), 0, 0);
  } else {
    checkInDate.setHours(0, 0, 0, 0);
  }
  
  // Create checkout datetime
  const checkOutDate = new Date(unit.tenant.checkOut);
  if (unit.tenant.checkOutTime) {
    const [outHour, outMinute] = unit.tenant.checkOutTime.split(':');
    checkOutDate.setHours(parseInt(outHour), parseInt(outMinute), 0, 0);
  } else {
    // Default checkout time is 12:00 noon for daily bookings
    checkOutDate.setHours(12, 0, 0, 0);
  }
  
  // Check if booking is active and expired
  const isActive = now >= checkInDate;
  const isExpired = now > checkOutDate;
  
  return isActive && isExpired;
};

export const monitorCheckouts = async (units) => {
  for (const unit of units) {
    if (checkCheckoutExpired(unit)) {
      // Buat unique key untuk unit ini (firebaseId + checkout date)
      const unitKey = `${unit.firebaseId}_${unit.tenant?.checkOut}`;
      
      // Cek apakah sudah pernah dikirim notifikasi
      if (!notifiedUnits.has(unitKey)) {
        console.log(`⏰ Unit ${unit.unitNumber} checkout expired, mengirim notifikasi...`);
        
        const sent = await sendCheckoutReminder(unit);
        
        if (sent) {
          // Tandai sudah dikirim
          notifiedUnits.add(unitKey);
          console.log(`✅ Notifikasi terkirim untuk unit ${unit.unitNumber}`);
        }
      }
    }
  }
};

// Clear notification flag untuk unit tertentu (dipanggil saat checkout)
export const clearNotificationFlag = (firebaseId, checkOutDate) => {
  const unitKey = `${firebaseId}_${checkOutDate}`;
  notifiedUnits.delete(unitKey);
};

// Clear all notification flags (untuk testing)
export const clearAllNotificationFlags = () => {
  notifiedUnits.clear();
  console.log('🧹 Semua flag notifikasi dibersihkan');
};
