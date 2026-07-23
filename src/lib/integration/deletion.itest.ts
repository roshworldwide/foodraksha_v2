import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { deleteCustomerAccount } from "@/lib/dpdp/deletion";
import { createAccount } from "@/lib/signup";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { hasDatabase, purgeByMobile, uniqueMobile } from "./helpers";

describe("account deletion (integration)", { skip: !hasDatabase }, () => {
  const mobile = uniqueMobile();
  const e164 = `+91${mobile}`;

  after(async () => {
    await purgeByMobile(e164);
    await prisma.$disconnect();
  });

  it("erases the customer but keeps the Lead's attribution", async () => {
    const account = await createAccount(
      signupSchema.parse({
        name: "Erase Me",
        mobile,
        email: "erase@example.in",
        businessType: "RESTAURANT",
        city: "Pune",
        consent: true,
        utmSource: "deletion-itest",
      }),
      { ipAddress: "10.0.0.9" },
    );

    await deleteCustomerAccount(account.userId);

    // Personal data gone.
    assert.equal(
      await prisma.user.count({ where: { mobile: e164 } }),
      0,
      "user should be deleted",
    );
    assert.equal(
      await prisma.application.count({
        where: { applicationNo: account.applicationNo },
      }),
      0,
      "application should cascade-delete",
    );

    // Lead survives, redacted, with attribution intact.
    const lead = await prisma.lead.findFirst({
      where: { utmSource: "deletion-itest" },
    });
    assert.ok(lead, "lead should survive deletion");
    assert.equal(lead.name, "[deleted]");
    assert.equal(lead.email, null);
    assert.equal(lead.utmSource, "deletion-itest");
    assert.ok(lead.consentAt, "consent timestamp is attribution, kept");

    await prisma.lead.deleteMany({ where: { utmSource: "deletion-itest" } });
  });
});
