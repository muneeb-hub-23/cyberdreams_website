const router = require('express').Router();
const pool   = require('../db');
const config = require('../config');

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const [[row]] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'adminPassword'");
    const stored  = row ? row.value : config.ADMIN_PASSWORD;

    if (password !== stored) return res.status(401).json({ error: 'Incorrect password' });

    req.session.admin = true;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/auth/logout */
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

/* GET /api/auth/me */
router.get('/me', (req, res) => {
  res.json({ admin: req.session?.admin === true });
});

module.exports = router;
