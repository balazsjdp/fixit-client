import { MyReport } from "@/types/report";
import { useApi } from "@/app/api/use-api";

export const useMyReports = () => {
  return useApi<MyReport[]>("/api/reports/mine");
};
