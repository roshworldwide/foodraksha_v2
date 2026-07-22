# Findings — 22 July 2026

Investigation of `foodraksha.com/Application/New` and the FSSAI regulatory position.

---

## 1. That page is not the 15–17 fillable forms

"Load Documents" calls:

```
GET /Application/GetDocumentRequirements?businessGroup={group}&kindOfBusiness={kob}
```

It returns a **document upload checklist** — things the customer must obtain and upload. Every "View Sample Document" link points to an FSSAI *sample* PDF on `foscos.fssai.gov.in` showing what a valid document looks like. These are examples, not templates to be filled.

**However, the count matches.** Deduplicated, the Manufacturer checklist is ~16 unique documents. That is very likely what "15 to 17 forms" refers to.

If so, the list splits in two — and this changes the build:

**Generatable from questionnaire data** (the PDF engine produces these)

- List of Directors / Partners / Proprietor with addresses and nominated signatory
- Form IX — Nomination of Person under Clause 2.5, FSS Rules 2008
- Recall Plan
- Self Declaration for Proprietorship
- Name and list of equipment and machinery, with installed capacity and horsepower

**Must be uploaded** (no data can generate these)

- Photo ID and address proof
- Water analysis report — Chemical & Bacteriological
- Proof of possession of premises — sale deed / rent agreement / electricity bill
- Blueprint / layout plan of the processing unit
- Partnership deed / MOA & AOA
- Import Export Code, Ministry of Commerce 100% EOU certificate
- NOC from Municipal Corporation
- Production unit photographs
- Commodity-specific: milk procurement plan, meat raw-material source, fish processing guidance, nutraceuticals guidance, Ayurveda Aahara compendium

**Needs confirming before Stage 6.**

---

## 2. Bugs in the current site

**Source data is split on commas.** Single requirements are being rendered as two rows:

| Shown as two rows | Should be one |
|---|---|
| "Proof of possession of premises. (Sale deed/ Rent agreement/ Electricity bill" + "etc.)" | one requirement |
| "Form IX: Nomination of Person as per Clause 2.5of FSS Rules" + "2008 (Not applicable in case of Proprietor)" | "…FSS Rules, 2008" |
| "Name and List of Equipments and Machinery along with the number" + "installed capacity and horsepower used" | one requirement |

Confirmed by the sample-document links — the split rows point to identical PDFs.

**`kindOfBusiness=All` returns 144 rows with no deduplication.** Every sub-category's list concatenated. "Blueprint/layout plan" appears roughly fifteen times. This froze the browser tab on first attempt — it is not just untidy, it hangs the page.

**Do not import this list as-is into the new system.** It needs cleaning to ~18 unique requirements first, then mapping to categories.

Also: missing space in "Clause 2.5of", and the placeholder contact details are still live on the site — `FSSAI@gmail.com` and `+91 9876543210`.

---

## 3. Regulatory change — and a correction to my earlier advice

MoHFW approved major reforms on **13 March 2026**, effective **1 April 2026**.
Source: [FSSAI press release](https://fssai.gov.in/upload/uploadfiles/files/Press%20Release_FSSAI%20Reforms_130326.pdf)

### Licences now have perpetual validity

> "Under the revised framework, registrations and licences will have perpetual validity, eliminating the need for repeated renewals."

**This contradicts advice I gave twice.** I recommended renewal reminders as "possibly the most commercially valuable feature in the product." That was based on knowledge predating this reform. It is wrong — there are no renewals to remind anyone about.

`Application.licenceExpiresAt` should stay in the schema (historical licences, and useful for other tracking), but the renewal-reminder engine should not be built. Removing it from the roadmap.

### Turnover thresholds raised sharply

| | Before | From 1 Apr 2026 |
|---|---|---|
| Basic Registration | up to ₹12 lakh | **up to ₹1.5 crore** |
| State Licence | ₹12 lakh – ₹20 crore | ₹1.5 – 50 crore |
| Central Licence | above ₹20 crore | above ₹50 crore |

Basic Registration also now gets "elimination of pre-inspection, and instant registration."

### Street vendors deemed registered

Vendors registered with Municipal Corporations or Town Vending Committees under the Street Vendors Act 2014 are now **deemed registered** under FSSAI. The press release puts this at over 10 lakh vendors who no longer need separate registration.

---

## 4. What this means commercially

Worth raising with the client directly, because it affects the business more than the software.

**The downside.** A large share of what was previously fee-bearing, document-heavy State Licence work has moved to Basic Registration — cheap, instant, minimal paperwork. Street vendors have left the market entirely. Renewal revenue is gone. Average deal value is likely to fall.

**The counter-argument, which is the stronger one.** When margin per file compresses, manual processing stops being viable and automation becomes the only way to stay profitable. A consultancy filling forms by hand cannot make money on high-volume, low-ticket Basic Registrations. One that captures data once and generates every document automatically can.

**The CRM is more necessary after this reform, not less.** But the target metric changes: it is now cost-per-file and throughput, not revenue-per-file.

Segments unaffected: State and Central licensing above ₹1.5 crore, FoSTaC training, hygiene rating audits, HACCP / ISO 22000 / FSSC 22000 certification, lab testing, licence modifications, and annual returns where still applicable.

---

## 5. Confirmed taxonomy

Kind of Business Groups: **Central Govt. Agencies · Food Services · Head Office · Manufacturer · Trade/Retail**

Food Services sub-categories: Caterer · Hotel · Mid-Day Meal Caterer · Restaurants

Business entity types from the site's checkbox grid: Supplier · Retailer · Wholesaler · Distributor · Marketer · Retailer/Supplier/Wholesaler · Food Stall · Hotel · Restaurant · Dhaba · Canteen/Mess · Home Based Kitchen · Food Processing (Relabelling/Re-packing) · Hawker · Food Importer/Exporter · Meat Processing · Rice Mill/Flour Mill · Vegetable Oil · Storage · E-commerce · Home Baker · Others

Use these in the seed script rather than the invented list currently in `BUILD-PROMPTS.md` Stage 1.
