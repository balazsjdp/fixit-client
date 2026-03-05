import { Badge } from "@/components/ui/badge";

export function CategoryBadge({ label }: { label: string }) {
  return (
    <Badge variant="outline" className="px-2 py-1 text-xs whitespace-nowrap">
      {label}
    </Badge>
  );
}
