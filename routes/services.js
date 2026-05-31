const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');
const { requireAdmin } = require('../middleware/auth');

/* GET /api/services */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY sort_order ASC, created_at DESC');
    res.json(rows.map(normalise));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/services  (admin) */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, icon, description, image, featured } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const id = uuidv4().replace(/-/g, '').substring(0, 32);
    await pool.query(
      'INSERT INTO services (id, title, icon, description, image, featured) VALUES (?,?,?,?,?,?)',
      [id, title, icon || 'fas fa-cog', description || '', image || '', featured ? 1 : 0]
    );
    const [[row]] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    res.status(201).json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* PUT /api/services/:id  (admin) */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, icon, description, image, featured } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    await pool.query(
      'UPDATE services SET title=?, icon=?, description=?, image=?, featured=? WHERE id=?',
      [title, icon || 'fas fa-cog', description || '', image || '', featured ? 1 : 0, req.params.id]
    );
    const [[row]] = await pool.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* DELETE /api/services/:id  (admin) */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/services/bulk-sync  (admin) — import from localStorage */
router.post('/bulk-sync', requireAdmin, async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    let inserted = 0, updated = 0;
    for (const s of items) {
      const id = s.id || uuidv4().replace(/-/g, '').substring(0, 32);
      const [existing] = await pool.query('SELECT id FROM services WHERE id = ?', [id]);
      if (existing.length) {
        await pool.query(
          'UPDATE services SET title=?, icon=?, description=?, image=?, featured=? WHERE id=?',
          [s.title || '', s.icon || 'fas fa-cog', s.description || '', s.image || '', s.featured ? 1 : 0, id]
        );
        updated++;
      } else {
        await pool.query(
          'INSERT INTO services (id, title, icon, description, image, featured, created_at) VALUES (?,?,?,?,?,?,?)',
          [id, s.title || '', s.icon || 'fas fa-cog', s.description || '', s.image || '', s.featured ? 1 : 0, s.createdAt ? new Date(s.createdAt) : new Date()]
        );
        inserted++;
      }
    }
    res.json({ ok: true, inserted, updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function normalise(r) {
  return {
    id:          r.id,
    title:       r.title,
    icon:        r.icon,
    description: r.description,
    image:       r.image,
    featured:    !!r.featured,
    sortOrder:   r.sort_order,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  };
}

module.exports = router;
