import { Category } from "@/types/category";
import { useApi } from "@/app/api/use-api";

export const useCategories = () => {
  return useApi<Category[]>("/categories");
};
