import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { SignupError, convertLead, deliverCredentials } from "@/lib/signup";

/**
 * Convert a lead into a customer account + DRAFT application (staff-initiated).
 * Reuses the same account creation as public signup, then delivers the
 * credentials to the new customer. Audited inside convertLead.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const account = await convertLead(id, session.user.id);
    // Best effort — the account exists regardless of delivery.
    const delivery = await deliverCredentials(account);
    return NextResponse.json({
      ok: true,
      applicationNo: account.applicationNo,
      username: account.username,
      delivery,
    });
  } catch (error) {
    if (error instanceof SignupError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "DUPLICATE_MOBILE" ? 409 : 400 },
      );
    }
    console.error("[leads] convert failed:", error);
    return NextResponse.json(
      { error: "That lead could not be converted. Please try again." },
      { status: 500 },
    );
  }
}
