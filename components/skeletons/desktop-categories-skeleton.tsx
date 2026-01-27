import { Skeleton } from "@/components/ui/skeleton";

export function DesktopCategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((a, i) => {
        return <Skeleton key={`key-${i}`} className="h-30 w-full" />;
      })}
    </div>
  );
}
