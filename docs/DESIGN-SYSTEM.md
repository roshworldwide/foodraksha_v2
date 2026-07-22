# FoodRaksha — Design System

> Place at `docs/DESIGN-SYSTEM.md`. Read before writing any UI.
> Reference implementation: `FoodRaksha-CRM-Prototype.html` — approved, match it.

Apple iOS visual language. Titanium palette. Approved by client.

---

## 1. Typography

**Never load SF Pro as a webfont.** Apple's licence does not permit it. The system stack renders genuine SF Pro on Apple hardware and falls back to Inter elsewhere.

```css
--font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
        "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

Load Inter (400/500/600/700) from `next/font` as the non-Apple fallback.

### Scale

Negative letter-spacing is what makes SF look like SF. Do not omit it.

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `large-title` | 34px | 700 | −0.026em | Page titles |
| `title-1` | 28px | 700 | −0.022em | Section headers |
| `title-2` | 22px | 700 | −0.018em | Card headers, slide-over title |
| `title-3` | 20px | 600 | −0.014em | Sub-headers |
| `headline` | 17px | 600 | −0.012em | Emphasised body, list titles |
| `body` | 17px | 400 | −0.011em | **Default. All form inputs.** |
| `callout` | 16px | 400 | −0.010em | Secondary content |
| `subhead` | 15px | 400 | −0.008em | Supporting text |
| `footnote` | 13px | 400 | −0.004em | Helper text, metadata |
| `caption` | 12px | 500 | 0 | Badges, labels |

Body text is **17px**. Do not shrink it — the audience skews older and less tech-confident.

---

## 2. Colour

```css
/* Titanium */
--nat-titanium:      #C3BCB1;   /* Natural Titanium — secondary actions, icons */
--nat-titanium-mid:  #A8A197;   /* hover */
--nat-titanium-deep: #6E6960;   /* focus rings, strong borders */
--white-titanium:    #F0EEE9;   /* app background */
--white-titanium-lt: #F7F6F3;   /* subtle fills, table headers */

/* Surfaces */
--bg:           #EFEDE8;
--surface:      #FFFFFF;
--surface-sunk: #E8E5DF;        /* progress tracks, segmented controls */

/* Text */
--label:     #1D1D1F;               /* Apple's near-black — never pure #000 */
--label-2:   rgba(60,60,67,.60);
--label-3:   rgba(60,60,67,.32);
--separator: rgba(60,60,67,.16);

/* Actions */
--graphite:  #1D1D1F;           /* primary buttons, active states */
```

### Status — the only colour in the product

A pipeline is unusable if every state looks the same. These are the **sole** exception; desaturated to sit inside the palette.

```css
--ok:   #34785A;  --ok-bg:   #E4EFE9;   /* issued, approved, filed */
--wait: #9A7B3F;  --wait-bg: #F5EEDF;   /* under review, awaiting */
--stop: #A2453C;  --stop-bg: #F6E5E3;   /* query raised, action needed */
```

**Do not introduce any other colour.** No blue links, no coloured illustrations, no brand gradients.

---

## 3. Shape & elevation

```css
--r-pill: 980px;   /* all buttons — Apple's actual value */
--r-card: 18px;
--r-list: 12px;    /* grouped lists */
--r-input: 12px;

--sh-1: 0 1px 2px rgba(0,0,0,.04), 0 1px 1px rgba(0,0,0,.03);   /* cards, lists */
--sh-2: 0 4px 16px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);  /* raised panels */
--sh-3: 0 12px 40px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.06); /* slide-over */
```

Spacing: 4px base — 4, 8, 12, 16, 20, 24, 32, 40, 56.

Motion: `cubic-bezier(.32,.72,0,1)` — iOS spring. 200ms micro, 350ms panels, 450ms slide-over. Respect `prefers-reduced-motion`.

---

## 4. Components

### Button

```css
border-radius: 980px;
min-height: 50px;          /* 36px .sm · 30px .xs */
padding: 0 26px;
font: 600 17px/1 var(--font);
letter-spacing: -0.012em;
transition: transform .2s cubic-bezier(.32,.72,0,1);
```
`:active { transform: scale(.965) }` — this press response is essential to the iOS feel.

| Variant | Background | Text |
|---|---|---|
| primary | `--graphite` | white |
| secondary | `--nat-titanium` | `--label` |
| quiet | `rgba(60,60,67,.07)` | `--label` |

**One primary button per screen.** Everything else is secondary or quiet.

### Inset grouped list

The default container for form sections, document lists and settings.

- White surface, `--r-list`, `--sh-1`
- Rows: `min-height: 52px`, `padding: 13px 16px`
- `0.5px` separators, **omitted on the last row**
- Leading icon: 30×30, `border-radius: 8px`
- Trailing chevron `›` in `--label-3`

Icon states: complete = `--ok` with `✓` · current = `--graphite` with step number · pending = `--nat-titanium` with step number.

### Input

```css
font-size: 17px;                    /* prevents iOS zoom-on-focus */
padding: 14px 16px;
border: .5px solid var(--separator);
border-radius: 12px;
background: var(--surface);
```
Focus: `border-color: var(--nat-titanium-deep)` + `box-shadow: 0 0 0 3.5px rgba(110,105,96,.13)`.
Label above, 13px/600, `--label-2`. Never placeholder-as-label.

### Status pill

`padding: 5px 11px` · `border-radius: 980px` · 12px/600 · 6px leading dot in `currentColor`.

### Slide-over (staff)

`width: min(560px, 94vw)`, full height, right-anchored, `--sh-3`, scrim `rgba(0,0,0,.26)` + 3px blur. Enters at 450ms. 36×5px grabber pill at top. Closes on Escape and scrim click. **The list underneath must not lose scroll position or filter state.**

---

## 5. Layout

### Customer portal — desktop-first

Client decision: customers apply on desktop, not phone. Optimise for 1280–1440px; degrade gracefully to mobile.

```
Sidebar 260px  │  Content max-width 720px, centred
```

- Persistent left sidebar: section list with completion state, always visible
- Questionnaire content capped at **720px** — full-width forms are hostile to read
- Progress bar pinned at the top of the content column
- Two-column field rows where fields are naturally paired (city/PIN, state/district); never more than two

### Staff portal — desktop only

```
Full-width table  ·  row height 56px  ·  24px horizontal cell padding
Sticky header + sticky filter chip row
Slide-over from right, list preserved beneath
```

Aim for ~15 rows visible at 1440px without scrolling. Density is the point.

---

## 6. Rules

**Do**
- One primary action per screen
- Server-render everything that isn't interactive
- 44px minimum tap target
- Sentence case in buttons and labels — never ALL CAPS except the 13px uppercase group headers
- Empty states that say what to do next, not "No data found"

**Don't**
- Introduce colour outside status
- Use pure black or pure white as text colour
- Use font sizes below 12px
- Nest cards inside cards
- Use spinners where skeletons work
- Load SF Pro as a webfont

---

## 7. Accessibility

- Contrast ≥ 4.5:1 body, ≥ 3:1 large text. `--label-3` is decorative only — never sole carrier of meaning.
- Status pills carry a **text label**, never colour alone.
- Visible focus ring on every interactive element; never `outline: none` without a replacement.
- Slide-over traps focus, restores it to the triggering row on close.
- Every input has a real `<label>` with `htmlFor`.
- Errors are announced to screen readers and reference the field by name.
