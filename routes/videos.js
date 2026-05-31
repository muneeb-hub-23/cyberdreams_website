const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');
const { requireAdmin } = require('../middleware/auth');

/* GET /api/videos */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM videos ORDER BY sort_order ASC, created_at DESC');
    res.json(rows.map(normalise));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/videos  (admin) */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, url, label } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    if (!url)   return res.status(400).json({ error: 'url is required' });
    const id = uuidv4().replace(/-/g, '').substring(0, 32);
    await pool.query(
      'INSERT INTO videos (id, title, url, label) VALUES (?,?,?,?)',
      [id, title, url, label || '']
    );
    const [[row]] = await pool.query('SELECT * FROM videos WHERE id = ?', [id]);
    res.status(201).json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* PUT /api/videos/:id  (admin) */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, url, label } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    await pool.query(
      'UPDATE videos SET title=?, url=?, label=? WHERE id=?',
      [title, url || '', label || '', req.params.id]
    );
    const [[row]] = await pool.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* DELETE /api/videos/:id  (admin) */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM videos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/videos/bulk-sync  (admin) */
router.post('/bulk-sync', requireAdmin, async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    let inserted = 0, updated = 0;
    for (const v of items) {
      const id = v.id || uuidv4().replace(/-/g, '').substring(0, 32);
      const [existing] = await pool.query('SELECT id FROM videos WHERE id = ?', [id]);
      if (existing.length) {
        await pool.query(
          'UPDATE videos SET title=?, url=?, label=? WHERE id=?',
          [v.title || '', v.url || '', v.label || '', id]
        );
        updated++;
      } else {
        await pool.query(
          'INSERT INTO videos (id, title, url, label, created_at) VALUES (?,?,?,?,?)',
          [id, v.title || '', v.url || '', v.label || '', v.createdAt ? new Date(v.createdAt) : new Date()]
        );
        inserted++;
      }
    }
    res.json({ ok: true, inserted, updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function normalise(r) {
  return {
    id:        r.id,
    title:     r.title,
    url:       r.url,
    label:     r.label,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

module.exports = router;
