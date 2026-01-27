import { apiClient } from "../api-client";
import { Config } from "@/store/config/config-store";

export const getConfig = () => {
  return apiClient.get<Config>("/config");
};
