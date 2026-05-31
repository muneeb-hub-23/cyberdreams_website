const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');
const { requireAdmin } = require('../middleware/auth');

/* GET /api/reviews */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY sort_order ASC, created_at DESC');
    res.json(rows.map(normalise));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/reviews  (admin) */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, company, rating, review, avatar, featured } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = uuidv4().replace(/-/g, '').substring(0, 32);
    await pool.query(
      'INSERT INTO reviews (id, name, company, rating, review, avatar, featured) VALUES (?,?,?,?,?,?,?)',
      [id, name, company || '', parseInt(rating) || 5, review || '', avatar || '', featured ? 1 : 0]
    );
    const [[row]] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    res.status(201).json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* PUT /api/reviews/:id  (admin) */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, company, rating, review, avatar, featured } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await pool.query(
      'UPDATE reviews SET name=?, company=?, rating=?, review=?, avatar=?, featured=? WHERE id=?',
      [name, company || '', parseInt(rating) || 5, review || '', avatar || '', featured ? 1 : 0, req.params.id]
    );
    const [[row]] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* DELETE /api/reviews/:id  (admin) */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/reviews/bulk-sync  (admin) */
router.post('/bulk-sync', requireAdmin, async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    let inserted = 0, updated = 0;
    for (const r of items) {
      const id = r.id || uuidv4().replace(/-/g, '').substring(0, 32);
      const [existing] = await pool.query('SELECT id FROM reviews WHERE id = ?', [id]);
      if (existing.length) {
        await pool.query(
          'UPDATE reviews SET name=?, company=?, rating=?, review=?, avatar=?, featured=? WHERE id=?',
          [r.name || '', r.company || '', parseInt(r.rating) || 5, r.review || '', r.avatar || '', r.featured ? 1 : 0, id]
        );
        updated++;
      } else {
        await pool.query(
          'INSERT INTO reviews (id, name, company, rating, review, avatar, featured, created_at) VALUES (?,?,?,?,?,?,?,?)',
          [id, r.name || '', r.company || '', parseInt(r.rating) || 5, r.review || '', r.avatar || '', r.featured ? 1 : 0, r.createdAt ? new Date(r.createdAt) : new Date()]
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
    name:      r.name,
    company:   r.company,
    rating:    r.rating,
    review:    r.review,
    avatar:    r.avatar,
    featured:  !!r.featured,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

module.exports = router;
