const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { requireAdmin } = require('../middleware/auth');

const SETTING_KEYS = ['heroTitle', 'heroSubtitle', 'adminPassword', 'statProjects', 'statClients', 'statYears', 'statSatisfaction'];

/* GET /api/settings  (public – only non-sensitive) */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT `key`, `value` FROM settings WHERE `key` IN ('heroTitle','heroSubtitle','statProjects','statClients','statYears','statSatisfaction')");
    const obj = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* GET /api/settings/admin  (admin – includes password) */
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const keys  = SETTING_KEYS.map(() => '?').join(',');
    const [rows] = await pool.query(`SELECT \`key\`, \`value\` FROM settings WHERE \`key\` IN (${keys})`, SETTING_KEYS);
    const obj = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* PUT /api/settings  (admin) */
router.put('/', requireAdmin, async (req, res) => {
  try {
    const allowed = SETTING_KEYS;
    const entries = Object.entries(req.body).filter(([k]) => allowed.includes(k));
    for (const [key, value] of entries) {
      await pool.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, value, value]
      );
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/settings/bulk-sync  (admin) */
router.post('/bulk-sync', requireAdmin, async (req, res) => {
  try {
    const { settings, stats } = req.body;
    const map = {
      heroTitle:        settings?.heroTitle,
      heroSubtitle:     settings?.heroSubtitle,
      adminPassword:    settings?.adminPassword,
      statProjects:     stats?.projects,
      statClients:      stats?.clients,
      statYears:        stats?.years,
      statSatisfaction: stats?.satisfaction,
    };
    for (const [key, value] of Object.entries(map)) {
      if (value === undefined || value === null) continue;
      await pool.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, String(value), String(value)]
      );
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
