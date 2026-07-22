# FoodRaksha

FSSAI licensing platform — CRM first, marketing site and partner portal later,
all in one Next.js codebase.

Read [CLAUDE.md](./CLAUDE.md) before changing anything. The design system is in
[docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md), the schema of record in
[docs/DATA-MODEL.md](./docs/DATA-MODEL.md).

## Setup

Requires Node 20+ and PostgreSQL 14+.

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET
createdb foodraksha_dev       # or point DATABASE_URL at an existing database
npm run db:migrate            # applies prisma/migrations
npm run db:seed               # prints the passwords it generates
npm run dev
```

`AUTH_SECRET` needs 32+ characters: `openssl rand -base64 48`.

## Signing in

The seed prints one admin and two customer logins. Mobile number is the
username; a 10-digit number, `+91…` or `0…` are all accepted.

| Portal   | Route                     | Who                  |
| -------- | ------------------------- | -------------------- |
| Customer | `/login` → `/dashboard`   | Food business owners |
| Staff    | `/staff/login` → `/staff` | FoodRaksha employees |

Each portal rejects the other's users — a customer sent to `/staff` lands back
on `/dashboard`, and the reverse.

To seed with passwords you choose:

```bash
SEED_ADMIN_PASSWORD=... SEED_CUSTOMER_1_PASSWORD=... npm run db:seed
```

## Account creation

Signup is an API endpoint, not a page — the marketing website (phase 2) will
call the same one:

```
POST /api/public/signup
{ name, mobile, email, businessType, city, consent,
  utmSource?, utmMedium?, utmCampaign?, referrer? }
→ 201 { username, password, applicationNo, delivery }
→ 400 validation · 409 duplicate mobile · 429 rate limited
```

One transaction creates the Lead, User, Customer and a DRAFT application; the
generated password is returned once and never stored or logged. Limits are 5
requests per IP per hour and 3 per mobile per day.

`/get-started` is a **temporary** internal caller for that endpoint. Delete it
when the marketing site ships. Credential delivery uses the adapters in
`src/lib/notifications` — without `RESEND_API_KEY` / `MSG91_AUTH_KEY` set,
delivery is reported as skipped and signup still succeeds.

## Scripts

| Command              | What it does                                          |
| -------------------- | ----------------------------------------------------- |
| `npm run dev`        | Development server                                    |
| `npm run build`      | Production build — must pass before any stage is done |
| `npm run typecheck`  | `tsc --noEmit`                                        |
| `npm run lint`       | ESLint                                                |
| `npm run format`     | Prettier                                              |
| `npm run db:migrate` | Create and apply a migration                          |
| `npm run db:seed`    | Seed categories, form sections, demo customers        |
| `npm run db:reset`   | Drop, re-migrate and re-seed                          |
| `npm run db:studio`  | Prisma Studio                                         |

## Design reference

`/design-system` renders every UI primitive in every state. Compare it with
`docs/prototype.html`, the client-approved prototype.
