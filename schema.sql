-- ══════════════════════════════════════════════════════
--   Cyber Dreams – MySQL Schema
--   Run once: mysql -u root -p < schema.sql
-- ══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS cyber_dreams
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cyber_dreams;

-- ── Services ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          VARCHAR(32)   NOT NULL PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  icon        VARCHAR(100)  DEFAULT 'fas fa-cog',
  description TEXT,
  image       TEXT,
  featured    TINYINT(1)    DEFAULT 0,
  sort_order  INT           DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Projects ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          VARCHAR(32)   NOT NULL PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  category    VARCHAR(100),
  client      VARCHAR(255),
  year        VARCHAR(10),
  description TEXT,
  image       TEXT,
  featured    TINYINT(1)    DEFAULT 0,
  sort_order  INT           DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Reviews ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          VARCHAR(32)   NOT NULL PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  company     VARCHAR(255),
  rating      TINYINT       DEFAULT 5,
  review      TEXT,
  avatar      TEXT,
  featured    TINYINT(1)    DEFAULT 0,
  sort_order  INT           DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Videos ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id          VARCHAR(32)   NOT NULL PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  url         TEXT          NOT NULL,
  label       VARCHAR(255),
  sort_order  INT           DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Messages ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          VARCHAR(32)   NOT NULL PRIMARY KEY,
  name        VARCHAR(255),
  email       VARCHAR(255),
  phone       VARCHAR(50),
  service     VARCHAR(255),
  subject     VARCHAR(255),
  message     TEXT,
  is_read     TINYINT(1)    DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ── Settings (key-value store) ────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  `key`       VARCHAR(100)  NOT NULL PRIMARY KEY,
  `value`     TEXT
);

-- ── Showcase (ordered ID lists) ───────────────────────
CREATE TABLE IF NOT EXISTS showcase (
  type        VARCHAR(20)   NOT NULL PRIMARY KEY,
  ordered_ids TEXT
);

-- ── Default settings ──────────────────────────────────
INSERT IGNORE INTO settings (`key`, `value`) VALUES
  ('heroTitle',    'Transforming Ideas Into Digital Reality'),
  ('heroSubtitle', 'We build enterprise software, networking solutions, CCTV systems, and IT infrastructure that powers businesses worldwide.'),
  ('adminPassword','cyberdreams2024'),
  ('statProjects', '150+'),
  ('statClients',  '100+'),
  ('statYears',    '5+'),
  ('statSatisfaction', '100%');
