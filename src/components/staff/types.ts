import type { StatusTone } from "@/components/ui";

/** A desk row, already formatted on the server so the table stays dumb. */
export interface DeskRowView {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  businessName: string;
  categoryName: string;
  licenceLabel: string;
  percent: number;
  statusLabel: string;
  statusTone: StatusTone;
  updatedLabel: string;
}
