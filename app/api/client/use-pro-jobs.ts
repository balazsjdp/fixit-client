import { useApi } from "@/app/api/use-api";
import { MyOffer } from "@/types/offer";

export const useProJobs = () => {
  return useApi<MyOffer[]>("/api/pro/jobs");
};
