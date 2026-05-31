# Cyber Dreams – Backend Setup Guide

## Prerequisites
- Node.js 18+
- MySQL 8+ (or MariaDB 10.6+)

---

## 1. Create the Database

```bash
mysql -u root -p < schema.sql
```

This creates the `cyber_dreams` database and all tables with default settings.

---

## 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cyber_dreams
DB_USER=root
DB_PASSWORD=your_mysql_password
SESSION_SECRET=any_random_64_char_string
ADMIN_PASSWORD=cyberdreams2024
ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
PORT=3000
```

---

## 3. Install Dependencies

```bash
cd backend
npm install
```

---

## 4. Start the Server

**Development (auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will:
- Serve the frontend statically from the parent directory
- Expose all APIs under `/api/`
- Log `🚀 Cyber Dreams API running on http://localhost:3000`

---

## 5. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Admin login |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | No | Check session |
| GET | `/api/services` | No | List services |
| POST | `/api/services` | Yes | Create service |
| PUT | `/api/services/:id` | Yes | Update service |
| DELETE | `/api/services/:id` | Yes | Delete service |
| POST | `/api/services/bulk-sync` | Yes | Sync from localStorage |
| GET | `/api/projects` | No | List projects |
| POST | `/api/projects` | Yes | Create project |
| PUT | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| GET | `/api/reviews` | No | List reviews |
| POST | `/api/reviews` | Yes | Create review |
| PUT | `/api/reviews/:id` | Yes | Update review |
| DELETE | `/api/reviews/:id` | Yes | Delete review |
| GET | `/api/videos` | No | List videos |
| POST | `/api/videos` | Yes | Create video |
| PUT | `/api/videos/:id` | Yes | Update video |
| DELETE | `/api/videos/:id` | Yes | Delete video |
| GET | `/api/messages` | Yes | List messages |
| POST | `/api/messages` | No | Submit contact form |
| PATCH | `/api/messages/:id/read` | Yes | Mark as read |
| DELETE | `/api/messages/:id` | Yes | Delete message |
| DELETE | `/api/messages` | Yes | Clear all messages |
| GET | `/api/settings` | No | Public settings |
| GET | `/api/settings/admin` | Yes | All settings incl. password |
| PUT | `/api/settings` | Yes | Update settings |
| GET | `/api/showcase/:type` | No | Get showcase order |
| PUT | `/api/showcase/:type` | Yes | Save showcase order |
| DELETE | `/api/showcase/:type` | Yes | Reset showcase |
| GET | `/api/health` | No | DB health check |

---

## 6. Migrating from localStorage

1. Open the website in the browser where your old data is saved
2. Log in to the Admin Panel
3. Go to **Settings → Data Migration**
4. Click **"Sync localStorage → Database"**

All services, projects, reviews, videos, settings, and showcase orders will be uploaded to MySQL.

---

## 7. Production Deployment

- Set `NODE_ENV=production` in `.env`
- Use a process manager: `pm2 start server.js --name cyber-dreams`
- Put Nginx/Caddy in front for HTTPS
- Update `ALLOWED_ORIGINS` to your real domain
