import { NextResponse, type NextRequest } from "next/server";
import { auditIp } from "@/lib/audit";
import { getSession } from "@/lib/auth/guards";
import { TeamError, resetStaffPassword } from "@/lib/staff/team";

/**
 * POST /api/staff/team/[id]/reset-password — admin-issued reset for a staff
 * member who is locked out. Every session of theirs is revoked; the new
 * password is returned once for hand-over and never logged.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only an administrator can reset a staff password." },
      { status: 403 },
    );
  }

  const { id } = await params;

  try {
    const account = await resetStaffPassword(id, session.user.id, {
      ipAddress: await auditIp(),
    });
    return NextResponse.json(
      {
        ok: true,
        email: account.email,
        mobile: account.mobile,
        password: account.password,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "NOT_FOUND" ? 404 : 400 },
      );
    }
    console.error("[team] staff password reset failed:", error);
    return NextResponse.json(
      { error: "That password could not be reset. Please try again." },
      { status: 500 },
    );
  }
}
