const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

let sock;
let qrCodeData = null;
let isConnected = false;
let isReady = false; // Add ready flag

// Initialize WhatsApp connection
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            qrCodeData = qr;
            console.log('\n📱 Scan QR Code ini dengan WhatsApp Anda:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Koneksi terputus, reconnecting:', shouldReconnect);
            isConnected = false;
            isReady = false;
            
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Bot Connected!');
            isConnected = true;
            // Wait a bit before marking as ready
            setTimeout(() => {
                isReady = true;
                console.log('✅ Bot is ready to send messages!');
            }, 5000);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// API endpoint to send message
app.post('/send-message', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!isReady) {
            return res.status(503).json({ 
                success: false, 
                error: 'Bot belum siap. Tunggu beberapa detik setelah connected.' 
            });
        }
        
        if (!phone || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone dan message harus diisi' 
            });
        }
        
        // Format phone number (remove +, spaces, dashes)
        const formattedPhone = phone.replace(/[^0-9]/g, '');
        
        // Add country code if not present
        const phoneWithCountryCode = formattedPhone.startsWith('62') 
            ? formattedPhone 
            : '62' + formattedPhone.replace(/^0/, '');
        
        const jid = phoneWithCountryCode + '@s.whatsapp.net';
        
        await sock.sendMessage(jid, { text: message });
        
        res.json({ 
            success: true, 
            message: 'Pesan berhasil dikirim',
            to: phoneWithCountryCode
        });
        
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API endpoint to send message to group
app.post('/send-group-message', async (req, res) => {
    try {
        const { groupId, message } = req.body;
        
        if (!isReady) {
            return res.status(503).json({ 
                success: false, 
                error: 'Bot belum siap. Tunggu beberapa detik setelah connected.' 
            });
        }
        
        if (!groupId || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'groupId dan message harus diisi' 
            });
        }
        
        await sock.sendMessage(groupId, { text: message });
        
        res.json({ 
            success: true, 
            message: 'Pesan berhasil dikirim ke grup'
        });
        
    } catch (error) {
        console.error('Error sending group message:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API endpoint to get groups
app.get('/groups', async (req, res) => {
    try {
        if (!isReady) {
            return res.status(503).json({ 
                success: false, 
                error: 'Bot belum siap. Tunggu beberapa detik setelah connected.' 
            });
        }
        
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups).map(group => ({
            id: group.id,
            name: group.subject,
            participants: group.participants.length
        }));
        
        res.json({ 
            success: true, 
            groups: groupList 
        });
        
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API endpoint to check connection status
app.get('/status', (req, res) => {
    res.json({ 
        connected: isConnected,
        ready: isReady,
        qrCode: qrCodeData,
        message: isReady ? 'Bot siap kirim pesan' : isConnected ? 'Bot connected, tunggu 5 detik...' : 'Bot belum terhubung'
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'running',
        connected: isConnected,
        message: 'WhatsApp Bot API for Apartemen Management'
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 WhatsApp Bot API running on port ${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   - POST http://localhost:${PORT}/send-message`);
    console.log(`   - POST http://localhost:${PORT}/send-group-message`);
    console.log(`   - GET  http://localhost:${PORT}/groups`);
    console.log(`   - GET  http://localhost:${PORT}/status\n`);
    
    connectToWhatsApp();
});
