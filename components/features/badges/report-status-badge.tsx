import { Badge } from "@/components/ui/badge";
import { ReportStatusSlug } from "@/types/report";

const statusLabels: Record<ReportStatusSlug, string> = {
  open: "Nyitott",
  assigned: "Hozzárendelve",
  pending_completion: "Készre jelentve",
  completed: "Befejezve",
  disputed: "Vitás",
  cancelled: "Visszavonva",
};

const statusVariants: Record<ReportStatusSlug, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  assigned: "secondary",
  pending_completion: "secondary",
  completed: "outline",
  disputed: "destructive",
  cancelled: "destructive",
};

export function ReportStatusBadge({ status }: { status: ReportStatusSlug }) {
  return (
    <Badge variant={statusVariants[status]} className="whitespace-nowrap">
      {statusLabels[status]}
    </Badge>
  );
}
