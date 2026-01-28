const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let activeKeys = {}; 

// 1. GENERATE KEY (For your Website)
app.post('/api/generate', (req, res) => {
    const duration = req.body.duration || 24;
    const key = `UNO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + duration);
    
    activeKeys[key] = { expiry: expiryDate };
    res.json({ success: true, key: key, expiry: expiryDate });
});

// 2. VERIFY KEY (For your CODM Mod Menu)
app.post('/api/verify', (req, res) => {
    const { key } = req.body; // The game sends the key here
    const keyData = activeKeys[key];
    const now = new Date();

    if (keyData && new Date(keyData.expiry) > now) {
        console.log(`[AUTH] Key Accepted: ${key}`);
        return res.status(200).send("OK"); // Sending "OK" is standard for mod menus
    } 
    
    console.log(`[AUTH] Key Denied: ${key}`);
    res.status(403).send("INVALID");
});

// 3. DASHBOARD DATA
app.get('/api/admin/dashboard', (req, res) => {
    res.json(activeKeys);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`UNO KEY DATA system online on port ${PORT}`);
});
