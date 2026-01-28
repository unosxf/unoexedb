const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Key Generation Logic
function generateKey(prefix = "MOD") {
    const randomPart = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `${prefix}-${randomPart}-${crypto.randomInt(1000, 9999)}`;
}

app.post('/api/generate', (req, res) => {
    // In a production scenario, you'd add auth here
    const newKey = generateKey('CODM');
    res.json({ success: true, key: newKey, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
