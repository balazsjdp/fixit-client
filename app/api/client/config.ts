import { apiClient } from "../api-client";

export const getConfig = () => {
  return apiClient.get("/api/config");
};
