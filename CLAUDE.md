# FoodRaksha — Project Context

> Place this file at the **root of the repository**. Claude Code loads it automatically every session.

---

## What this is

FoodRaksha is an Indian FSSAI food-licensing consultancy. This repository is their platform, built in three phases inside **one Next.js codebase**:

1. **CRM** ← building now
2. **Marketing website** — next
3. **Partner Portal** — last

Do not build phases 2 or 3 unless explicitly asked. Do design so they slot in without a rewrite.

## The core problem the CRM solves

An FSSAI application requires **15–17 separate government PDF forms**. Filling them by hand is slow and error-prone.

The system's job:

> **Ask once, print everywhere.**

The customer answers **~10 logical sections**. The system fans that data across all 17 PDFs. "Business Name" is asked once and written into the dozen forms that need it.

If you ever find yourself making the customer type the same value twice, the design is wrong.

## The two portals

| | Customer Portal | Staff Portal |
|---|---|---|
| Who | Food business owners | FoodRaksha employees |
| Layout | **Desktop-first** | Desktop-only |
| Access | Own application only | Every customer, flat — no per-user restrictions |

**Staff access is flat.** Every employee sees and edits every customer. `User.role` exists so an Admin/Agent split can be added later — do not build permission tiers now.

## Architectural rules

**Account creation is an API endpoint, not a page.**
The real signup form lives on the marketing website (phase 2). Build `POST /api/public/signup` now as the single entry point, with a temporary internal page that calls it. When the website is built it calls the same endpoint. Never duplicate this logic.

**Questionnaire answers live in `Application.data` (JSONB).**
Form sections change constantly as FSSAI changes forms. Only fields needed for staff list views, search and filters get real columns. Everything else is JSONB — adding a question must never require a migration.

**PDF field mappings are data, not code.**
Never hardcode "business name goes at x:120, y:400". Mappings live in the `FieldMapping` table and are edited through a visual mapper in the staff portal. When the government changes a form, staff re-map it themselves without a developer. This is a core product requirement, not a nice-to-have.

**Every staff edit is audited.**
Writes to application data or documents by a staff user must create an `AuditLog` row with before/after values. In a compliance business, "who changed this field?" must always have an answer.

## Stack

| | |
|---|---|
| Framework | Next.js (App Router) + TypeScript, strict mode |
| Database | PostgreSQL + Prisma |
| Styling | Tailwind CSS with tokens from `docs/DESIGN-SYSTEM.md` |
| Auth | Lucia or Auth.js credentials — mobile number as username |
| PDF | `pdf-lib` |
| Storage | S3-compatible (Cloudflare R2), private buckets, signed URLs only |
| Email | Resend |
| SMS | MSG91 |
| Validation | Zod — shared schemas between client and server |

## Route structure

```
app/
├── (customer)/          customer portal — requires CUSTOMER session
├── (staff)/staff/       staff portal   — requires STAFF session
├── (marketing)/         phase 2, do not build yet
└── api/
    ├── public/          unauthenticated — signup only, rate limited
    ├── customer/
    └── staff/
```

## Design

Apple iOS visual language, Titanium palette. Full spec in `docs/DESIGN-SYSTEM.md` — **read it before writing any UI**. Non-negotiables:

- System font stack (`-apple-system` first). Never load SF Pro as a webfont — it is not licensed for web use.
- Buttons are capsules: `border-radius: 980px`, `min-height: 50px`
- Palette is titanium and graphite only. Colour appears **only** in status badges.
- Minimum 44px tap targets
- iOS inset grouped lists for all form sections

## Security

- Passwords: Argon2id (or bcrypt cost ≥ 12). Never logged, never emailed after first issue.
- Uploads: never public. Signed URLs, ≤ 15 min expiry. Validate MIME by magic bytes, not extension.
- `POST /api/public/signup` rate limited by IP and mobile number.
- Aadhaar/PAN are sensitive personal data under India's **DPDP Act 2023** — capture consent at signup, store `consentAt`, and keep a documented deletion path.
- All staff mutations audited.

## Conventions

- Server Components by default; `"use client"` only where interactivity requires it
- Mutations via Server Actions or route handlers — never direct DB calls from client components
- Zod-validate every input at the server boundary, no exceptions
- Money in paise (integer). Dates in UTC, rendered IST.
- Indian formats: mobile `+91` 10 digits, PIN 6 digits, GSTIN 15 chars
- No `any`. No silent `catch {}`.

## Definition of done

A stage is complete when: it type-checks, `npm run build` passes, it works against a real Postgres database, inputs are validated server-side, errors surface to the user meaningfully, and it is usable on a 1280px screen.
