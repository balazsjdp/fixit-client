import { Category } from "@/types/category";
import { useApi } from "@/hooks/use-api";

export const useCategories = () => {
  return useApi<Category[]>("/category");
};
