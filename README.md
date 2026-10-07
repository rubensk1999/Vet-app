# Vet App — Backend Scaffold

## Stack
- **Next.js 16** (App Router, `src/` dir)
- **Prisma ORM 7** with the mandatory `@prisma/adapter-pg` driver adapter
- **Better Auth 1.6** for authentication (email/password + admin plugin)
- PostgreSQL

## What's included
- Prisma schema: Better Auth's `User`/`Session`/`Account`/`Verification`
  tables (extended with our `role` and `phone` fields), plus our own
  `Pet`, `TimeSlot`, `Appointment` models
- Better Auth config (`src/lib/auth.ts`) — email/password sign-up/login,
  plus the **admin plugin**, which gives us a permission-checked
  `auth.api.createUser()` for the "admin creates staff" flow
- API routes:
  - `POST/GET /api/auth/[...all]` — Better Auth's catch-all handler
    (sign-up, sign-in, sign-out, session, etc. — you don't write these
    yourself)
  - `POST /api/admin/staff` — admin-only, creates a `staff` user via
    the admin plugin
  - `GET/POST /api/pets` — logged-in users manage their pets
  - `GET/POST /api/slots` — public read, staff/admin create slots
  - `GET/POST /api/appointments` — booking with transaction-safe
    double-booking prevention
- `src/proxy.ts` — Next.js 16's renamed `middleware.ts`, blocking
  `/admin/*` and `/staff/*` by role
- `prisma/seed.ts` — idempotent script that signs up the first admin
  through Better Auth itself, then promotes their role

## Setup

1. Install dependencies (this also runs `prisma generate` via
   `postinstall`):
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values (get a free
   Postgres instance from Supabase or Railway; generate
   `BETTER_AUTH_SECRET` with `openssl rand -base64 32`).
3. Run the initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed the first admin:
   ```bash
   npx prisma db seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Using Prisma 7 (important if you've used older Prisma before)

- The Prisma Client is **generated into `src/generated/prisma`**, not
  `node_modules`. Always import it as `from '@/generated/prisma'`,
  never `from '@prisma/client'`.
- A **driver adapter is mandatory** — Prisma 7 has no built-in Rust
  query engine anymore. `@prisma/adapter-pg` + `pg` handle the actual
  Postgres connection; `lib/prisma.ts` wires this up already.
- The database URL and seed command live in **`prisma.config.ts`**,
  not in `schema.prisma`'s `datasource` block or `package.json`.

## Using Better Auth (if you've used Auth.js/NextAuth before)

- There's no `getServerSession()` — use
  `auth.api.getSession({ headers: await headers() })` instead.
- Passwords are **not** stored on the `User` model — they live in
  `Account.password`, hashed by Better Auth itself. Never write to
  that column directly; always go through `auth.api.signUpEmail` /
  `auth.api.createUser`.
- Role-based access is handled by the **admin plugin**
  (`adminRoles: ['admin']` in `lib/auth.ts`) — `auth.api.createUser`
  automatically rejects the call unless the caller's session role is
  in that list, so `/api/admin/staff` doesn't need to reimplement
  that check.
- The client-side equivalent (for your future signup/login pages) is
  `better-auth/react`'s `createAuthClient()` — not covered yet since
  the frontend isn't built.

## Using Next.js 16's proxy.ts (if you've used middleware.ts before)

- `middleware.ts` is renamed to `proxy.ts`, and the exported function
  is `proxy()` instead of `middleware()`. Functionally equivalent —
  the file just moved and got a clearer name.
- It now runs on the Node.js runtime by default, which is why it's
  safe to call `auth.api.getSession()` (a real DB-backed session
  check) directly inside it, rather than only checking for a cookie's
  existence.

## Testing

```bash
npm test          # run once
npm run test:watch  # watch mode while developing
```

What's covered so far, and why these specific things:

- **`src/lib/appointments.test.ts`** — the double-booking prevention
  logic (`bookAppointment`), with a mocked Prisma client. Verifies:
  booking an available slot works, booking an already-booked or
  nonexistent slot is rejected, and the slot is marked booked *before*
  the appointment is created (not after — that ordering is what makes
  the check-then-act sequence safe).
- **`src/lib/access.test.ts`** — the role-gating rules used by
  `proxy.ts`. Includes two tests written specifically as regression
  guards for a real bug found during manual review: staff were
  initially blocked from their own `/admin/slots` and
  `/admin/appointments` pages by an overly broad check.

**What this suite does NOT cover yet** (needs a real database, so it's
integration-level, not unit-level):
- The actual Postgres `@unique` constraint rejecting a true concurrent
  double-booking — covered manually by `sanity-check.sh` (step 9) for
  now.
- Full request/response behavior of the API routes (auth, status
  codes, payload shapes).
- Any of the frontend pages.

A reasonable next step, once the app has a staging database, is
integration tests (e.g. with a real test Postgres instance in CI) and
Playwright for the booking flow end-to-end. Worth adding once the
core logic above is stable — not before, since integration tests are
slower and pull in more moving parts, and unit tests already catch
the highest-value bugs (like the two regressions above) faster and
cheaper.

## CI/CD

`.github/workflows/ci.yml` runs on every push and PR to `main`:
lint → apply migrations to a throwaway Postgres → unit tests → build.
This is deliberately more than "just run the tests" — spinning up a
real (if temporary) Postgres in CI means a broken migration fails the
build here, not on your production database during a real deploy.

## Deployment (Vercel + hosted Postgres)

1. **Get a production Postgres.** Neon, Supabase, and Railway all have
   a free tier that's fine for a single clinic. Copy the connection
   string.
2. **Push this repo to GitHub**, then import it in Vercel
   ("Add New… → Project").
3. **Set environment variables** in Vercel's project settings
   (Settings → Environment Variables) — the same names as
   `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET` (a fresh one,
   not your local dev secret), `BETTER_AUTH_URL` (your real domain,
   e.g. `https://your-app.vercel.app`), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. **The build command is already set** via `vercel.json` (runs
   `prisma migrate deploy` before `next build`), so your production
   schema stays in sync with `prisma/migrations/` on every deploy —
   nothing to configure in the dashboard for this.
5. **Deploy.** Vercel builds and deploys automatically on every push
   to `main` from here on — that's the "CD" half.
6. **Seed the production admin once**, after the first successful
   deploy: run `npx prisma db seed` from your machine with `DATABASE_URL`
   pointed at production (or add it as a one-off Vercel deployment
   script). Do this once, then rotate `ADMIN_PASSWORD` immediately after
   first login.

One thing worth knowing since you're new to this: **running migrations
as part of every build** (step 4) is a reasonable default for a
single-database, single-environment project like this, but it's a
real trade-off — a bad migration can now block your build, and there's
no separate "review the migration before it hits prod" step. Fine for
now; worth revisiting (staging environment + manual migration
approval) if this ever handles a business you can't afford downtime
for.

## What's left to build
- Email notifications (currently just a TODO comment in the staff
  creation route)
- Integration tests and Playwright end-to-end coverage (see Testing
  section above)
- A staging environment, if this grows beyond one clinic
