import { Badge } from "@/components/ui/badge";

export function ReportStatusBadge({ hasAccepted }: { hasAccepted: boolean }) {
  return (
    <Badge variant={hasAccepted ? "secondary" : "default"} className="whitespace-nowrap">
      {hasAccepted ? "Lezárva" : "Folyamatban"}
    </Badge>
  );
}
