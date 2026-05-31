const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { requireAdmin } = require('../middleware/auth');

const TYPES  = ['services', 'projects', 'videos'];
const LIMITS = { services: 6, projects: 6, videos: 5 };

/* GET /api/showcase/:type  (public) */
router.get('/:type', async (req, res) => {
  try {
    const type = req.params.type;
    if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' });

    const [[row]] = await pool.query('SELECT ordered_ids FROM showcase WHERE type = ?', [type]);
    const ids = row ? JSON.parse(row.ordered_ids || '[]') : [];

    if (!ids.length) {
      const limit = LIMITS[type];
      const table = type;
      const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY sort_order ASC, created_at DESC LIMIT ?`, [limit]);
      return res.json(rows);
    }

    const table = type;
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id IN (${placeholders})`, ids);
    const map = Object.fromEntries(rows.map(r => [r.id, r]));
    const ordered = ids.map(id => map[id]).filter(Boolean).slice(0, LIMITS[type]);
    res.json(ordered);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* PUT /api/showcase/:type  (admin) */
router.put('/:type', requireAdmin, async (req, res) => {
  try {
    const type = req.params.type;
    if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' });
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'orderedIds must be array' });
    const limited = orderedIds.slice(0, LIMITS[type]);
    await pool.query(
      'INSERT INTO showcase (type, ordered_ids) VALUES (?, ?) ON DUPLICATE KEY UPDATE ordered_ids = ?',
      [type, JSON.stringify(limited), JSON.stringify(limited)]
    );
    res.json({ ok: true, saved: limited.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* DELETE /api/showcase/:type  (admin – reset to default) */
router.delete('/:type', requireAdmin, async (req, res) => {
  try {
    const type = req.params.type;
    if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' });
    await pool.query('DELETE FROM showcase WHERE type = ?', [type]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/showcase/bulk-sync  (admin) */
router.post('/bulk-sync', requireAdmin, async (req, res) => {
  try {
    const { services, projects, videos } = req.body;
    for (const [type, ids] of [['services', services], ['projects', projects], ['videos', videos]]) {
      if (!Array.isArray(ids)) continue;
      const limited = ids.slice(0, LIMITS[type]);
      await pool.query(
        'INSERT INTO showcase (type, ordered_ids) VALUES (?, ?) ON DUPLICATE KEY UPDATE ordered_ids = ?',
        [type, JSON.stringify(limited), JSON.stringify(limited)]
      );
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
