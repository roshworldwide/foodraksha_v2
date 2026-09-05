import { test, expect, makeUser, loginCustomer, formAlert } from "./fixtures";

/**
 * The core requirement: an account created on the website works to sign in to
 * the portal (same app, same database). Proves the website ↔ CRM connection.
 */

test("website signup creates an account that logs into the portal", async ({
  account,
  page,
}) => {
  expect(account.username, "signup should show a username").toBeTruthy();
  expect(
    account.password.length,
    "signup should show a real password",
  ).toBeGreaterThanOrEqual(8);
  // The username shown is the E.164 mobile the account was created with.
  expect(account.username.replace(/\D/g, "")).toContain(account.mobile);

  await loginCustomer(page, account.email, account.password);
  await expect(page).toHaveURL(/\/dashboard/);
});

test("the same credentials also work with the mobile number", async ({
  account,
  page,
}) => {
  await loginCustomer(page, account.mobile, account.password);
  await expect(page).toHaveURL(/\/dashboard/);
});

test("a wrong password is rejected without leaking whether the account exists", async ({
  page,
}) => {
  await loginCustomer(page, "does-not-exist@example.com", "wrong-password-123");
  await expect(formAlert(page)).toContainText(/incorrect/i);
  await expect(page).toHaveURL(/\/login/);
});

test("signing up again with the same mobile is refused", async ({
  account,
  page,
}) => {
  const dup = { ...makeUser(), mobile: account.mobile };
  await page.goto("/get-started");
  await page.locator("#name").fill(dup.name);
  await page.locator("#mobile").fill(dup.mobile);
  await page.locator("#email").fill(dup.email);
  await page.locator("#businessType").selectOption({ index: 1 });
  await page.locator("#city").fill(dup.city);
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Create my account" }).click();

  await expect(formAlert(page)).toContainText(/already exists/i);
});
