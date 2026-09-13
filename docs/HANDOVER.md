# FoodRaksha — Production Handover & Go-Live Runbook

This is the single source of truth for taking the FoodRaksha platform (marketing
site **and** CRM/portal) from the current codebase to a live production system
you can hand to the client.

The **code is production-grade** and typechecks clean. What remains is
**operational provisioning** — creating the client's accounts and setting
secrets — plus a short list of pre-launch data and verification steps. Work
through the checklist below in order.

---

## 0. Pre-launch checklist (tick as you go)

**Accounts & infrastructure**
- [ ] Supabase project created (Postgres) — region **ap-south-1 (Mumbai)**
- [ ] Vercel project connected to the repo — region **bom1 (Mumbai)** (already set in `vercel.json`)
- [ ] Object storage buckets created (Supabase Storage or Cloudflare R2), **private**
- [ ] Resend account + verified sending domain (SPF/DKIM)
- [ ] MSG91 account + **DLT-registered** sender ID and template IDs (India — allow lead time)
- [ ] Production domain chosen and pointed at Vercel

**Secrets set in Vercel (Project → Settings → Environment Variables)**
- [ ] `DATABASE_URL`, `DIRECT_URL`
- [ ] `AUTH_SECRET` (`openssl rand -base64 48`)
- [ ] `NEXT_PUBLIC_APP_URL` (the real https URL)
- [ ] `S3_*` (endpoint, region, keys, buckets)
- [ ] `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`
- [ ] `MSG91_*` (auth key, sender ID, both template IDs)

**Database**
- [ ] `prisma migrate deploy` has run (happens automatically on Vercel build)
- [ ] Admin seeded once (`npm run db:seed`), initial password captured
- [ ] `SEED_DEMO` is **NOT** set in production (no fake data)
- [ ] Supabase automated backups / PITR enabled

**Data & content**
- [ ] Real contact details filled in `src/lib/marketing/contact.ts` + `docs/CONTACT.md`
- [ ] FSSAI reference data verified with the client (categories, fee schedule, form sections)
- [ ] Legal reviewed: `/privacy` confirmed; Terms added if required; DPDP (India) reviewed

**Verification**
- [ ] `npm run typecheck` and `npm test` green (run locally / in CI)
- [ ] `npm run build` succeeds
- [ ] Automated end-to-end suite passed: `npm run test:e2e` (see `e2e/README.md`) — run against a dev/staging DB
- [ ] Manual end-to-end smoke test passed (Section 7)

**Recommended before launch**
- [ ] Staff-assisted password reset smoke-tested on staging (now implemented — Section 8)
- [ ] Error monitoring enabled (Sentry seam in `src/lib/log.ts`)

---

## 1. Architecture at a glance

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- **Two apps, one codebase:**
  - **Marketing site** — `src/app/(marketing)/…`, scoped to the `.fr-site` theme.
  - **CRM / portal** — `src/app/(auth)`, `src/app/(customer)`, `src/app/(staff)`, on the separate "Titanium" theme.
- **Database:** PostgreSQL via Prisma. On Supabase, the app uses the **transaction pooler (6543)** and migrations use the **direct connection (5432)**. `pg_trgm` extension is required (the migration enables it).
- **Auth:** custom, in `src/lib/auth/*` — hashed passwords, HMAC-derived session tokens, sliding sessions, per-mobile + per-IP login rate limiting, role-based guards (`CUSTOMER` vs staff/`ADMIN`).
- **Storage:** S3-compatible (Supabase Storage or Cloudflare R2), private buckets, signed URLs (≤15 min), browser uploads via presigned PUT with server-side magic-byte validation.
- **Notifications:** email via **Resend**, SMS via **MSG91** — both optional and degrade gracefully when unconfigured.
- **Hosting:** Vercel, region `bom1`. Build command `vercel-build` = `prisma migrate deploy && next build`.
- **Security headers:** CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` — all set in `next.config.ts`.

---

## 2. What's already production-ready (verified)

- Auth: password hashing, HMAC session tokens (a leaked DB cannot forge sessions), sliding sessions, login rate limiting, generic error messages (no account enumeration), open-redirect protection on post-login `next`.
- Authorization: portal **pages** are guarded at the layout level (`requireCustomer` / `requireStaff`); **API routes** enforce `getSession()` + a role check.
- File uploads: quarantine → server-side magic-byte inspection before anything is kept (client MIME is not trusted); signed URLs capped at 15 min.
- Input validation with Zod across API routes and server actions; audit logging (`src/lib/audit.ts`).
- Environment validated at boot (`src/lib/env.ts`) — bad config fails fast rather than at first request.
- Graceful degradation: no storage → uploads are cleanly switched off with a message; no email/SMS → credential delivery is reported as "skipped," never a failure (credentials are shown on screen).
- Secrets hygiene: `.env*` is git-ignored (only `.env.example` is committed).
- Tests: unit tests for the status machine, validation, annexure isolation/applicability/render, filing, and password generation.
- Seed is safe: reference data + exactly one admin (idempotent upserts); demo data only when `SEED_DEMO=true`.

---

## 3. Prerequisites (accounts to create)

These require the **client's own accounts and billing** — they can't be created
on their behalf. Gather:

1. **Supabase** project (Postgres + Storage) — region ap-south-1.
2. **Vercel** account/team with access to this Git repo.
3. **Resend** account + the domain you'll send from (to verify SPF/DKIM).
4. **MSG91** account + **DLT registration** (sender ID + transactional templates). In India this has a lead time — start early.
5. A **production domain** (e.g. `app.foodraksha.in`).

---

## 4. Provisioning, step by step

### 4.1 Database (Supabase)
1. Create the project (region ap-south-1).
2. Project Settings → Database → Connection string:
   - **Transaction pooler (6543)** → `DATABASE_URL`; append `?pgbouncer=true`.
   - **Session / direct (5432)** → `DIRECT_URL`.
3. `pg_trgm` is enabled by the Prisma migration — no manual step.

### 4.2 Auth secret
```
openssl rand -base64 48
```
Set as `AUTH_SECRET`. **Rotating it later logs everyone out.**

### 4.3 Object storage (documents + templates)
Create **two private buckets**: `foodraksha-documents` and `foodraksha-templates`.
- Supabase: Storage → S3 connection for `S3_ENDPOINT`; **S3 access keys** (not the anon/service JWT); set `S3_REGION` to the real region (Supabase rejects `auto`).
- Cloudflare R2: endpoint `https://<account-id>.r2.cloudflarestorage.com`, `S3_REGION="auto"`.
- Add a **CORS rule** allowing `PUT` from your app origin:
  ```json
  [{ "AllowedOrigins": ["https://app.foodraksha.in"],
     "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"] }]
  ```
> Without storage, document upload — a core CRM feature — stays switched off.

### 4.4 Email (Resend)
Create an API key (`RESEND_API_KEY`), verify the sending domain (SPF/DKIM), set
`EMAIL_FROM` and `EMAIL_REPLY_TO`.

### 4.5 SMS (MSG91)
Set `MSG91_AUTH_KEY`, the DLT `MSG91_SENDER_ID` (6 chars, e.g. `FDRKSH`), and the
two DLT template IDs: `MSG91_TEMPLATE_ID_CREDENTIALS` and
`MSG91_TEMPLATE_ID_STATUS_UPDATE`.
> Without email **and** SMS, customers won't automatically receive login
> credentials or status updates — the credentials still appear on screen at
> signup, so staff can relay them manually until this is configured.

### 4.6 App URL
Set `NEXT_PUBLIC_APP_URL` to the real https URL (used in emails, SMS links, and
signed-URL callbacks).

---

## 5. Environment variables

Full reference lives in `.env.example` (it is thorough — read the comments).
Required vs optional:

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | **Yes** | Pooler (6543) + `?pgbouncer=true` |
| `DIRECT_URL` | **Yes in prod** | Direct (5432); migrations/seed |
| `AUTH_SECRET` | **Yes** | ≥32 chars; `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | **Yes in prod** | Real https base URL |
| `SESSION_DURATION_DAYS` | No | Default 30 |
| `LOGIN_RATE_LIMIT_ATTEMPTS` / `_WINDOW_MINUTES` | No | Default 5 / 15 |
| `S3_ENDPOINT` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | For uploads | Private buckets |
| `S3_BUCKET_DOCUMENTS` / `S3_BUCKET_TEMPLATES` | For uploads | Bucket names |
| `S3_SIGNED_URL_TTL_SECONDS` | No | ≤900 (enforced) |
| `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_REPLY_TO` | For email | |
| `MSG91_AUTH_KEY` / `MSG91_SENDER_ID` / `MSG91_TEMPLATE_ID_*` | For SMS | DLT-registered |
| `SEED_ADMIN_PASSWORD` | No | Sets the admin's first password (else random, printed once) |
| `SEED_DEMO` | **Leave unset in prod** | `true` creates fake data |
| `SENTRY_DSN` | Optional | See Section 8 |

---

## 6. Deploy, migrate, seed

1. **Connect the repo to Vercel** and set all env vars above (Production scope).
2. **Deploy.** The `vercel-build` script runs `prisma migrate deploy` (applies all
   migrations via `DIRECT_URL`) and then `next build`. Region `bom1` is preset.
3. **Seed the admin once** (against the direct connection). Locally, with prod
   `DATABASE_URL`/`DIRECT_URL` in your shell:
   ```
   SEED_ADMIN_PASSWORD='choose-a-strong-one' npm run db:seed
   ```
   The seed prints the admin sign-in details **once** — capture them. It is
   idempotent (safe to re-run) and creates **no** demo data unless `SEED_DEMO=true`.

> **Migrations are forward-only.** Never point `migrate deploy` at a database
> whose schema is ahead of the code. Test migrations on a staging copy first.

---

## 7. First login + end-to-end smoke test

Do this on the live URL before handover. Each step exercises a subsystem.

1. **Staff:** sign in at `/login` → "I'm staff" as the admin → open
   **Admin → Team** in the sidebar → create the client's real staff users.
   Each login's password is shown once for hand-over; use **Reset password**
   on the row if it is lost.
2. **Marketing → lead:** submit the "Book a free consultation" / get-started form
   on the marketing site → confirm the lead appears on the staff desk.
3. **Convert:** staff converts the lead into a customer account → confirm
   credential delivery (SMS/email if configured, else on-screen).
4. **Customer:** sign in at `/login` → complete a questionnaire section.
5. **Upload:** upload a document → confirm it lands (requires storage) and staff
   can view it.
6. **Review:** staff approves / rejects a document with a reason → customer sees
   the outcome on their dashboard.
7. **Status:** staff advances application status → confirm the status-update
   message (requires SMS/email).
8. **Licence:** run the licence/letterhead generation for a completed application.

If every step passes, the platform is functionally live.

---

## 8. Known limitations & recommended before launch

1. **Password recovery — staff-assisted reset is now implemented.** In the staff
   portal, open a client's file → **Account → Reset password**. It generates a new
   password, signs the customer out of every session, delivers it by SMS/email
   (best effort), records an audit entry, and shows the credentials on screen for
   staff to relay. It works even before email/SMS is configured.
   - **Verify once on staging.** It was built to the existing `convertLead`
     patterns and typechecks/lints clean, but it has not yet been run against a
     live database.
   - *Optional enhancement:* a **self-serve "Forgot password"** flow (the login
     copy references one). It needs a new `PasswordResetToken` model + migration
     and email or SMS configured to deliver the token — build it with test
     coverage when you want customers to self-recover without contacting staff.
2. **Error monitoring not enabled.** `src/lib/log.ts` is a ready seam for Sentry.
   To turn it on: `npm i @sentry/nextjs`, wire it in `log.ts`, set `SENTRY_DSN`.
3. **Backups.** Enable Supabase automated backups / point-in-time recovery.
4. **Legal.** `/privacy` exists — have counsel confirm it and India's DPDP Act
   requirements; add Terms of Service if the client needs one.
5. **Placeholder marketing data.** Real phone/email/address/WhatsApp/social must be
   filled in `src/lib/marketing/contact.ts` (and `docs/CONTACT.md`), and
   `CONTACT_IS_PLACEHOLDER` set to `false`. The build prints a warning while
   placeholders remain.

---

## 9. Ongoing operations

- **Backups & PITR:** Supabase, verify a restore at least once.
- **Monitoring:** Sentry (above); watch Vercel function logs and Supabase logs.
- **Secrets:** rotating `AUTH_SECRET` logs everyone out; rotate storage/provider
  keys on a schedule.
- **Rate limits & sessions:** tune via `LOGIN_RATE_LIMIT_*` and
  `SESSION_DURATION_DAYS` env vars — no code change needed.
- **Rollback:** Vercel → Deployments → promote a previous build for an instant UI
  rollback. Remember migrations are forward-only — a UI rollback does **not** undo
  a schema change.
- **Adding staff:** an administrator opens **Admin → Team** (`/staff/team`),
  enters name, work email, mobile and role (Staff or Administrator), and hands
  over the one-time password. Staff sign in with their work email (mobile also
  works). Nobody is deleted — **deactivate** instead, which signs them out
  everywhere at once and keeps their history on every file they touched. The
  page refuses to deactivate the last active administrator or yourself.
  `STAFF` and `ADMIN` are otherwise identical inside the CRM today; only Team
  management is admin-only.

---

## 10. Handy commands

```
npm run dev            # local dev server
npm run typecheck      # tsc --noEmit
npm test               # unit tests (Node test runner)
npm run build          # production build
npm run db:migrate     # create a migration in dev
npm run db:seed        # reference data + admin (idempotent)
npm run db:studio      # inspect the database
npm run dev:storage    # local S3-compatible storage for dev
```

---

*Status at handover: code complete and typechecking clean; go-live is gated on the
provisioning and data steps above, plus the password-recovery decision in Section 8.*
