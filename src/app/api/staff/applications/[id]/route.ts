import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { loadStaffDetail } from "@/lib/staff/detail";

/** Detail for the slide-over. Fetched, not navigated to — the list stays put. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const detail = await loadStaffDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(detail, {
    headers: { "Cache-Control": "no-store" },
  });
}
