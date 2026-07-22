# FoodRaksha CRM — Product Blueprint

**Version** 1.0 · **Date** 22 July 2026 · **Status** For approval before build

---

## 1. What we are building

Phase 2 of the FoodRaksha platform: a CRM that takes a customer from *"I need an FSSAI licence"* to *"here are my completed, print-ready licensing forms"* with as little friction as possible.

The system has **two front doors into one database**:

| | Customer Portal | Staff Portal |
|---|---|---|
| **Who** | Food business owners (FBOs) | FoodRaksha employees |
| **Purpose** | Enter their details once, track progress | Review, correct and process every file |
| **Entry** | Landing page → auto-created account | Direct staff login |

### The one idea that makes this work

> **Ask once, print everywhere.**

The customer does **not** fill 15–17 forms. They fill **one guided questionnaire** of roughly 8–10 logical steps. Behind the scenes, the system knows that "Business Name" appears on 12 of the 17 PDFs, and writes it into all 12 automatically.

This is the difference between a customer abandoning halfway and a customer finishing in one sitting. It is the core engineering decision in this build.

---

## 2. Roles

| Role | Access |
|---|---|
| **Customer** | Own application only. Fill, upload, view status, download own PDFs. |
| **Staff** | Every customer, every form. View, edit, upload, generate PDFs, change status, raise queries. |

Staff access is **flat** — as specified, every employee sees every customer. The database will still carry a `role` field on each user so an Admin/Agent split can be switched on later without rebuilding anything.

---

## 3. Customer journey

**Step 1 — Landing page**
Customer fills a short enquiry form. Kept deliberately small: name, mobile, email, business type, city. Every extra field here costs conversions.

**Step 2 — Instant credentials**
On submit, the system creates the account and **displays the username and password on the page immediately**, as specified. The same credentials are simultaneously sent by **SMS and email** so they cannot be lost. A "Copy" button and a direct "Login now" button sit right below.

**Step 3 — Login**
Customer logs in. Forced password change is *not* applied on first login — it adds friction at the worst possible moment. They can change it later from settings.

**Step 4 — Dashboard**
One screen showing: overall progress bar, which step to do next, current status of their application, and anything the team needs from them.

**Step 5 — The questionnaire**
A multi-step wizard, not a wall of forms:

1. Business details
2. Applicant / proprietor details
3. Premises & address
4. Kind of business & food categories
5. Equipment & production capacity *(manufacturers only)*
6. Vehicle details *(transporters only)*
7. Water source & testing *(where applicable)*
8. Nominated person (Form IX)
9. Food Safety Management System declaration
10. Documents, photo & signature

Behaviour that matters:
- **Autosave on every field.** Customer can close the tab and resume.
- **Resume where they left off**, not from step 1.
- **Mobile-first.** Most FBOs will do this on a phone.
- **Conditional logic** — a restaurant never sees the equipment-capacity step.

**Step 6 — Photo & signature**
Customer uploads a passport photo and provides a signature **either** by uploading a scan **or** by drawing it on screen with a finger. Both options, as specified. Captured once, placed on every PDF that needs it.

**Step 7 — Review & submit**
A plain-language summary of everything entered, with edit links. Then submit.

**Step 8 — Track**
A live status timeline. This single feature removes most "what's happening with my file?" phone calls.

---

## 4. Staff journey

**Customer list** — the main working screen. Every customer with a status chip, sortable and filterable by:

- Not yet logged in *(the highest-value follow-up list)*
- In progress — with % complete
- Submitted, awaiting review
- Query raised — waiting on customer
- Ready to file
- Filed with FSSAI
- Licence issued

Plus search by name, phone, business name or application number.

**Customer detail** — every form the customer filled, in the same wizard layout, in staff edit mode. Staff can correct anything. Every edit is recorded with who changed what, when, and the previous value.

**Document review** — approve, reject, or request a re-upload with a reason the customer sees.

**Generate PDFs** — one click produces all applicable filled PDFs. Download individually or as a single ZIP.

**Raise a query** — staff send a message to the customer requesting a fix. Status flips to "Query Raised" and the customer sees exactly what is needed on their dashboard.

**Status management** — move the file along the pipeline, with an internal note at each step.

---

## 5. The Form → PDF engine

This is the heart of the system and where the real engineering sits.

### 5.1 Canonical field dictionary

Every unique piece of data gets one key — `business.legal_name`, `applicant.aadhaar_no`, `premises.pincode`, `nominee.designation`. The customer fills the key once. The system knows every PDF that consumes it.

### 5.2 PDF templates

The **real government PDFs** are uploaded into the system as templates, exactly as they come from FoSCoS. Nothing is recreated, so what prints is precisely the accepted form.

Each template is stamped with a **version**. When FSSAI changes a form, the old version stays intact for files already submitted.

### 5.3 Field mapping — and why this matters commercially

Government PDFs are usually flat prints, not fillable forms. So each template needs a one-time mapping that says *"business name goes on page 1, here, at this size."*

I propose building a **visual template mapper** into the staff portal: open the PDF on screen, click where a field belongs, pick the field from a dropdown, done.

The payoff: **when the government changes a form, your team re-maps it in twenty minutes. They do not need a developer, and they do not need to call me.** For a compliance business where forms change without notice, this is the difference between a system that stays useful and one that quietly rots.

### 5.4 Generation

On demand, the engine merges the customer's data into every applicable template, places the photo and signature, and writes the output to secure storage. Regenerating after an edit is instant.

---

## 6. Form variation by category

As specified: **most forms are common, a few vary by business category.**

- **Core set** — filled by every customer regardless of category.
- **Conditional set** — attached based on Kind of Business. A manufacturer gets equipment and capacity forms; a transporter gets vehicle forms; an importer gets IEC-related forms.

The mapping of *category → extra forms* will be **configurable from the staff portal**, not hardcoded. You will be able to add a category or attach another form yourself.

---

## 7. Data model (conceptual)

| Entity | Holds |
|---|---|
| `User` | Login identity, role, phone, email, password hash |
| `Lead` | Raw landing-page capture, source and UTM tracking |
| `Customer` | The food business owner |
| `Application` | One licensing case. Status, category, licence type |
| `ApplicationData` | All questionnaire answers |
| `Document` | Uploaded files, type, approval status |
| `PdfTemplate` | The official PDF, version, categories it applies to |
| `FieldMapping` | Where each field prints on each template |
| `GeneratedPdf` | Output files, generated timestamp |
| `StatusEvent` | Full pipeline history — who moved it, when, why |
| `Query` | Clarifications raised to the customer and their resolution |
| `AuditLog` | Every edit to every field, before and after |

**Storage approach:** core fields (name, phone, business name, status) as proper database columns so staff lists and searches stay fast; the long tail of questionnaire answers in a flexible JSON column so new fields can be added without a database migration. This is the right balance of speed and flexibility for a form set that will keep changing.

---

## 8. Status pipeline

```
Lead captured
   └─ Account created ──── not yet logged in
        └─ In progress ─── 4 of 10 steps
             └─ Submitted for review
                  ├─ Query raised ──► back to customer
                  └─ Ready to file
                       └─ Filed with FSSAI
                            ├─ FSSAI query raised
                            └─ Licence issued ──► Closed
```

Staff see all stages. Customers see a simplified, reassuring version of the same timeline.

---

## 9. Screens to build

**Customer** — landing page & enquiry · credentials screen · login · forgot password · dashboard · questionnaire wizard · document upload · photo & signature capture · review & submit · my documents · queries

**Staff** — login · customer list · customer detail · form editor · document review · PDF generation & download · status management · raise query · template manager & field mapper · basic reports

---

## 10. Technology

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | One codebase for website, CRM and later the Partner Portal |
| Database | PostgreSQL | Reliable, handles both structured and JSON data well |
| ORM | Prisma | Type-safe, clean migrations |
| UI | Tailwind + shadcn/ui | Fast to build, consistent, accessible |
| PDF | pdf-lib | Fills real PDFs precisely, runs server-side |
| Files | S3-compatible storage | Private by default, time-limited download links |
| SMS | MSG91 or Twilio | Credential delivery, status alerts |
| Email | Resend or AWS SES | Credential delivery, notifications |

---

## 11. Non-negotiables

- **Customer files are private.** No file is ever served from a public URL — every download goes through a time-limited signed link.
- **Passwords are hashed**, never stored or emailed in readable form after first issue.
- **Every staff edit is logged.** In a compliance business, "who changed this field?" must always have an answer.
- **DPDP Act 2023 compliance** — you are holding Aadhaar numbers, PAN and photographs. Consent capture, a stated retention period, and a documented deletion path are built in from day one, not retrofitted.
- **Rate limiting** on the public enquiry form, or it will be filled with spam within a week.

---

## 12. What I need from you to start building

1. **The 15–17 PDF files** — the actual templates, exactly as submitted. *This is the main blocker; nothing else can be mapped without them.*
2. **Business category list** — every category you serve, and which extra forms each one triggers.
3. **Landing page fields** — confirm the enquiry form captures name, mobile, email, business type, city, or tell me what to change.
4. **Brand assets** — logo, colours, fonts. If none exist yet, I will propose a set.
5. **Mandatory vs optional** — which questionnaire fields block submission.

Items 2–5 can follow. **Item 1 is what unlocks the build.**

---

## 13. Suggested build order

| Stage | Delivers |
|---|---|
| 1 | Database, authentication, landing page → account creation → credentials by SMS/email |
| 2 | Customer dashboard and the questionnaire wizard with autosave |
| 3 | Document upload, photo and signature capture |
| 4 | Staff portal — customer list, detail view, edit capability |
| 5 | PDF engine — template upload, visual field mapper, generation |
| 6 | Status pipeline, queries, notifications |
| 7 | Hardening, testing, deployment |

Stages 1–4 give you a working CRM. Stage 5 is what makes it valuable.

---

## 14. Two things worth deciding early

**Payment.** Currently no payment step is specified. Worth deciding whether the service fee is collected in-app before filing, or stays offline. Adding it later is straightforward; designing for it now is cheaper.

**Renewals.** FSSAI licences expire. A system that already holds every customer's licence expiry date and messages them 60 days before renewal turns a one-time transaction into recurring revenue. The data is already being captured — it costs very little to switch on, and it may be the most commercially valuable feature in the entire product.

---

*Prepared for FoodRaksha · Phase 2 of 3 (Website → **CRM** → Partner Portal)*
