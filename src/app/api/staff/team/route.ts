import { NextResponse, type NextRequest } from "next/server";
import { auditIp } from "@/lib/audit";
import { getSession } from "@/lib/auth/guards";
import { TeamError, createStaffUser } from "@/lib/staff/team";
import { staffSchema } from "@/lib/validation";

/**
 * POST /api/staff/team — create a staff login. Admin only: a STAFF session
 * gets 403, not a redirect, because this is an API and the caller is code.
 *
 * The generated password is returned once to the authenticated admin over
 * HTTPS and never logged — the same trust boundary as customer signup.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only an administrator can add staff." },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = staffSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return NextResponse.json(
      { error: "Please check the details below.", fieldErrors },
      { status: 400 },
    );
  }

  try {
    const account = await createStaffUser(parsed.data, session.user.id, {
      ipAddress: await auditIp(),
    });
    return NextResponse.json(
      {
        ok: true,
        userId: account.userId,
        name: account.name,
        email: account.email,
        mobile: account.mobile,
        role: account.role,
        password: account.password,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code.startsWith("DUPLICATE") ? 409 : 400 },
      );
    }
    console.error("[team] create staff failed:", error);
    return NextResponse.json(
      { error: "That account could not be created. Please try again." },
      { status: 500 },
    );
  }
}
