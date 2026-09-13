import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auditIp } from "@/lib/audit";
import { getSession } from "@/lib/auth/guards";
import { TeamError, setStaffActive } from "@/lib/staff/team";

const patchSchema = z.object({ isActive: z.boolean() });

/** PATCH /api/staff/team/[id] — deactivate or reactivate a staff login. Admin only. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only an administrator can change staff access." },
      { status: 403 },
    );
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id } = await params;

  try {
    const row = await setStaffActive(
      id,
      parsed.data.isActive,
      session.user.id,
      { ipAddress: await auditIp() },
    );
    return NextResponse.json(
      { ok: true, isActive: row.isActive },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "NOT_FOUND" ? 404 : 400 },
      );
    }
    console.error("[team] set active failed:", error);
    return NextResponse.json(
      { error: "That change could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
