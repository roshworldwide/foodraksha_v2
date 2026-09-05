import { test, expect } from "@playwright/test";

test("home page loads with navigation and a headline", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/raksha/i);
  await expect(page.getByRole("navigation").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

const MARKETING_PAGES = [
  "/services",
  "/fssai-calculator",
  "/about",
  "/contact",
  "/membership",
  "/faq",
];

for (const path of MARKETING_PAGES) {
  test(`marketing page ${path} renders a headline`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), `${path} status`).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
}

test("the fee calculator page shows the calculator", async ({ page }) => {
  await page.goto("/fssai-calculator");
  await expect(
    page.getByRole("heading", { name: /calculator/i }).first(),
  ).toBeVisible();
});
