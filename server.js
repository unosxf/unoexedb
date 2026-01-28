const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Railway/Postgres
});

// --- MOD MENU API ENDPOINT ---
app.post('/api/verify', async (req, res) => {
  const { key, hwid } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM license_keys WHERE key_string = $1', [key]);
    if (rows.length === 0) return res.status(401).json({ status: 'invalid' });

    const data = rows[0];
    if (!data.is_active) return res.status(403).json({ status: 'banned' });
    if (new Date(data.expiry_date) < new Date()) return res.status(403).json({ status: 'expired' });

    if (!data.hwid) {
      await pool.query('UPDATE license_keys SET hwid = $1 WHERE key_string = $2', [hwid, key]);
      return res.json({ status: 'success', info: 'bound' });
    } else if (data.hwid !== hwid) {
      return res.status(403).json({ status: 'hwid_mismatch' });
    }

    res.json({ status: 'success' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- PRIVATE ADMIN UI ---
app.get('/admin', async (req, res) => {
  const token = req.query.auth;
  if (token !== process.env.ADMIN_SECRET) return res.status(401).send('Access Denied');
  
  const { rows } = await pool.query('SELECT * FROM license_keys ORDER BY created_at DESC');
  res.render('dashboard', { keys: rows, auth: token });
});

// --- KEY GENERATION ---
app.post('/admin/generate', async (req, res) => {
  const { auth, days } = req.body;
  if (auth !== process.env.ADMIN_SECRET) return res.status(401).send('Unauthorized');

  const newKey = `CODM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + parseInt(days));

  await pool.query('INSERT INTO license_keys (key_string, expiry_date) VALUES ($1, $2)', [newKey, expiry]);
  res.redirect(`/admin?auth=${auth}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`System Online on port ${PORT}`));
