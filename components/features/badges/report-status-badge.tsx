import { Badge } from "@/components/ui/badge";
import { ReportStatusSlug } from "@/types/report";
import { cn } from "@/lib/utils";

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
  pending_completion: "outline",
  completed: "outline",
  disputed: "destructive",
  cancelled: "destructive",
};

const statusClassName: Partial<Record<ReportStatusSlug, string>> = {
  pending_completion: "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
};

export function ReportStatusBadge({ status }: { status: ReportStatusSlug }) {
  return (
    <Badge
      variant={statusVariants[status]}
      className={cn("whitespace-nowrap", statusClassName[status])}
    >
      {statusLabels[status]}
    </Badge>
  );
}
