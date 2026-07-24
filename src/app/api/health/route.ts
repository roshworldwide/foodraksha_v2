import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health — liveness for post-deploy verification and uptime checks.
 *
 * Unauthenticated by design: a monitor must be able to reach it. It reveals
 * nothing beyond whether the database answered, and never the reason why not
 * — an error string here would leak connection details to the internet.
 *
 * Always hits the database: a health check that only proves the process is up
 * would stay green through the outage that matters most.
 */

// Never prerendered or cached — a cached "ok" is worse than no health check.
export const dynamic = "force-dynamic";
export const revalidate = 0;
// Prisma needs the Node runtime; it cannot run on the edge.
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok" },
      { status: 200, headers: NO_STORE },
    );
  } catch (error) {
    // Logged server-side for the operator; the response body stays opaque.
    console.error(
      "[health] database unreachable:",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503, headers: NO_STORE },
    );
  }
}
