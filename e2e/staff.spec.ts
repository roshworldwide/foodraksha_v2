import { test, expect, loginStaff } from "./fixtures";

/**
 * Staff-side proof that a website signup lands in the CRM. Requires a seeded
 * admin login — skipped automatically when the env vars aren't provided:
 *   E2E_ADMIN_IDENTIFIER=<admin email or mobile>  E2E_ADMIN_PASSWORD=<password>
 */
const ADMIN = process.env.E2E_ADMIN_IDENTIFIER;
const ADMIN_PW = process.env.E2E_ADMIN_PASSWORD;

test.describe("staff CRM", () => {
  test.beforeEach(() => {
    test.skip(
      !ADMIN || !ADMIN_PW,
      "Set E2E_ADMIN_IDENTIFIER and E2E_ADMIN_PASSWORD to run staff tests",
    );
  });

  test("admin can sign in to the CRM", async ({ page }) => {
    await loginStaff(page, ADMIN as string, ADMIN_PW as string);
    await expect(page).toHaveURL(/\/staff/);
  });

  test("a website signup appears in the staff client desk", async ({
    account,
    page,
  }) => {
    await loginStaff(page, ADMIN as string, ADMIN_PW as string);
    await expect(page).toHaveURL(/\/staff/);

    await page.goto("/staff/clients");
    await page.getByLabel("Search customers").fill(account.mobile);
    await expect(page.getByText(account.name).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
