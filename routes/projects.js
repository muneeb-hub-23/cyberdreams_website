const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');
const { requireAdmin } = require('../middleware/auth');

/* GET /api/projects */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC');
    res.json(rows.map(normalise));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/projects  (admin) */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, category, client, year, description, image, featured } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const id = uuidv4().replace(/-/g, '').substring(0, 32);
    await pool.query(
      'INSERT INTO projects (id, title, category, client, year, description, image, featured) VALUES (?,?,?,?,?,?,?,?)',
      [id, title, category || '', client || '', year || '', description || '', image || '', featured ? 1 : 0]
    );
    const [[row]] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* PUT /api/projects/:id  (admin) */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, category, client, year, description, image, featured } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    await pool.query(
      'UPDATE projects SET title=?, category=?, client=?, year=?, description=?, image=?, featured=? WHERE id=?',
      [title, category || '', client || '', year || '', description || '', image || '', featured ? 1 : 0, req.params.id]
    );
    const [[row]] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(normalise(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* DELETE /api/projects/:id  (admin) */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/projects/bulk-sync  (admin) */
router.post('/bulk-sync', requireAdmin, async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
    let inserted = 0, updated = 0;
    for (const p of items) {
      const id = p.id || uuidv4().replace(/-/g, '').substring(0, 32);
      const [existing] = await pool.query('SELECT id FROM projects WHERE id = ?', [id]);
      if (existing.length) {
        await pool.query(
          'UPDATE projects SET title=?, category=?, client=?, year=?, description=?, image=?, featured=? WHERE id=?',
          [p.title || '', p.category || '', p.client || '', p.year || '', p.description || '', p.image || '', p.featured ? 1 : 0, id]
        );
        updated++;
      } else {
        await pool.query(
          'INSERT INTO projects (id, title, category, client, year, description, image, featured, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
          [id, p.title || '', p.category || '', p.client || '', p.year || '', p.description || '', p.image || '', p.featured ? 1 : 0, p.createdAt ? new Date(p.createdAt) : new Date()]
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
    category:    r.category,
    client:      r.client,
    year:        r.year,
    description: r.description,
    image:       r.image,
    featured:    !!r.featured,
    sortOrder:   r.sort_order,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
  };
}

module.exports = router;
