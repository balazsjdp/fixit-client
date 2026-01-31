import { useApi } from "@/app/api/use-api";
import { Config } from "@/store/config/config-store";

export const useConfig = () => {
  return useApi<Config>("/config");
};
