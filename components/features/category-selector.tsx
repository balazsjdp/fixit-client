"use client";
import { useCategories } from "@/app/api/client/categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopCategoriesSkeleton } from "../skeletons/desktop-categories-skeleton";

export function CategorySelector() {
  const isMobile = useIsMobile();
  const { data: categories, isLoading } = useCategories();

  if (isMobile) {
    return <div>Mobile category selector</div>;
  } else {
    return (
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
          1. Kategória kiválasztása
        </h3>
        {isLoading ? (
          <DesktopCategoriesSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.map((category) => (
              <button
                key={category.id}
                className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-primary/5 p-5 transition-all"
              >
                <span className="material-symbols-outlined text-primary">
                  {category.icon}
                </span>
                <span className="text-xs font-bold">{category.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}
