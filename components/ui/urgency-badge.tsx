import { Badge } from "@/components/ui/badge";
import { urgencyColor, urgencyLabel } from "@/lib/urgency";
import { cn } from "@/lib/utils";

type UrgencyBadgeProps = {
  urgency: number;
};

const UrgencyBadge = ({ urgency }: UrgencyBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn("px-2 py-1 text-xs", urgencyColor(urgency))}
    >
      {urgencyLabel(urgency)}
    </Badge>
  );
};

export { UrgencyBadge };
