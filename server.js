const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. IN-MEMORY STORAGE (Stores keys and their expiry timestamps)
let activeKeys = {}; 

// 2. KEY GENERATION WITH EXPIRY (default 24 hours)
function generateKey(hours = 24) {
    const key = `CODM-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + hours);
    
    activeKeys[key] = {
        expiry: expiryDate,
        status: 'Active'
    };
    return { key, expiry: expiryDate };
}

// 3. GENERATE API
app.post('/api/generate', (req, res) => {
    const duration = req.body.duration || 24; // Default to 24h if not specified
    const data = generateKey(duration);
    res.json({ success: true, ...data });
});

// 4. DASHBOARD API (Sends current active keys to your dashboard)
app.get('/api/admin/dashboard', (req, res) => {
    const now = new Date();
    // Clean up expired keys on the fly
    Object.keys(activeKeys).forEach(k => {
        if (new Date(activeKeys[k].expiry) < now) delete activeKeys[k];
    });
    res.json(activeKeys);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
