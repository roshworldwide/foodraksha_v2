import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createAccount } from "@/lib/signup";
import { prisma } from "@/lib/prisma";
import { parseAnswers } from "@/lib/questionnaire/schema";
import { signupSchema } from "@/lib/validation";
import { hasDatabase, purgeByMobile, uniqueMobile } from "./helpers";

/**
 * Autosave's safety property: the route merges with `data || patch::jsonb`, so
 * two saves of different keys can never wipe one another. Tested against the
 * real database with the exact SQL the route uses.
 */
describe("autosave merge (integration)", { skip: !hasDatabase }, () => {
  const mobile = uniqueMobile();
  const e164 = `+91${mobile}`;

  after(async () => {
    await purgeByMobile(e164);
    await prisma.$disconnect();
  });

  it("merges concurrent patches without losing keys", async () => {
    const account = await createAccount(
      signupSchema.parse({
        name: "Autosave Test",
        mobile,
        email: "autosave@example.in",
        businessType: "RESTAURANT",
        city: "Pune",
        consent: true,
      }),
      { ipAddress: null },
    );

    const app = await prisma.application.findFirstOrThrow({
      where: { applicationNo: account.applicationNo },
      select: { id: true },
    });

    // Five different fields written concurrently.
    const fields = [
      "premises.address_1",
      "premises.city",
      "premises.district",
      "premises.state",
      "premises.pincode",
    ];
    await Promise.all(
      fields.map(
        (key) =>
          prisma.$executeRaw`
          UPDATE "Application"
          SET data = data || ${JSON.stringify({ [key]: `V-${key}` })}::jsonb
          WHERE id = ${app.id}
        `,
      ),
    );

    const fresh = await prisma.application.findUniqueOrThrow({
      where: { id: app.id },
      select: { data: true },
    });
    const answers = parseAnswers(fresh.data);
    for (const key of fields) {
      assert.equal(answers[key], `V-${key}`, `${key} was lost in the merge`);
    }
  });
});
