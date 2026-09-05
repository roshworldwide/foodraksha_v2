import { test as base, expect, type Page } from "@playwright/test";

export { expect };

/** A brand-new customer we can sign up and then sign in as. */
export interface TestUser {
  name: string;
  mobile: string;
  email: string;
  city: string;
}

export interface Account extends TestUser {
  /** The username shown on the signup screen (the E.164 mobile). */
  username: string;
  /** The one-time password shown on the signup screen. */
  password: string;
}

let counter = 0;

/** Unique, valid-looking Indian mobile + email per call. */
export function makeUser(): TestUser {
  counter += 1;
  const stamp = `${Date.now()}${counter}`;
  const last9 = stamp.slice(-9).padStart(9, "0");
  return {
    name: `E2E Test ${stamp.slice(-6)}`,
    mobile: `9${last9}`, // 10 digits, starts 9
    email: `e2e_${stamp}@example.com`,
    city: "Pune",
  };
}

/**
 * Complete the website's self-signup (/get-started) and return the credentials
 * it displays. Throws if the "account ready" panel never appears.
 */
export async function signUp(page: Page, user: TestUser): Promise<Account> {
  await page.goto("/get-started");
  await page.locator("#name").fill(user.name);
  await page.locator("#mobile").fill(user.mobile);
  await page.locator("#email").fill(user.email);
  // Index 0 is the disabled "Select business type…" placeholder.
  await page.locator("#businessType").selectOption({ index: 1 });
  await page.locator("#city").fill(user.city);
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Create my account" }).click();

  await expect(
    page.getByRole("heading", { name: "Your account is ready" }),
  ).toBeVisible();

  const values = page.locator("dd.font-mono");
  const username = (await values.nth(0).innerText()).trim();
  const password = (await values.nth(1).innerText()).trim();
  return { ...user, username, password };
}

/**
 * The forms render their errors as `<p role="alert">`. Next.js also injects a
 * permanently-empty `<div role="alert" id="__next-route-announcer__">` for
 * screen-reader route announcements, so a bare getByRole("alert") matches two
 * elements as soon as a real error appears and trips strict mode. Scope to the
 * paragraph the app actually renders.
 */
export function formAlert(page: Page) {
  return page.locator('p[role="alert"]');
}

/** Sign in on the customer ("FR-Member") tab of /login. */
export async function loginCustomer(
  page: Page,
  identifier: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByRole("radio", { name: "I'm an FR-Member" }).click();
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Sign in on the staff tab of /login. */
export async function loginStaff(
  page: Page,
  identifier: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByRole("radio", { name: "I'm staff" }).click();
  await page.locator("#identifier").fill(identifier);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/**
 * A single customer account, created once per worker (workers=1 → once per
 * run) so login / journey / staff-visibility tests reuse it and the suite
 * stays under the signup rate limit.
 */
export const test = base.extend<object, { account: Account }>({
  account: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const account = await signUp(page, makeUser());
      await context.close();
      await use(account);
    },
    { scope: "worker" },
  ],
});
