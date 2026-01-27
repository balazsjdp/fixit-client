import { apiClient } from "../api-client";

export const getUser = (id: string) => {
  return apiClient.get(`/users/${id}`);
};
