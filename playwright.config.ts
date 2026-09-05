import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for FoodRaksha — they drive a REAL running instance and
 * write REAL data (accounts, leads) to whatever database that instance uses.
 *
 *   RUN THESE AGAINST A DEV OR STAGING DATABASE — NEVER PRODUCTION.
 *
 * Point them at a running app with E2E_BASE_URL (default localhost:3000):
 *   1. Terminal A:  npm run dev
 *   2. Terminal B:  npm run test:e2e
 * Or against a deployed staging URL:
 *   E2E_BASE_URL=https://staging.foodraksha.in npm run test:e2e
 *
 * Staff tests are skipped unless you supply seeded admin credentials:
 *   E2E_ADMIN_IDENTIFIER=<admin email or mobile> E2E_ADMIN_PASSWORD=<password>
 *
 * The signup endpoint is rate-limited (5 per IP per hour), so the suite is
 * deliberately serial and creates as few accounts as possible.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
