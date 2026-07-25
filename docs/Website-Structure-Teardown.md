# FoodRaksha Website — Structure Teardown (old site → new build)

Full crawl of the live site (foodraksha.com), July 2026. The new site keeps this **structure and content**; only the **design** changes to your new brand/theme. This is the 1:1 map.

---

## Global shell (every page)

**Utility bar (blue):** email · phone · Contact Us · Facebook / Instagram / Twitter
**Header:** logo ("FOODS LICENSE — we serve growth") · nav · Search icon · **Book Now** (amber) · **Login** (blue)
**Main nav:** Home · About · Services · Membership · FSSAI Enrollment · Explore More
**Footer:** About blurb ("35+ years experience in food handler, food manager training and management") · Contact · Guarantees (Price Match, Satisfaction) · Social · Office Hours · Privacy Policy · Registration Form link

> **Design motif to carry or replace:** section headings are two-tone — first word **green**, rest **blue** — with a short **green underline bar** ("OUR CLIENTS", "ABOUT US", "EXPLORE MORE"). Heavy condensed display font for headings, clean sans for body. Card-heavy, image-rich, blue card headers with white text.

---

## Pages & routes

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | Home | `/` | Overview + services + pricing |
| 2 | About | `/about` | Trust / positioning |
| 3 | Services (Application) | `/Application/New` | The application form |
| 4 | Membership | `/membership-page` | Plans + pricing |
| 5 | FSSAI Enrollment | `/FSSAIEnrollment/New` | Full enrollment form |
| 6 | Explore More | `/explore-more` | Hub → sub-pages |
| 7 | Contact | `/Contact-us` | Contact info + form |
| 8 | Book Appointment | `/BookAppointment/New` | **Lead-capture consultation** |
| 9 | Login | `/Login` | Into the CRM |
| 10 | Search | `/search` | Site search |
| — | Sub-pages (from Explore More) | — | Blog · FAQ · Benefits · Reviews · FSM Registration · Our Clients |

---

## 1 · Home `/`

Sections, top to bottom:

1. **Three action cards** (blue header, image, copy, Apply): **New Application** ("Get your FSSAI license done. We handle the paperwork…"), **Modification** ("Need to change something on your license?"), **Renewal** ("License renewal coming up?").
2. **Product Endorsements** — 3 cards: Official endorsement · Organic certification · Vegan certification (each + Apply).
3. **Our Clients** — logo wall (Dr Agarwals, Allianz Bio, Criticam, DM, Karim's, Marine Lifesciences, Medwell Ventures, Smayan, Vinati Organics…).
4. **Business-type grid** — cards with photo + Apply: Manufacturing · Repacking · Relabeller · Trader · Retailer · Importer · Exporter · Food Services (maps to Kind-of-Business).
5. **Service detail panel** — Benefits + Description, tabs (Overview / Process & Documents), buttons **Request a callback** + **Avail Service**.
6. **Pricing — "Right plan for your Food License"** — 3 tiers (below).
7. (Testimonials / FAQ / footer follow.)

---

## 2 · About `/about`

- Hero: **"ABOUT US — Quality service at an affordable price"** + paragraph ("We wanted to build something that actually helps: saves time, money, and stress… Good work at a fair price. You can compare us with anyone.")
- **Our Commitment to Excellence** — 3 cards: Reliable Services · Cost-Effective · Efficient Process.
- **Your Satisfaction & Building Relationships** — 3 cards: Customer-Centric · Loyal Partnerships · Collaborative Support.
- CTA: "Ready to get started? Contact us today!"

---

## 3 · Services / Application `/Application/New`

The application form (this is what "Services" links to):

- **Applicant fields:** Name · Mobile · Email · Business Name · Business Address · State · Pin Code · **Expected Turnover** (Up to ₹1.5 Cr → Registration · ₹1.5–50 Cr → State · Above ₹50 Cr → Central).
- **Choose Your Business Entity** — 22 checkboxes (Supplier, Retailer, Wholesaler, Distributor, Marketer, Retailer/Supplier/Wholesaler, Food Stall, Hotel, Restaurant, Dhaba, Canteen/Mess, Home Based Kitchen, Food Processing, Hawker, Food Importer/Exporter, Meat Processing, Rice/Flour Mill, Vegetable Oil, Storage, E-commerce, Home Baker, Others).
- **Kind of Business Group + Kind of Business** dropdowns → **Load Documents** (shows required-document checklist).
- **Submit**.

---

## 4 · Membership `/membership-page`

- Hero (grey band): **"OUR MEMBERSHIPS — Membership plans that cover your compliance needs. Pick what fits your business."**
- Service selector card ("Food License, starts from ₹999 → ₹799", Overview / Process & Documents tabs, Benefits, Description).
- **The 3 pricing tiers** (shared with Home).

---

## 5 · FSSAI Enrollment `/FSSAIEnrollment/New`

The most complete form — a full enrollment:

- **Personal & Business Details:** Full Name · Email · Phone · Business Name · Business Address · City · State · Postal Code.
- **Business Category selector** (KOB Group + detailed KOB list) → Load Documents.
- **Membership Details:** plan (**Diamond ₹9,000 · Platinum ₹6,000 · Gold ₹3,000**) · Preferred Start Date · Additional Services (Team Training, Document Preparation, 24/7 Support).
- **Terms & Conditions** (auto-renew monthly unless cancelled 30 days prior) · marketing opt-in · **Submit Enrollment**.

---

## 6 · Explore More `/explore-more`

Hub linking to six sub-pages: **FSM Registration · Blog · FAQ · Benefits · Our Clients · Reviews**. Ends with a Contact / Book Appointment CTA.

---

## 7 · Contact `/Contact-us`

- Hero "CONTACT US" + intro.
- 3 info cards: **Our Office** (Pune · Mumbai · Maharashtra) · **Email Us** · **Call Us** (Mon–Fri 9 AM–6 PM).
- **Send us a message** form: Name · Email · Subject · Message · Send.

---

## 8 · Book Appointment `/BookAppointment/New` — the lead engine

Perfectly aligned with your "lead capture first" decision:

- Trust badges: **120+ experts online · 55 live consultations · 100% confidential**.
- Headline: **"Book Expert Consultation For Food License."**
- **"FAST CALLBACK"** card → **Get Expert Legal Consultation** form: Full Name · Mobile Number · Food License Category · WhatsApp-updates toggle · (preferred time) · Submit.
- Verified-client testimonial (Rakesh Kumar).

---

## Pricing found on the site (use these, confirm before launch)

**Service plans (Home / Membership):**

| Tier | Price | Was | Note |
|---|---|---|---|
| Starter | ₹699 + Govt Fee | ₹999 | Basic customers |
| Standard | ₹2,999 + Govt Fee | ₹4,999 | Compliance support |
| **Elite** (Recommended) | ₹3,999 + Govt Fee | ₹6,999 | Brand protection + faster approvals |

All: EMI available. Elite adds GST registration, GST filing, Trademark registration.

**Membership plans (Enrollment):** Diamond ₹9,000 · Platinum ₹6,000 · Gold ₹3,000.
**Single "Food License" service:** from ₹799 (was ₹999).

---

## Things to fix during the re-skin (flagged, your call)

1. **Placeholder contact details are still live** — `FSSAI@gmail.com` and `+91 9876543210`. Replace with real ones before launch.
2. **Footer office hours say "PST"** — wrong for an India business; should be IST.
3. **Logo/brand mismatch** — the live site shows "FOODS LICENSE — we serve growth", but your brand kit is "FOOD RAKSHA". Decide which is canonical (I've been using Food Raksha).
4. **Two overlapping forms** — Application (`/Application/New`) and Enrollment (`/FSSAIEnrollment/New`) collect much of the same data. Worth deciding whether the new site keeps both or consolidates.
5. **Lead flow** — Book Appointment + "Request a callback" are already lead-capture. In the new build these become the **primary CTAs**, feeding the CRM's **Website Enquiries** (Lead) inbox. The application/enrollment forms stay as the secondary "start now" path.
6. **Regulatory copy** — post-reform, licences are perpetual (no renewals) and Basic Registration is instant under ₹1.5 Cr. The "Renewal" card and any renewal messaging should be reframed (legacy only).

---

## What I still need from you

- **Brand kit + website theme** (you're sending) — colours, fonts, the new look.
- **Confirm the pricing** above is current.
- **Real contact details** (office address, phone, email, hours).
- Whether to **keep or consolidate** the Application vs Enrollment forms.

Once I have the theme, I'll turn this map into a page-by-page Claude Code build spec — same structure, your new design.
