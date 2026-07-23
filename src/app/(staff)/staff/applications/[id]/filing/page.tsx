import type { Metadata } from "next";
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

  return <FilingWorkspaceView workspace={workspace} />;
}
