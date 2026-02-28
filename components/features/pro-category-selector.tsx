"use client";

import { useCategories } from "@/app/api/client/categories";
import { DesktopCategoriesSkeleton } from "../skeletons/desktop-categories-skeleton";
import { DynamicIcon } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import {
  useProRegisterForm,
  useProRegisterActions,
} from "@/store/pro/pro-register-store-provider";

export function ProCategorySelector() {
  const { data: categories, isLoading } = useCategories();
  const selectedIds = useProRegisterForm().categoryIds;
  const { toggleCategory } = useProRegisterActions();

  if (isLoading) return <DesktopCategoriesSkeleton />;

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
        1. Szakmák kiválasztása
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Válaszd ki azokat a kategóriákat, amelyekben dolgozol. Több is
        kijelölhető.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories?.map((category) => {
          const isSelected = selectedIds.includes(
            typeof category.id === "string"
              ? parseInt(category.id)
              : category.id
          );
          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                toggleCategory(
                  typeof category.id === "string"
                    ? parseInt(category.id)
                    : category.id
                )
              }
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-primary/5 p-5 transition-all hover:border-primary cursor-pointer",
                isSelected && "border-primary bg-foreground text-background"
              )}
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
      {selectedIds.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          {selectedIds.length} kategória kijelölve
        </p>
      )}
    </div>
  );
}
