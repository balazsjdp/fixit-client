import { Skeleton } from "@/components/ui/skeleton";

export function SidebarMenuSkeleton() {
  return (
    <div className="flex items-center gap-4 px-2 py-4">
      <div className="space-y-4 space-x-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[230px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}
