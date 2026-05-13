// WhatsApp Service untuk mengirim notifikasi checkout
const WHATSAPP_BOT_URL = import.meta.env.VITE_WHATSAPP_BOT_URL || 'http://localhost:3001';
const ADMIN_GROUP_ID = '120363421176803388@g.us'; // Grup "Apartemen"

export const sendCheckoutReminder = async (unit) => {
  try {
    // Skip if bot URL is not configured or in production without bot
    if (!WHATSAPP_BOT_URL || WHATSAPP_BOT_URL.includes('localhost')) {
      console.log('⚠️ WhatsApp Bot tidak tersedia di production. Notifikasi dilewati.');
      return false;
    }

    const checkOutDate = new Date(unit.tenant?.checkOut);
    const checkOutTime = unit.tenant?.checkOutTime || '12:00';
    
    const message = `🔔 *REMINDER CHECKOUT*

*Unit:* ${unit.unitNumber}
*Penyewa:* ${unit.tenant?.name || 'Tamu'}
*Nomor HP:* ${unit.tenant?.phone || '-'}
*Check-out:* ${checkOutDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })} ${checkOutTime}

⚠️ *Waktu checkout sudah habis!*

Mohon konfirmasi:
✅ Checkout di aplikasi
✅ Atau hubungi tamu untuk perpanjang

_Notifikasi otomatis dari Sistem Manajemen Apartemen_`;

    const response = await fetch(`${WHATSAPP_BOT_URL}/send-group-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: ADMIN_GROUP_ID,
        message: message
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Notifikasi WhatsApp terkirim untuk unit:', unit.unitNumber);
      return true;
    } else {
      console.error('❌ Gagal kirim notifikasi WhatsApp:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error kirim notifikasi WhatsApp:', error);
    return false;
  }
};

export const checkBotStatus = async () => {
  try {
    // Skip if bot URL is not configured or in production without bot
    if (!WHATSAPP_BOT_URL || WHATSAPP_BOT_URL.includes('localhost')) {
      console.log('⚠️ WhatsApp Bot hanya tersedia di development (localhost)');
      return false;
    }

    const response = await fetch(`${WHATSAPP_BOT_URL}/status`);
    const result = await response.json();
    return result.connected && result.ready;
  } catch (error) {
    console.error('❌ Bot WhatsApp tidak terhubung:', error);
    return false;
  }
};
