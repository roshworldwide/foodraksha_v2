import { test, expect, makeUser, loginStaff, formAlert } from "./fixtures";

/**
 * Team management (admin-only). Proves the whole staff lifecycle through the
 * real UI: an admin creates a login, the new person can sign in and reaches
 * the CRM, STAFF users cannot see or open the Team page, and deactivating
 * someone locks them out. Needs the seeded admin, like staff.spec.ts.
 */
const ADMIN = process.env.E2E_ADMIN_IDENTIFIER;
const ADMIN_PW = process.env.E2E_ADMIN_PASSWORD;

test.describe("team management", () => {
  test.beforeEach(() => {
    test.skip(
      !ADMIN || !ADMIN_PW,
      "Set E2E_ADMIN_IDENTIFIER and E2E_ADMIN_PASSWORD to run team tests",
    );
  });

  test("admin creates a staff login; it works; STAFF cannot manage the team; deactivation locks them out", async ({
    page,
    browser,
  }) => {
    const person = makeUser();
    const email = `staff_${person.email}`;

    // ── admin: Team page is in the sidebar and renders
    await loginStaff(page, ADMIN as string, ADMIN_PW as string);
    await expect(page).toHaveURL(/\/staff/);
    await page.getByRole("link", { name: "Team" }).click();
    await expect(page).toHaveURL(/\/staff\/team/);
    await expect(
      page.getByRole("heading", { name: "Add a staff member" }),
    ).toBeVisible();

    // ── create a STAFF login and capture the one-time password
    await page.locator("#staff-name").fill(person.name);
    await page.locator("#staff-email").fill(email);
    await page.locator("#staff-mobile").fill(person.mobile);
    await page.locator("#staff-role").selectOption("STAFF");
    await page.getByRole("button", { name: "Create login" }).click();
    await expect(
      page.getByRole("heading", { name: `Login created for ${person.name}` }),
    ).toBeVisible();
    const values = page.locator("dd.font-mono");
    const password = (await values.nth(2).innerText()).trim();
    expect(password.length).toBeGreaterThanOrEqual(8);

    // ── the new row appears, active
    await page.getByRole("button", { name: "Add another" }).click();
    const row = page.getByRole("row").filter({ hasText: person.name });
    await expect(row).toBeVisible();
    await expect(row.getByText("Active")).toBeVisible();

    // ── the same email cannot be used twice
    await page.locator("#staff-name").fill("Duplicate");
    await page.locator("#staff-email").fill(email);
    await page.locator("#staff-mobile").fill(makeUser().mobile);
    await page.getByRole("button", { name: "Create login" }).click();
    await expect(formAlert(page)).toContainText(/already signs in/i);

    // ── new staff member: signs in, reaches the CRM, but has no Team access
    const staffContext = await browser.newContext();
    const staffPage = await staffContext.newPage();
    await loginStaff(staffPage, email, password);
    await expect(staffPage).toHaveURL(/\/staff/);
    await expect(staffPage.getByRole("link", { name: "Team" })).toHaveCount(0);
    await staffPage.goto("/staff/team");
    await expect(staffPage).not.toHaveURL(/\/staff\/team/); // bounced to /staff
    const forbidden = await staffPage.request.post("/api/staff/team", {
      data: { name: "x", email: "x@x.in", mobile: "9000000000", role: "STAFF" },
    });
    expect(forbidden.status()).toBe(403);
    await staffContext.close();

    // ── admin deactivates them → login refused with the generic message
    await page.reload();
    await page
      .getByRole("row")
      .filter({ hasText: person.name })
      .getByRole("switch")
      .click();
    await expect(
      page.getByRole("row").filter({ hasText: person.name }).getByText("Deactivated"),
    ).toBeVisible();

    const lockedContext = await browser.newContext();
    const lockedPage = await lockedContext.newPage();
    await loginStaff(lockedPage, email, password);
    await expect(formAlert(lockedPage)).toContainText(/incorrect/i);
    await expect(lockedPage).toHaveURL(/\/login/);
    await lockedContext.close();

    // ── the admin cannot deactivate themselves
    const self = page.getByRole("row").filter({ hasText: "(you)" });
    await expect(self.getByRole("switch")).toBeDisabled();
  });
});
