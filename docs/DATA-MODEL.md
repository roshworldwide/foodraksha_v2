# FoodRaksha — Data Model

> Place at `docs/DATA-MODEL.md`. The schema below goes to `prisma/schema.prisma`.

---

## Three decisions that shape everything

**1. Questionnaire answers live in `Application.data` (JSONB).**
Form sections change whenever FSSAI changes forms. Only fields needed for list views, search and filters get real columns. Adding a question must never require a migration.

**2. PDF field mappings are rows, not code.**
`FieldMapping` stores where each field prints on each template. Edited through the visual mapper in the staff portal. When a government form changes, staff fix it in twenty minutes without a developer.

**3. Templates are versioned.**
A file already filed with FSSAI must always regenerate identically. New template version = new row; old rows are never mutated.

---

## Schema

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

// ─────────────────────────── Enums

enum Role        { CUSTOMER STAFF ADMIN }
enum LicenceType { BASIC STATE CENTRAL }
enum DocStatus   { AWAITING PENDING APPROVED REJECTED }
enum FieldType   { TEXT MULTILINE DATE CHECKBOX IMAGE SIGNATURE }

enum AppStatus {
  DRAFT           // customer still filling
  SUBMITTED       // customer submitted, not yet picked up
  UNDER_REVIEW    // staff reviewing
  QUERY_RAISED    // waiting on customer
  READY_TO_FILE   // internally approved
  FILED           // lodged with FSSAI
  FSSAI_QUERY     // authority raised a query
  ISSUED          // licence granted
  REJECTED
  CLOSED
}

// ─────────────────────────── Identity

model User {
  id           String    @id @default(cuid())
  role         Role      @default(CUSTOMER)
  name         String
  mobile       String    @unique          // username — E.164, +91XXXXXXXXXX
  email        String?
  passwordHash String
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  customer      Customer?
  sessions      Session[]
  auditLogs     AuditLog[]
  statusEvents  StatusEvent[]
  queriesRaised Query[]        @relation("QueryRaisedBy")
  docsReviewed  Document[]     @relation("DocReviewedBy")
  pdfsGenerated GeneratedPdf[] @relation("PdfGeneratedBy")

  @@index([role])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

// ─────────────────────────── Acquisition

/// Raw landing-page capture. Kept even after conversion — this is the
/// marketing funnel record and must survive customer deletion.
model Lead {
  id           String   @id @default(cuid())
  name         String
  mobile       String
  email        String?
  businessType String?
  city         String?

  source       String?   // "website" | "staff" | "partner"
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  referrer     String?
  ipAddress    String?
  consentAt    DateTime?   // DPDP Act 2023

  convertedUserId String?
  createdAt       DateTime @default(now())

  @@index([mobile])
  @@index([createdAt])
}

model Customer {
  id           String  @id @default(cuid())
  userId       String  @unique
  businessName String
  city         String?
  state        String?

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  applications Application[]

  @@index([businessName])
}

// ─────────────────────────── Configuration

model BusinessCategory {
  id        String  @id @default(cuid())
  code      String  @unique      // "MANUFACTURER", "RESTAURANT"
  name      String
  isActive  Boolean @default(true)
  sortOrder Int     @default(0)

  /// Section keys this category requires, beyond the core set.
  extraSections String[]

  applications Application[]
  templates    TemplateOnCategory[]
}

/// A questionnaire section. Field definitions live in `fields` (JSONB) so
/// sections can be edited without a migration.
model FormSection {
  id          String  @id @default(cuid())
  key         String  @unique     // "business_details", "premises"
  title       String
  description String?
  sortOrder   Int     @default(0)
  isCore      Boolean @default(true)   // false = only for some categories
  fields      Json                     // [{ key, label, type, required, options, validation, helpText }]
}

// ─────────────────────────── The application

model Application {
  id            String      @id @default(cuid())
  applicationNo String      @unique      // "FR-2026-0248"
  customerId    String
  categoryId    String
  licenceType   LicenceType
  status        AppStatus   @default(DRAFT)

  /// All questionnaire answers, keyed by canonical field key.
  /// e.g. { "business.legal_name": "...", "premises.pincode": "400001" }
  data Json @default("{}")

  /// Section keys marked complete — drives the progress bar.
  completedSections String[] @default([])

  submittedAt DateTime?
  filedAt     DateTime?
  issuedAt    DateTime?
  licenceNo   String?
  licenceExpiresAt DateTime?   // powers renewal reminders — real recurring revenue

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  customer     Customer         @relation(fields: [customerId], references: [id], onDelete: Cascade)
  category     BusinessCategory @relation(fields: [categoryId], references: [id])
  documents    Document[]
  generatedPdfs GeneratedPdf[]
  statusEvents StatusEvent[]
  queries      Query[]

  @@index([status])
  @@index([customerId])
  @@index([licenceExpiresAt])
  @@index([updatedAt])
}

model Document {
  id            String    @id @default(cuid())
  applicationId String
  docType       String              // "aadhaar", "water_test_report"
  fileKey       String              // object storage key — never a public URL
  fileName      String
  mimeType      String
  sizeBytes     Int
  status        DocStatus @default(PENDING)
  rejectionReason String?
  uploadedAt    DateTime  @default(now())
  reviewedAt    DateTime?
  reviewedById  String?

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  reviewedBy  User?       @relation("DocReviewedBy", fields: [reviewedById], references: [id])

  @@index([applicationId])
  @@index([status])
}

// ─────────────────────────── PDF engine

model PdfTemplate {
  id        String  @id @default(cuid())
  key       String                    // "form_b" — stable across versions
  name      String
  version   Int     @default(1)
  fileKey   String                    // the blank government PDF
  pageCount Int
  isCore    Boolean @default(true)    // true = every application gets it
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())

  mappings   FieldMapping[]
  categories TemplateOnCategory[]
  generated  GeneratedPdf[]

  @@unique([key, version])
}

model TemplateOnCategory {
  templateId String
  categoryId String
  template   PdfTemplate      @relation(fields: [templateId], references: [id], onDelete: Cascade)
  category   BusinessCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([templateId, categoryId])
}

/// Where a canonical field prints on a template. Written by the visual mapper.
/// Coordinates are PDF points, origin bottom-left (pdf-lib convention).
model FieldMapping {
  id         String    @id @default(cuid())
  templateId String
  fieldKey   String              // "business.legal_name"
  type       FieldType @default(TEXT)
  page       Int
  x          Float
  y          Float
  width      Float?              // wrap/scale box
  height     Float?
  fontSize   Float     @default(10)
  align      String    @default("left")
  maxLength  Int?

  template PdfTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@index([templateId])
}

model GeneratedPdf {
  id              String   @id @default(cuid())
  applicationId   String
  templateId      String
  templateVersion Int
  fileKey         String
  generatedAt     DateTime @default(now())
  generatedById   String?

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  template    PdfTemplate @relation(fields: [templateId], references: [id])
  generatedBy User?       @relation("PdfGeneratedBy", fields: [generatedById], references: [id])

  @@index([applicationId])
}

// ─────────────────────────── Workflow & audit

model StatusEvent {
  id            String    @id @default(cuid())
  applicationId String
  fromStatus    AppStatus?
  toStatus      AppStatus
  note          String?
  byUserId      String?
  createdAt     DateTime  @default(now())

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  by          User?       @relation(fields: [byUserId], references: [id])

  @@index([applicationId])
}

/// Staff → customer clarification request.
model Query {
  id             String    @id @default(cuid())
  applicationId  String
  message        String
  relatedSection String?
  relatedDocType String?
  raisedById     String
  raisedAt       DateTime  @default(now())
  resolvedAt     DateTime?
  resolutionNote String?

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  raisedBy    User        @relation("QueryRaisedBy", fields: [raisedById], references: [id])

  @@index([applicationId])
  @@index([resolvedAt])
}

/// Every staff mutation. Non-negotiable in a compliance business.
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  entity    String              // "Application", "Document"
  entityId  String
  action    String              // "update", "status_change", "document_review"
  before    Json?
  after     Json?
  ipAddress String?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([entity, entityId])
  @@index([userId])
  @@index([createdAt])
}
```

---

## Canonical field keys

Namespaced `entity.field`. The whole "ask once, print everywhere" model depends on these being stable — a `FieldMapping` referencing `business.legal_name` breaks if that key is renamed. **Never rename a key in use; deprecate and add.**

```
business.legal_name          business.trade_name         business.constitution
business.pan                 business.gstin              business.incorporation_date

applicant.full_name          applicant.designation       applicant.aadhaar_no
applicant.mobile             applicant.email             applicant.photo
applicant.signature

premises.address_1           premises.address_2          premises.city
premises.district            premises.state              premises.pincode
premises.ownership           premises.area_sqft

licence.type                 licence.kob                 licence.food_categories
licence.duration_years

equipment.list               equipment.installed_capacity
water.source                 water.test_report_date
nominee.name                 nominee.designation         nominee.address
vehicle.count                vehicle.registration_numbers
```

Store the dictionary in `lib/fields.ts` as a typed const so keys are autocompleted and typos caught at compile time.

---

## Seeding

Seed script must create: an admin staff user, business categories, core form sections with field definitions, and a demo customer with a part-filled application. Every stage must be testable immediately after `prisma db seed`.
