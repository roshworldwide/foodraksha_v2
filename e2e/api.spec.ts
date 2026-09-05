import { test, expect } from "@playwright/test";

/** Black-box checks of the public API contract — no UI, very stable. */
test.describe("public API", () => {
  test("GET /api/health responds ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok(), await res.text()).toBeTruthy();
  });

  test("POST /api/public/lead accepts a valid lead", async ({ request }) => {
    const stamp = `${Date.now()}`;
    const res = await request.post("/api/public/lead", {
      data: {
        name: "E2E Lead",
        mobile: `9${stamp.slice(-9).padStart(9, "0")}`,
        email: `e2e_lead_${stamp}@example.com`,
        city: "Pune",
        consent: true,
      },
    });
    expect(res.status(), await res.text()).toBeLessThan(300);
  });

  test("POST /api/public/lead rejects invalid input", async ({ request }) => {
    const res = await request.post("/api/public/lead", { data: { name: "x" } });
    expect(res.status()).toBe(400);
  });

  test("staff API refuses an unauthenticated request", async ({ request }) => {
    const res = await request.get("/api/staff/applications/does-not-exist");
    expect(res.status()).toBe(401);
  });
});
