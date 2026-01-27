import { useApi } from "@/hooks/use-api";
import { Config } from "@/store/config/config-store";

export const useConfig = () => {
  return useApi<Config>("/config");
};
