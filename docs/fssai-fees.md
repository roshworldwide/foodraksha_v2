# FSSAI Calculator — authoritative data & logic

Source: client's official "FSSAI Calculator Document", updated **01.04.2026** (post-reform). This is the single source of truth for the calculator — implement the rules exactly; do not re-derive from prose. Give this file to Claude Code as `docs/fssai-fees.md` and mirror it into a typed `content/fssai-fees.ts`.

Government fee is **per annum**. The calculator shows the **government fee only** — FoodRaksha's professional fee is quoted separately (that's the lead).

---

## Fee outcomes (constants)

```
CENTRAL            = { licence: "Central License",        govtFee: 7500 }
STATE              = { licence: "State License",          govtFee: 5000 }
REGISTRATION       = { licence: "Registration",           govtFee: 100  }
REGISTRATION_FREE  = { licence: "Registration",           govtFee: 0    }   // fee waived
CENTRAL_2000       = { licence: "Central License",        govtFee: 2000 }   // govt-agency / railway catering
CENTRAL_REG_100    = { licence: "Central Registration",   govtFee: 100  }
```

## Rule resolvers (turnover in ₹; 1.5cr = 15,000,000 · 50cr = 500,000,000)

```
STANDARD(t)          → t > 50cr ? CENTRAL : t > 1.5cr ? STATE : REGISTRATION
CENTRAL_ALWAYS       → CENTRAL                         // any turnover
STATE_OR_REG(t)      → t > 1.5cr ? STATE : REGISTRATION
CENTRAL_OR_STATE(t)  → t > 50cr ? CENTRAL : STATE      // no registration tier
REG_ONLY             → REGISTRATION
HAWKER               → REGISTRATION_FREE               // waived 28.09.2024
ANGANWADI            → REGISTRATION_FREE               // waived 12.03.2025
GENERAL_MFG(t, milling) → milling ? STATE : STANDARD(t)   // any grain/cereal/pulses milling → State, no turnover limit
HOTEL(stars, t)      → stars >= 5 ? CENTRAL : (t <= 1.5cr ? REGISTRATION : STATE)
GOVT_CATERING(t)     → t > 1.5cr ? CENTRAL_2000 : CENTRAL_REG_100
RAILWAY(t)           → t > 1.5cr ? {Central License [Railways], 2000} : {Central Registration [Railways], 100}
```

Note thresholds are **inclusive of the lower band**: "up to ₹1.5cr" = Registration; "more than ₹1.5cr to 50cr" = State; "more than ₹50cr" = Central.

---

## Kind-of-Business → rule  (implement as a typed list)

### Group: Manufacturer
| Kind of Business | Rule |
|---|---|
| Dairy units (milk & milk products) | STANDARD |
| Vegetable Oil Processing Units | STANDARD |
| Slaughtering unit | STANDARD |
| Meat Processing units | STANDARD |
| Fish and Fish Products | STANDARD |
| General Manufacturing | GENERAL_MFG *(ask: grain/cereal/pulses milling? )* |
| Substances Added to Food | STANDARD |
| Relabeller | STANDARD |
| Repacker | STANDARD |
| Proprietary Food | CENTRAL_ALWAYS |
| Food or Health Supplements & Nutraceuticals | CENTRAL_ALWAYS |
| Non-specified food & food ingredients | CENTRAL_ALWAYS |
| Ayurveda Aahara | CENTRAL_ALWAYS |
| Radiation Processing of Food | CENTRAL_ALWAYS |
| 100% Export Oriented Units | CENTRAL_ALWAYS |
| Exporter – Manufacturer | CENTRAL_ALWAYS |

### Group: Trade / Retail
| Kind of Business | Rule |
|---|---|
| Storage (Cold / Refrigerated) | STANDARD |
| Storage (Controlled Atmosphere + Cold) | STANDARD |
| Storage (except Controlled Atmosphere + Cold) | STANDARD |
| Transportation | STANDARD |
| Wholesaler | STANDARD |
| Distributor | STANDARD |
| Retailer | STANDARD |
| Direct Seller | STANDARD |
| Food Vending Agencies | STANDARD |
| Importer | CENTRAL_ALWAYS |
| E-Commerce | CENTRAL_ALWAYS |
| Trader / Merchant – Exporter | CENTRAL_ALWAYS |

### Group: Food Services
| Kind of Business | Rule |
|---|---|
| Petty Retailer of snacks / tea shops | REG_ONLY |
| Hawker (itinerant / mobile vendor) | HAWKER *(₹0)* |
| Hotel | HOTEL *(ask: star rating)* |
| Restaurants | STANDARD |
| Club / Canteen | STATE_OR_REG |
| Caterer | CENTRAL_OR_STATE |
| Food Vending Establishment — Dhaba | STATE_OR_REG |
| Food Vending Establishment — Boarding houses serving food | STATE_OR_REG |
| Food Vending Establishment — Banquet halls with catering | STATE_OR_REG |
| Food Vending Establishment — Home Based Canteens / Dabba Wallas | STATE_OR_REG |
| Permanent / Temporary Stall Holder | STATE_OR_REG |
| Food stalls / religious gatherings / fairs | STATE_OR_REG |
| Mid-day Meal Caterer | CENTRAL_OR_STATE |
| Mid-Day Meal Canteen | STATE_OR_REG |
| Anganwadi [ICDS] Centres | ANGANWADI *(₹0)* |

### Group: Central Government Agencies
| Kind of Business | Rule |
|---|---|
| Food Business Activities at Central Govt Agencies (storage/wholesale/retail etc.) | CENTRAL_ALWAYS |
| Food Catering Services under Central Govt Agencies | GOVT_CATERING |
| Food Business Activities at Airport / Seaport | CENTRAL_ALWAYS |
| Food Business Activities at Railway Stations | RAILWAY |

### Group: Head Office
| Kind of Business | Rule |
|---|---|
| Head Office / Registered Office | CENTRAL_ALWAYS |

---

## Which inputs to ask (conditional)

1. **Kind of Business** — Group → KOB (two-level select, matches FoSCoS).
2. Then, based on the selected KOB's rule:
   - `HOTEL` → ask **star rating** (5★ or above / up to 4★) *and* turnover.
   - `GENERAL_MFG` → ask **"Do you mill grains, cereals or pulses?"** (yes/no) + turnover.
   - `CENTRAL_ALWAYS`, `REG_ONLY`, `HAWKER`, `ANGANWADI` → **no turnover needed** (result is fixed). Skip the turnover input.
   - all others → ask **annual turnover** (₹ number, with a lakh/crore helper).

## Output
- Big result: **"You need a {licence}"** + **"Government fee: ₹{fee}/year"** (show "₹0 — fee waived" for the waived ones).
- One-line note: "This is the government fee only. FoodRaksha's professional fee is quoted after a quick review."
- **Lead magnet CTA:** capture Mobile → "Get my exact quote & free callback" → POST /api/public/lead with the computed KOB, turnover band, licence and govt fee in the note. This turns the calculator into the hero's primary lead source.
- Secondary: "Start your application" → /get-started.

## Accuracy notes / edge cases
- Fees updated **01.04.2026**; label the widget "Updated April 2026" for trust.
- Hawker ₹0 (w.e.f 28.09.2024) and Anganwadi ₹0 (w.e.f 12.03.2025) — show "Fee waived".
- Govt-agency & railway **catering** use the special ₹2000 / ₹100 fees — do not fall back to STANDARD.
- General Manufacturing milling units → **State** at any turnover (no upper limit).
- Petty milkman / milk vendors are Registration — covered by Dairy STANDARD at ≤1.5cr.
- This replaces the simple turnover→licence qualifier already on the site with the full official matrix; reuse it as the engine for /services too.
