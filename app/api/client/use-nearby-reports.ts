import { useApi } from "@/app/api/use-api";
import { ProReport } from "@/types/report";

export const useNearbyReports = () => {
  return useApi<ProReport[]>("/api/pro/reports");
};
