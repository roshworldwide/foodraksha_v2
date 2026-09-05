# End-to-end tests (Playwright)

These tests drive a **real running instance** and click through the actual UI —
signup, login, the customer dashboard, the questionnaire, route protection, and
(optionally) the staff CRM.

> ⚠️ **They write real data (accounts, leads) to whatever database the target
> instance uses. Run them against a DEV or STAGING database — never production.**

## One-time setup

```bash
npm install                 # installs @playwright/test (already in devDependencies)
npm run test:e2e:install    # downloads the Chromium browser
```

## Run against a local dev server

```bash
# Terminal A — start the app (needs a dev DATABASE_URL + a seeded admin)
npm run dev

# Terminal B — run the suite
npm run test:e2e            # headless
npm run test:e2e:ui         # interactive UI mode (great for watching it click)
```

## Run against a deployed staging URL

```bash
E2E_BASE_URL=https://staging.foodraksha.in npm run test:e2e
```

## Environment variables

| Var | Default | Purpose |
|---|---|---|
| `E2E_BASE_URL` | `http://localhost:3000` | The running app to test |
| `E2E_ADMIN_IDENTIFIER` | — | Seeded admin email **or** mobile (enables the staff tests) |
| `E2E_ADMIN_PASSWORD` | — | That admin's password |

The **staff tests skip themselves** unless both admin vars are set. Everything
else (marketing, public API, signup → login, dashboard, route protection) runs
without any credentials.

## What each spec proves

- `api.spec.ts` — `/api/health` is up; `/api/public/lead` accepts valid and
  rejects invalid input; staff API returns 401 unauthenticated.
- `marketing.spec.ts` — the home page and the main marketing pages render with a
  headline and navigation; the fee calculator page loads.
- `signup-login.spec.ts` — **the core link:** an account created on the website
  (`/get-started`) shows its credentials, and those credentials sign in to the
  portal at `/login` (by email and by mobile); a wrong password is rejected; a
  duplicate mobile is refused.
- `customer-journey.spec.ts` — after login the dashboard loads and "Resume"
  reaches the questionnaire; unauthenticated visits to `/dashboard` are sent to
  `/login`.
- `staff.spec.ts` — an admin can sign in to the CRM and a website signup shows
  up in the staff client desk (proves website → CRM sync on one database).

## Notes

- The suite is serial (`workers: 1`) and reuses **one** signed-up account across
  tests, to stay under the signup rate limit (5 per IP per hour).
- **A full run costs 2 signups** (one for the shared account, one for the
  duplicate-mobile test), so you get **two runs per hour** from one IP. A third
  run fails with *"Too many signups from this connection"* — that is the app's
  rate limiter working, not a broken test.
  The limiter is an in-memory `Map` (`src/lib/auth/rate-limit.ts`), so against a
  local dev server the fix is simply to **restart `npm run dev`**, which clears
  the counter. Do not relax the limit in app code to make the suite re-runnable.
- Form errors are asserted with the `formAlert(page)` helper from `fixtures.ts`,
  not a bare `getByRole("alert")`. Next.js injects a permanently-empty
  `<div role="alert" id="__next-route-announcer__">` for route announcements, so
  the bare role query matches two elements the moment a real error renders and
  fails Playwright's strict mode.
- After a run, an HTML report is written to `playwright-report/` — open it with
  `npx playwright show-report`.
