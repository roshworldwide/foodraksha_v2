import { test, expect, loginCustomer } from "./fixtures";

test("customer reaches their dashboard and the questionnaire", async ({
  account,
  page,
}) => {
  await loginCustomer(page, account.email, account.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page).toHaveTitle(/dashboard/i);

  // "Resume" should send a new account to its first incomplete section.
  await page.goto("/application");
  await expect(page).toHaveURL(/\/application\/(?!review)[a-z-]+/);
  // The questionnaire section renders a form to fill in.
  await expect(page.locator("form").first()).toBeVisible();
});

test("the portal protects pages behind sign-in", async ({ page }) => {
  // A fresh context (no session) must not reach the dashboard.
  await page.context().clearCookies();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
