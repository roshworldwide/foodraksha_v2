import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { SignupError, createAccount } from "@/lib/signup";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { hasDatabase, purgeByMobile, uniqueMobile } from "./helpers";

describe("signup flow (integration)", { skip: !hasDatabase }, () => {
  const mobile = uniqueMobile();
  const e164 = `+91${mobile}`;

  before(() => purgeByMobile(e164));
  after(async () => {
    await purgeByMobile(e164);
    await prisma.$disconnect();
  });

  it("creates Lead, User, Customer and a DRAFT application atomically", async () => {
    const input = signupSchema.parse({
      name: "Integration Test",
      mobile,
      email: "integration@example.in",
      businessType: "RESTAURANT",
      city: "Pune",
      consent: true,
      utmSource: "ci",
      utmCampaign: "signup-itest",
    });

    const account = await createAccount(input, { ipAddress: "10.0.0.1" });

    assert.equal(account.username, e164);
    assert.match(account.applicationNo, /^FR-\d{4}-\d{4}$/);
    assert.ok(account.password.length >= 8);

    const user = await prisma.user.findUnique({
      where: { mobile: e164 },
      select: {
        role: true,
        passwordHash: true,
        customer: {
          select: { applications: { select: { status: true } } },
        },
      },
    });
    assert.equal(user?.role, "CUSTOMER");
    // The password is never stored in readable form.
    assert.ok(user?.passwordHash.startsWith("$argon2id$"));
    assert.notEqual(user?.passwordHash, account.password);
    assert.equal(user?.customer?.applications[0]?.status, "DRAFT");

    // The Lead keeps its attribution and links to the new user.
    const lead = await prisma.lead.findFirst({ where: { mobile: e164 } });
    assert.equal(lead?.utmSource, "ci");
    assert.equal(lead?.utmCampaign, "signup-itest");
    assert.ok(lead?.consentAt);
    assert.equal(lead?.convertedUserId, account.userId);
  });

  it("rejects a duplicate mobile", async () => {
    const input = signupSchema.parse({
      name: "Second Attempt",
      mobile,
      email: "second@example.in",
      businessType: "RESTAURANT",
      city: "Pune",
      consent: true,
    });
    await assert.rejects(
      () => createAccount(input, { ipAddress: "10.0.0.1" }),
      (error: unknown) =>
        error instanceof SignupError && error.code === "DUPLICATE_MOBILE",
    );
  });
});
