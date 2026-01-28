const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- THE UI (HTML embedded directly) ---
const renderDashboard = (keys, auth) => `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <title>UNOEXEDB PANEL</title>
</head>
<body class="bg-zinc-950 text-zinc-100 font-mono p-10">
    <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center border-b border-zinc-800 pb-8 mb-8">
            <h1 class="text-xl font-bold tracking-tighter text-cyan-500 underline">UNOEXEDB // SYSTEM</h1>
            <form action="/admin/generate" method="POST" class="flex gap-2">
                <input type="hidden" name="auth" value="${auth}">
                <input type="number" name="days" value="30" class="bg-zinc-900 border border-zinc-700 px-2 w-16 text-sm">
                <button class="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-xs font-bold uppercase">Generate Key</button>
            </form>
        </div>
        <table class="w-full text-left">
            <thead>
                <tr class="text-zinc-500 border-b border-zinc-800 text-[10px] uppercase">
                    <th class="p-3">License Key</th>
                    <th class="p-3">HWID</th>
                    <th class="p-3">Status</th>
                </tr>
            </thead>
            <tbody>
                ${keys.map(k => `
                <tr class="border-b border-zinc-900 text-sm hover:bg-zinc-900/50">
                    <td class="p-3 text-cyan-400 font-bold">${k.key_string}</td>
                    <td class="p-3 text-zinc-600 text-xs">${k.hwid || 'WAITING...'}</td>
                    <td class="p-3 ${k.is_active ? 'text-green-500' : 'text-red-500'}">${k.is_active ? 'ACTIVE' : 'REVOKED'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
`;

// --- ROUTES ---

// 1. Admin UI Access
app.get('/admin', async (req, res) => {
  const { auth } = req.query;
  if (auth !== process.env.ADMIN_SECRET) return res.status(401).send('UNAUTHORIZED');
  
  const { rows } = await pool.query('SELECT * FROM license_keys ORDER BY created_at DESC');
  res.send(renderDashboard(rows, auth));
});

// 2. Key Generation
app.post('/admin/generate', async (req, res) => {
  const { auth, days } = req.body;
  if (auth !== process.env.ADMIN_SECRET) return res.status(401).send('UNAUTHORIZED');

  const newKey = `UNO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + parseInt(days));

  await pool.query('INSERT INTO license_keys (key_string, expiry_date) VALUES ($1, $2)', [newKey, expiry]);
  res.redirect(`/admin?auth=${auth}`);
});

// 3. Mod Menu API (POST request from your mod)
app.post('/api/verify', async (req, res) => {
  const { key, hwid } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM license_keys WHERE key_string = $1', [key]);
    if (rows.length === 0) return res.status(401).json({ status: 'invalid' });

    const data = rows[0];
    if (new Date(data.expiry_date) < new Date()) return res.status(403).json({ status: 'expired' });

    if (!data.hwid) {
      await pool.query('UPDATE license_keys SET hwid = $1 WHERE key_string = $2', [hwid, key]);
      return res.json({ status: 'success' });
    } else if (data.hwid !== hwid) {
      return res.status(403).json({ status: 'hwid_mismatch' });
    }

    res.json({ status: 'success' });
  } catch (err) { res.status(500).json({ status: 'error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('UNOEXEDB Online'));
