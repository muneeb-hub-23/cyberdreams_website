/**
 * Cyber Dreams – Express.js API Server
 * Production-ready with MySQL, sessions, CORS, Helmet, rate-limiting
 */

const express       = require('express');
const session       = require('express-session');
const helmet        = require('helmet');
const cors          = require('cors');
const rateLimit     = require('express-rate-limit');
const path          = require('path');
const pool          = require('./db');
const config        = require('./config');

const app  = express();
const PORT = config.PORT;

app.set('trust proxy', 1); // trust IIS/iisnode reverse proxy

/* ── Security ─────────────────────────────────────── */
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = Array.isArray(config.ALLOWED_ORIGINS)
  ? config.ALLOWED_ORIGINS
  : config.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));

/* ── Rate Limiting ────────────────────────────────── */
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts.' },
}));

/* ── Body Parsing ─────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ── Sessions ─────────────────────────────────────── */
app.use(session({
  secret:            config.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   config.NODE_ENV === 'production' && config.FORCE_SECURE_COOKIE !== false,
    sameSite: 'lax',
    maxAge:   8 * 60 * 60 * 1000, // 8 hours
  },
}));

/* ── Static Frontend ──────────────────────────────── */
app.use(express.static(__dirname));

/* ── API Routes ───────────────────────────────────── */
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/videos',   require('./routes/videos'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/showcase', require('./routes/showcase'));

/* ── Health Check ─────────────────────────────────── */
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

/* ── Named page routes ────────────────────────────── */
app.get('/admin',    (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'services.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'projects.html')));
app.get('/videos',   (req, res) => res.sendFile(path.join(__dirname, 'videos.html')));

/* ── SPA Fallback ─────────────────────────────────── */
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ── Global Error Handler ─────────────────────────── */
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

/* ── Start ────────────────────────────────────────── */
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`✅ Database connected`);
  } catch (err) {
    console.error(`❌ Database connection failed: ${err.message}`);
    process.exit(1);
  }
  console.log(`🚀 Cyber Dreams API running on http://localhost:${PORT}`);
});

module.exports = app;
