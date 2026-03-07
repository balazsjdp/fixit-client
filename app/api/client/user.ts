import { useApi } from "@/app/api/use-api";
import { User } from "@/types/user";

export const useUser = (id?: string) => {
  if (!id) {
    throw new Error();
  }
  return useApi<User>(`/users/${id}`);
};
