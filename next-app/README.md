# CampusPulse — Next.js rebuild (`next-app/`)

Production-ready student registration + onboarding on **Next.js 14 + TypeScript +
React Hook Form + Zod + Prisma (PostgreSQL) + Tailwind**. This folder is independent:
the live Render/Vercel deployments keep serving `../server.js` + `../public/` until
this app is promoted.

## Structure

```
app/
  page.tsx            welcome screen
  register/page.tsx   4-step wizard host
  login/page.tsx      sign-in
  dashboard/page.tsx  student dashboard (force-dynamic, session-gated)
  api/register/route.ts  validation → normalize → transaction → session cookie
  api/login/route.ts     bcrypt verify + rate limit + session cookie
components/
  ui.tsx              Button, Field, inputs, Chips, StepIndicator
  wizard/             Wizard shell + StepAbout/Education/Goals/Abroad
lib/
  schemas.ts          shared Zod schemas (client + server)
  registration.ts     calculateAge, gates, subject/career/exam maps, normalizePayload
  session.ts          HMAC-signed cookie sessions
  db.ts               Prisma singleton
data/
  countries.ts        ISO country metadata (phone, nationality, dial, flag)
  india.ts            states/UTs + major districts (extend from Census)
prisma/
  schema.prisma       normalized models
  seed.ts             upserts countries, states, districts
tests/
  registration.test.ts  conditional matrix incl. Graduate regression
```

## Setup

```bash
cd next-app
cp .env.example .env        # set DATABASE_URL + SESSION_SECRET
npm install
npm run db:migrate          # creates normalized tables (Postgres; Supabase URL works)
npm run db:seed             # countries + Indian states/districts
npm run dev
```

## Verify

```bash
npm run typecheck   # strict tsc
npm test            # vitest incl. "Graduate student can submit" regression
npm run build
```

## Key design decisions

- **Normalize-then-validate**: `normalizePayload()` strips stale hidden-field values
  before Zod runs — on client submit AND in the API route. Hidden UI state can never
  block submission or pollute the DB.
- **Same schemas both sides**: step schemas drive per-step Next; the merged
  `registrationSchema` (+ grade gates) runs on client submit and server-side.
- **UG/Graduate end at Step 3**: `shouldShowStudyAbroad()` hides Step 4; the server
  rejects school-only data for higher grades as defence in depth.
- **Location as data**: `Country → State → District` lives in `data/` + `Country/
  State/District` tables — never hard-coded in components. Missing subdivisions fall
  back to manual entry.
- **Auth**: bcryptjs (12 rounds), HMAC-signed `cp_session` cookie, HttpOnly +
  SameSite=Lax (+ Secure in prod), 7-day expiry, login rate-limited 10/min/IP.
```

