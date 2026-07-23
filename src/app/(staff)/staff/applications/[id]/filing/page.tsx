import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilingWorkspaceView } from "@/components/filing/FilingWorkspace";
import { requireStaff } from "@/lib/auth/guards";
import { loadFilingWorkspace } from "@/lib/filing/workspace";

export const metadata: Metadata = {
  title: "Filing workspace — FoodRaksha Staff",
};

/**
 * The filing workspace — built to sit on half the screen with FoSCoS on the
 * other. Not inside the standard staff shell: this page wants every pixel of
 * width, so it has its own minimal chrome.
 */
export default async function FilingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  const workspace = await loadFilingWorkspace(id);
  if (!workspace) notFound();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 border-b-[0.5px] border-separator bg-white-titanium/[0.9] px-5 py-2.5 backdrop-blur-[20px]">
        <Link
          href="/staff"
          className="text-footnote font-semibold text-label-2 hover:text-label"
        >
          ‹ Back to desk
        </Link>
      </header>

      <FilingWorkspaceView workspace={workspace} />
    </div>
  );
}
