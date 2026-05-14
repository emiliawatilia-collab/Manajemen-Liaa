const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Enable CORS untuk React app
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

let client;
let isReady = false;
let qrCodeData = null;

// Initialize WhatsApp Client
function initializeClient() {
    // Puppeteer config untuk Railway/Production
    const puppeteerConfig = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    };

    // Jika di Railway, gunakan Chromium sistem
    if (process.env.RAILWAY_ENVIRONMENT) {
        puppeteerConfig.executablePath = '/usr/bin/chromium';
    }

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: puppeteerConfig
    });

    client.on('qr', (qr) => {
        qrCodeData = qr;
        console.log('\n📱 Scan QR Code ini dengan WhatsApp Anda:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp Bot Connected!');
        console.log('✅ Bot is ready to send messages!');
        isReady = true;
        qrCodeData = null;
    });

    client.on('authenticated', () => {
        console.log('✅ WhatsApp Authenticated!');
    });

    client.on('auth_failure', (msg) => {
        console.error('❌ Authentication failed:', msg);
        isReady = false;
    });

    client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp disconnected:', reason);
        isReady = false;
        console.log('🔄 Reconnecting...');
        setTimeout(() => {
            client.initialize();
        }, 5000);
    });

    client.initialize();
}

// API endpoint to send message to phone number
app.post('/send-message', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!isReady) {
            return res.status(503).json({ 
                success: false, 
                error: 'Bot belum siap. Tunggu sampai connected.' 
            });
        }
        
        if (!phone || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone dan message harus diisi' 
            });
        }
        
        // Format phone number
        const formattedPhone = phone.replace(/[^0-9]/g, '');
        const phoneWithCountryCode = formattedPhone.startsWith('62') 
            ? formattedPhone 
            : '62' + formattedPhone.replace(/^0/, '');
        
        const chatId = phoneWithCountryCode + '@c.us';
        
        await client.sendMessage(chatId, message);
        
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
                error: 'Bot belum siap. Tunggu sampai connected.' 
            });
        }
        
        if (!groupId || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'groupId dan message harus diisi' 
            });
        }
        
        await client.sendMessage(groupId, message);
        
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

// API endpoint to get all chats (including groups)
app.get('/chats', async (req, res) => {
    try {
        if (!isReady) {
            return res.status(503).json({ 
                success: false, 
                error: 'Bot belum siap. Tunggu sampai connected.' 
            });
        }
        
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup).map(group => ({
            id: group.id._serialized,
            name: group.name,
            participants: group.participants ? group.participants.length : 0
        }));
        
        res.json({ 
            success: true, 
            groups: groups 
        });
        
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API endpoint to check status
app.get('/status', (req, res) => {
    res.json({ 
        connected: isReady,
        ready: isReady,
        qrCode: qrCodeData,
        message: isReady ? 'Bot siap kirim pesan' : 'Bot belum terhubung'
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'running',
        connected: isReady,
        message: 'WhatsApp Bot API for Apartemen Management (whatsapp-web.js)'
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 WhatsApp Bot API running on port ${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   - POST http://localhost:${PORT}/send-message`);
    console.log(`   - POST http://localhost:${PORT}/send-group-message`);
    console.log(`   - GET  http://localhost:${PORT}/chats`);
    console.log(`   - GET  http://localhost:${PORT}/status\n`);
    
    initializeClient();
});
