/**
 * Admin authentication middleware.
 * Session-based: POST /api/auth/login sets req.session.admin = true
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin === true) return next();
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

module.exports = { requireAdmin };
