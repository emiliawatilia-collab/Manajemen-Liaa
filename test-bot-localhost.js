// Test bot di localhost
const axios = require('axios');

const BOT_URL = 'http://localhost:8080';
const GROUP_ID = '120363421176803388@g.us'; // Grup "Apartemen"

async function testBot() {
    console.log('🧪 Testing WhatsApp Bot...\n');
    
    // 1. Test status
    console.log('1️⃣ Checking bot status...');
    try {
        const statusRes = await axios.get(`${BOT_URL}/status`);
        console.log('✅ Status:', statusRes.data);
        
        if (!statusRes.data.connected) {
            console.log('❌ Bot belum connected!');
            return;
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        return;
    }
    
    // 2. Test kirim pesan ke grup
    console.log('\n2️⃣ Sending test message to group...');
    try {
        const message = `🧪 *TEST BOT LOCALHOST*

Ini adalah test message dari localhost.

Waktu: ${new Date().toLocaleString('id-ID')}

Bot berfungsi dengan baik! ✅`;

        const sendRes = await axios.post(`${BOT_URL}/send-group-message`, {
            groupId: GROUP_ID,
            message: message
        });
        
        console.log('✅ Message sent:', sendRes.data);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n✅ Test selesai! Cek grup WhatsApp "Apartemen"');
}

testBot();
