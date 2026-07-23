import type { Metadata } from "next";
import { PipelineBoard } from "@/components/staff/PipelineBoard";
import { StaffPage } from "@/components/staff/StaffPage";
import { requireStaff } from "@/lib/auth/guards";
import { loadPipelineBoard, PIPELINE_ORDER } from "@/lib/staff/screens";

export const metadata: Metadata = { title: "Pipeline — FoodRaksha Staff" };

export default async function PipelinePage() {
  await requireStaff();
  const board = await loadPipelineBoard();

  return (
    <StaffPage
      wide
      description="Every live application by stage. Drag a card to a new column to change its status — the move is checked and recorded."
    >
      <PipelineBoard order={PIPELINE_ORDER} board={board} />
    </StaffPage>
  );
}
