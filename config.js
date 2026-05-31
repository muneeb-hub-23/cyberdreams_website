/* ═══════════════════════════════════════════════════
   Cyber Dreams – Server Configuration
═══════════════════════════════════════════════════ */

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'production',

  /* MySQL */
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_NAME: process.env.DB_NAME || 'cyber_dreams',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'root',

  /* Session */
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    'change_this_to_a_random_64_char_string',

  /* Admin fallback password */
  ADMIN_PASSWORD:
    process.env.ADMIN_PASSWORD ||
    'cyberdreams2025',

  /* Set to true on production HTTPS, false for local HTTP dev */
  FORCE_SECURE_COOKIE: process.env.FORCE_SECURE_COOKIE === 'true',

  /* CORS */
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://cyberdreams.pk',
        'http://localhost:8000',
        'http://localhost:3000',
      ],
};