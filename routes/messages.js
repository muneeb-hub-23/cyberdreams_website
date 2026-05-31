const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');
const { requireAdmin } = require('../middleware/auth');

/* GET /api/messages  (admin) */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows.map(normalise));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* POST /api/messages  (public – contact form) */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, subject, message } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'name and message are required' });
    const id = uuidv4().replace(/-/g, '').substring(0, 32);
    await pool.query(
      'INSERT INTO messages (id, name, email, phone, service, subject, message) VALUES (?,?,?,?,?,?,?)',
      [id, name, email || '', phone || '', service || '', subject || '', message]
    );
    res.status(201).json({ ok: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* PATCH /api/messages/:id/read  (admin) */
router.patch('/:id/read', requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* DELETE /api/messages/:id  (admin) */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* DELETE /api/messages  (clear all – admin) */
router.delete('/', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM messages');
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function normalise(r) {
  return {
    id:        r.id,
    name:      r.name,
    email:     r.email,
    phone:     r.phone,
    service:   r.service,
    subject:   r.subject,
    message:   r.message,
    read:      !!r.is_read,
    createdAt: r.created_at,
  };
}

module.exports = router;
