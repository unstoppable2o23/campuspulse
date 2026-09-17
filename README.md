# 🎓 CampusPulse

A student guidance platform with a Superadmin → Counsellors → Students hierarchy, live dashboard updates, and automatic counsellor assignment.

## Features

- 🔐 Three roles — Superadmin, Counsellors, Students, each with their own dashboard
- 📝 3-step student registration — auto-assigns each student to the least-loaded counsellor
- 📊 Live dashboards — registration momentum chart, counsellor performance, rising subjects (hand-rolled SVG, no chart libs)
- 🔴 Real-time updates — zero-dependency WebSocket server (`/ws`); registrations & status changes push instantly
- 📜 Status history — every student's status transitions are recorded with who changed them and when
- ✨ Magic-link login — students can sign in via emailed link (Supabase Auth)
- 📥 CSV export — Superadmin exports all students, counsellors export their own
- 🌱 Auto-seeding — seeds 50+ demo users on first boot against an empty database

## Stack

- Backend: Node.js (zero-dependency `http` + hand-rolled RFC 6455 WebSocket), Supabase Postgres (`@supabase/supabase-js` with the service-role key, server-side only)
- Frontend: single-file SPA in `public/index.html` (no build step, no chart libs)

## Local setup

Prerequisites: Node.js 18+, a Supabase project.

```bash
git clone https://github.com/unstoppable2o23/campuspulse.git
cd campuspulse
npm install
```

1. Supabase → SQL Editor → run `schema.sql` (creates `users`, `sessions`, `session_requests`, `status_history`).
2. Copy env and fill it in:
```bash
copy .env.example .env
```
```
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SITE_URL=http://localhost:3000
PORT=3000
```
3. Magic-link redirects (Supabase → Auth → URL Configuration):
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
4. Boot:
```bash
npm start    # or: npm run dev (watch mode)
```

First boot against an empty DB auto-seeds demo data. Open `http://localhost:3000`:

| Role | Email | Password |
|---|---|---|
| Superadmin | `admin@campuspulse.edu` | `Admin@123` |
| Counsellor | `rahul@campuspulse.edu` | `Counsel@123` |
| Student | `aarav@student.campuspulse.edu` | `Student@123` or magic link |

## Deploy (Render)

`render.yaml` is already in the repo — Render picks it up automatically.

1. dashboard.render.com → New → Web Service → connect `campuspulse`.
2. Build command `npm install`, start command `node server.js`.
3. Environment variables:
   - `SUPABASE_URL` → `https://<ref>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` → your `sb_secret_...` (never commit this)
   - `SITE_URL` → `https://<your-app>.onrender.com`
4. Deploy, then back in Supabase → Auth → URL Configuration → add `https://<your-app>.onrender.com/auth/callback`.

Health check path: `/`. WebSockets run on the same port at `/ws` — no extra config needed.

## Project structure

```
server.js          # API, cookie sessions, CSV export, WS hub, auto-seed
public/index.html  # the whole SPA (served with SPA fallback)
schema.sql         # Supabase tables — run once in the SQL Editor
render.yaml        # Render deploy blueprint
.env.example       # required env vars (.env itself is git-ignored)
```

## Security notes

- The `service_role` key lives only on the server (`.env` / host env vars). The browser never sees it.
- Sessions are `HttpOnly` cookies (`cp_sid`, 7-day expiry).
