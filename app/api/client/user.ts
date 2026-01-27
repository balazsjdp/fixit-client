import { useApi } from "@/hooks/use-api";
import { User } from "@/types/user";

export const useUser = (id?: string) => {
  return useApi<User>(id ? `/users/${id}` : null);
};
