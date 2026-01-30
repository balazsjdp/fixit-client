"use client";
import { useCategories } from "@/app/api/client/categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopCategoriesSkeleton } from "../skeletons/desktop-categories-skeleton";
import { DynamicIcon } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";

export function CategorySelector() {
  const isMobile = useIsMobile();
  const { data: categories, isLoading } = useCategories();
  const selected = useReportForm().category;
  const { setCategory } = useReportActions();

  const onSelectHandler = (category: Category) => {
    setCategory(category);
  };

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
            {categories?.map((category) => {
              const isSelected = selected?.id === category.id;
              return (
                <button
                  key={category.id}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-primary/5 p-5 transition-all hover:border-primary cursor-pointer",
                    isSelected && "border-primary bg-foreground text-background"
                  )}
                  onClick={() => onSelectHandler(category)}
                >
                  <DynamicIcon
                    name={category.icon}
                    className={cn(
                      "text-primary",
                      isSelected && "text-background"
                    )}
                    size={24}
                  />
                  <span className="text-xs font-bold">{category.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
