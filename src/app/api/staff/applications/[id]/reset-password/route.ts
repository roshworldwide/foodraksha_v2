import { NextResponse, type NextRequest } from "next/server";
import { auditIp } from "@/lib/audit";
import { getSession } from "@/lib/auth/guards";
import {
  SignupError,
  deliverCredentials,
  resetCustomerPassword,
} from "@/lib/signup";

/**
 * Staff-initiated password reset for a locked-out customer. Generates a fresh
 * password, signs the customer out of every session, delivers the new
 * credentials (SMS/email, best effort) and returns them so staff can relay
 * them on the spot. Audited inside resetCustomerPassword.
 *
 * The plaintext password is returned only to the authenticated staff member
 * over HTTPS and is never logged — the same trust boundary as the on-screen
 * credentials at signup.
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
    const account = await resetCustomerPassword(id, session.user.id, {
      ipAddress: await auditIp(),
    });
    // Best effort — the reset stands regardless of delivery.
    const delivery = await deliverCredentials(account);
    return NextResponse.json(
      {
        ok: true,
        username: account.username,
        password: account.password,
        delivery,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SignupError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "NOT_FOUND" ? 404 : 400 },
      );
    }
    console.error("[staff] password reset failed:", error);
    return NextResponse.json(
      { error: "That password could not be reset. Please try again." },
      { status: 500 },
    );
  }
}
