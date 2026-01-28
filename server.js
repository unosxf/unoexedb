const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();

// 1. DYNAMIC PORT: Railway will tell the app which port to use.
// 0.0.0.0 is crucial for external access.
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 2. STATIC FILES: Serve your HTML from the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// 3. KEY GENERATION LOGIC
function generateKey(prefix = "CODM") {
    // Generates a high-entropy random string
    const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${randomPart}-${timestamp}`;
}

// 4. API ENDPOINT
app.post('/api/generate', (req, res) => {
    try {
        const newKey = generateKey();
        console.log(`[LOG] Key Generated: ${newKey}`);
        res.json({ 
            success: true, 
            key: newKey, 
            generatedAt: new Date().toLocaleString() 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 5. START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 KEY GENERATOR LIVE: http://0.0.0.0:${PORT}`);
    console.log(`-----------------------------------------`);
});
