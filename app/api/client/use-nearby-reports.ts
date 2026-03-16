import { useApi } from "@/app/api/use-api";
import { ProReport } from "@/types/report";

export const useNearbyReports = (enabled = true) => {
  return useApi<ProReport[]>(enabled ? "/api/pro/reports" : null);
};
