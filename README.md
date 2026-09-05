# FoodRaksha

FSSAI licensing platform — CRM first, marketing site and partner portal later,
all in one Next.js codebase.

Read [CLAUDE.md](./CLAUDE.md) before changing anything. The design system is in
[docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md), the schema of record in
[docs/DATA-MODEL.md](./docs/DATA-MODEL.md).

**Going live?** Follow the production handover & go-live runbook:
[docs/HANDOVER.md](./docs/HANDOVER.md) — provisioning, env vars, deploy,
smoke test, and the pre-launch checklist.

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

## The questionnaire

`/application/[section]` is a schema-driven wizard: it renders whatever
`FormSection.fields` says, so a new question is a database change and nothing
more. Answers live in `Application.data` keyed by the canonical field keys in
[docs/DATA-MODEL.md](./docs/DATA-MODEL.md).

- Sections shown = core sections + the `extraSections` on the customer's
  business category. A restaurant never sees Equipment & Capacity.
- A field key asked in two sections is asked **once**; later sections show the
  answer read-only with a link back to where it was entered.
- Autosave posts the whole section to `POST /api/customer/application/section`,
  which merges with `data || patch` in Postgres — concurrent saves cannot lose
  each other's keys. Completion is recomputed server-side on every save.
- `/application/review` reads everything back in plain language and submits.

Field types: `text`, `multiline`, `number`, `date`, `select`, `multiselect`,
`radio`, `checkbox`, `group` (repeatable rows), plus `tel`/`email` and
`file`/`signature` placeholders until uploads land. Add `"width": "half"` to
two consecutive fields to put them side by side.

## Files and uploads

Buckets are private. Nothing is ever served from a public URL.

1. The browser asks `POST /api/customer/documents/presign` for permission and
   gets a **presigned PUT** valid for five minutes. (R2 does not support
   presigned POST — its S3 API presigns GET, HEAD, PUT and DELETE only.)
2. It uploads straight to storage, into a `quarantine/` key.
3. `POST /api/customer/documents/finalize` reads the bytes back, identifies the
   file **by magic bytes** — never by extension or the browser's content type —
   re-encodes images to strip EXIF (including GPS), and only then writes the
   real object and the `Document` row.
4. Reading a file goes through `GET /api/customer/documents/[id]/file`, which
   redirects to a signed URL that expires in 15 minutes. Only storage keys are
   kept in the database.

Passport photographs are cropped to 3:4 and stored as PNG. Signatures — drawn
on the canvas or uploaded as a scan — are converted to black ink on a
transparent background and trimmed to the strokes, so they drop straight into a
PDF signature box later.

Without S3 credentials the upload UI says so plainly and the rest of the
application keeps working. For local development run `npm run dev:storage`
(in-memory, unsigned, loopback only — never point anything real at it).

## The staff desk

`/staff` is where employees spend the day, so it is built for density and for
never losing your place.

- Every list control — search, filter chip, sort, page — lives in the URL.
  The slide-over does **not**: opening a customer fetches
  `GET /api/staff/applications/[id]` and renders a panel. Nothing navigates, so
  scroll position, filters and page survive every open and close.
- 50 rows per page, server-side. Chip counts are live and respect the current
  search: two queries, not seven.
- "Not logged in" is `User.lastLoginAt IS NULL` — accounts created and never
  used. It is the client's follow-up list, and it is indexed.
- Search covers name, mobile, business name and application number. Each branch
  is looked up on its own table so the trigram indexes apply; a single
  cross-table `OR` cannot use them.
- Staff editing reuses the questionnaire renderer in embedded mode. Every
  changed field writes an `AuditLog` row with before and after values, in the
  same transaction as the change. Unchanged values write nothing.
- Documents are approved, or rejected with a reason the customer reads on their
  own documents page. Raising a query moves the application back to the
  customer and records a `StatusEvent`.

Staff access is flat by design: any staff user can open any customer.

## Annexures

FoodRaksha staff key applications into the FoSCoS portal themselves, and FoSCoS
produces Form A and Form B. This system therefore never fills a government
application form — it produces the **supporting annexures** that get attached
(see [docs/FINDINGS.md](./docs/FINDINGS.md)).

| Annexure                                  | When it applies                                                  |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Form IX — Nomination of Persons           | Every application                                                |
| List of Directors / Partners / Proprietor | Every application, heading follows the constitution              |
| Self-Declaration for Proprietorship       | Constitution is Proprietorship                                   |
| List of Equipment and Machinery           | Manufacturing categories, once the equipment section is answered |
| Recall Plan                               | Manufacturing categories, once there is product data             |

That rule lives in one tested function,
[`applicableAnnexures`](./src/lib/annexures/applicability.ts).

Documents are React components rendered server-side with `@react-pdf/renderer`
— A4, 20mm margins, Inter embedded from `src/assets/fonts` so output never
depends on the network or the machine. Signatures and photographs are elements
in the layout, not coordinates on a page. Missing answers print as a ruled
line, never as "undefined".

Statutory wording in Form IX is reproduced verbatim from
`docs/forms/FORM_IX.pdf`, typographical quirks included: it is a statutory
format, not ours to tidy.

**Determinism.** The same answers always produce the same document: PDF
timestamps are fixed to the submission date and font subset tags are
normalised. Byte-for-byte equality is not guaranteed, because the writer emits
font objects in a racy order — `contentFingerprint()` compares what a reader
would actually see, and that is what the tests assert.

Staff generate from the customer slide-over, where they can also set the
letterhead (name, address, contact, CIN — plus a logo uploaded as a document).
Output is stored privately and downloaded through the same 15-minute signed
URLs as everything else.

## Filing workspace

`/staff/applications/[id]/filing` is built to sit on one half of the screen
with the FoSCoS portal open on the other. FoodRaksha files applications by
re-keying them into FoSCoS by hand, and that retyping is the biggest cost and
error source per file — this screen removes it.

- Fields run in **FoSCoS screen order**, not our questionnaire order, under the
  portal's own headings, so staff tab down in lockstep. The order lives in one
  data file, [`foscos-layout.ts`](./src/lib/filing/foscos-layout.ts).
- **Every field is one click to copy**, with a visible "Copied" flash, and each
  copied field ticks off so staff can see their place if interrupted (tracking
  is session-local — it does not need persisting). Sections the portal accepts
  as pasted multi-line input (address, food categories, directors) have a
  **Copy block** button.
- A **completeness check** runs before filing: invalid PIN / GSTIN / mobile /
  Aadhaar, missing required answers, and any required document not yet approved.
  Errors block a clean filing; a document still awaiting review is a warning.
- The **attachment tray** lists every uploaded document and every generated
  annexure together, each downloaded through a 15-minute signed URL. A rejected
  document is shown but cannot be attached.
- Recording the filing takes the FoSCoS reference number, sets the application
  to `FILED`, writes a `StatusEvent` and audit row, and notifies the customer
  by email and SMS (best effort).

Values are reshaped for the portal where it helps — the licence tenure drops
its "years" suffix to match the dropdown, and the premises address is offered
as one pasteable block.

## Status pipeline

The application moves through one state machine, defined and enforced in
[`status-machine.ts`](./src/lib/status-machine.ts):

```
DRAFT → SUBMITTED → UNDER_REVIEW → (QUERY_RAISED ⇄) → READY_TO_FILE →
FILED → (FSSAI_QUERY ⇄) → ISSUED → CLOSED
```

- Legal transitions live in one place; an illegal move is refused with the list
  of what _is_ allowed. `transition()` guards on the current status and writes
  the change and its `StatusEvent` in the same transaction — they can never
  come apart.
- Staff change status from the slide-over, seeing only the transitions the
  machine permits, each with an optional note. Filing and licence issue have
  their own richer flows.
- **Queries** are raised against a section or document with a message; the
  application moves to `QUERY_RAISED` and the customer sees it on their
  dashboard with a direct link to the thing to fix. Resolving the last open
  query returns it to `UNDER_REVIEW` — or the customer resubmitting does the
  same.
- **Licence issued**: staff enter the licence number and expiry and upload the
  FSSAI PDF; it stores on the application and the customer downloads it through
  a 15-minute signed URL.

**Notifications** — query raised, document rejected, filed, licence issued —
go by email and SMS through the same adapter interface as signup
([`notifications/customer.ts`](./src/lib/notifications/customer.ts)). Every one
is best effort: a provider being down is logged, never allowed to undo the
action that triggered it.

The **customer timeline** shows only the five milestones a customer
recognises — account created, submitted, under review, filed, issued. The
internal sub-states (`READY_TO_FILE`, and the query round-trips) never appear
on it.

## Scripts

| Command                    | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Development server                                    |
| `npm run build`            | Production build — must pass before any stage is done |
| `npm run typecheck`        | `tsc --noEmit`                                        |
| `npm run lint`             | ESLint                                                |
| `npm run format`           | Prettier                                              |
| `npm run db:migrate`       | Create and apply a migration                          |
| `npm run db:seed`          | Seed categories, form sections, demo customers        |
| `npm run db:reset`         | Drop, re-migrate and re-seed                          |
| `npm run db:studio`        | Prisma Studio                                         |
| `npm test`                 | Unit tests (no database needed)                       |
| `npm run test:integration` | Integration & e2e tests (needs a database)            |
| `npm run dev:storage`      | Development-only in-memory object store               |

## Environment variables

Copy `.env.example` to `.env` and fill it in. Every variable is documented
there; `src/lib/env.ts` validates them at startup, so a bad value fails fast
rather than at the first request.

| Variable                                                                            | Required    | What it is                                                                                  |
| ----------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                      | yes         | PostgreSQL connection string                                                                |
| `AUTH_SECRET`                                                                       | yes         | 32+ random chars; keys session tokens. `openssl rand -base64 48`                            |
| `NEXT_PUBLIC_APP_URL`                                                               | yes         | Absolute base URL, used in emails and links                                                 |
| `SESSION_DURATION_DAYS`                                                             | no          | Session lifetime, default 30                                                                |
| `LOGIN_RATE_LIMIT_*`                                                                | no          | Failed-login window and count                                                               |
| `S3_ENDPOINT` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET_DOCUMENTS` | for uploads | Cloudflare R2 (private bucket). Without them, uploads are switched off with a clear message |
| `S3_SIGNED_URL_TTL_SECONDS`                                                         | no          | Download-link lifetime, capped at 900 (15 min)                                              |
| `RESEND_API_KEY` / `EMAIL_FROM`                                                     | for email   | Resend. Absent = notifications skipped                                                      |
| `MSG91_AUTH_KEY` / `MSG91_SENDER_ID` / `MSG91_TEMPLATE_ID_*`                        | for SMS     | MSG91. Absent = notifications skipped                                                       |

Delivery and storage degrade gracefully: with no keys, the app runs and says so
rather than half-working.

## Security and privacy

- Every API route is authorised; none trusts a client-supplied user id.
  Customer routes scope every query by the session user, so changing an id in a
  URL returns 404 — there is a test for exactly this.
- Zod validates every server boundary. Login and signup are rate limited.
  Passwords are Argon2id and never logged; uploads are private, served only
  through 15-minute signed URLs.
- Security headers (CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.
- DPDP Act 2023: consent is captured with a timestamp at signup, there is a
  [privacy policy](/privacy), and customers can erase their data from
  `/account`. Deletion removes the account, application and files but keeps the
  `Lead` row with its personal fields redacted — attribution survives, personal
  data does not. Retention is seven years after issue or closure, then erased.

## Reliability

- Error boundaries on every route group, a global boundary, and a `not-found`
  page — all in plain language with a way forward.
- Loading skeletons (never spinners) on the dashboard, staff desk and
  questionnaire.
- Structured JSON logging (`src/lib/log.ts`) and a request-error hook
  (`src/instrumentation.ts`) that is the single seam for Sentry — drop in
  `@sentry/nextjs` and call `Sentry.captureException` inside `reportError`.

## Deployment

Built for **Vercel + Neon** (any managed Postgres works).

1. Create a Neon project; copy its pooled connection string.
2. On Vercel, set the environment variables above for **Production** and
   **Preview** (use a separate Neon branch for Preview so previews never touch
   production data). Local uses `.env`.
3. Set the Vercel **Build Command** to `npm run vercel-build` — it runs
   `prisma migrate deploy` before `next build`, so pending migrations apply on
   every deploy. `postinstall` runs `prisma generate`.
4. Point `S3_*` at a private Cloudflare R2 bucket with a CORS rule allowing
   `PUT` from your app origin (see `.env.example`).

**Migrations never drop data.** Production uses `prisma migrate deploy`, which
only applies committed migrations forward — never `migrate reset` or `db push`.
Every schema change is a new migration reviewed in a PR. For a destructive
change, expand first (add the new column, backfill, ship), then contract in a
later migration once nothing reads the old shape.

**Backups.** Enable Neon's point-in-time restore (automatic daily backups with
a retention window) in the project settings. For a belt-and-braces copy, a
scheduled `pg_dump` to object storage works; document the schedule with the
client.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and push to `main`:

- **quality** — `npm ci`, typecheck, lint, unit tests, build.
- **integration** — spins up a Postgres service, runs `prisma migrate deploy`,
  seeds, and runs the integration and e2e tests.

CI must be green to merge.

## Extending the system

### Add or change a questionnaire section

Sections and their fields are **data**, not code — this is the core of the
design. You do not touch a component to add a question.

1. Edit `prisma/seed-data.ts`: add a section to `SECTIONS`, or a field to an
   existing section's `fields`. A field is `{ key, label, type, required }`
   plus optional `options`, `validation`, `helpText`, `width: "half"`, or (for
   a repeatable group) `itemFields`. Field types: `text`, `multiline`,
   `number`, `date`, `select`, `multiselect`, `radio`, `checkbox`, `group`,
   `tel`, `email`, `file`, `signature`.
2. Use a **canonical field key** from `src/lib/fields.ts`. If the field is new,
   add its key there first — never rename a key already in use; deprecate and
   add.
3. Run `npm run db:seed`. The questionnaire, autosave, validation, review page,
   staff editor and document checklist all pick it up with no code change. To
   show a field in a category only, add the section key to that category's
   `extraSections`.

Once the staff section editor ships (a later phase), staff do this in the
database directly — the seed is just today's editing surface.

### Add a new PDF annexure template

Annexures are React components rendered server-side, **not** coordinate-placed
onto a blank form.

1. Create the template in `src/components/pdf/` (copy `FormIX.tsx` — use the
   shared `styles`, `Letterhead` and `SignatureLine` from `shared.tsx`; A4 with
   20mm margins; missing values render as a blank line via `orBlank`).
2. Register it: add a key to `ANNEXURE_KEYS` and a title in `ANNEXURE_TITLES`
   in `src/lib/annexures/applicability.ts`, decide when it applies in
   `applicableAnnexures` (with a test), and add it to the `TEMPLATES` map in
   `src/lib/annexures/generate.ts`.
3. If it needs data not already assembled, add it to `AnnexureContext` in
   `src/lib/annexures/data.ts`.

The generator stores it, records a `GeneratedPdf`, and surfaces it in the staff
slide-over and the filing tray automatically. There is no coordinate mapping to
maintain — that is deliberate (`CLAUDE.md`).

## Design reference

`/design-system` renders every UI primitive in every state. Compare it with
`docs/prototype.html`, the client-approved prototype.
