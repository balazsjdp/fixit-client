import { OfferWithProfessional } from "@/types/offer";
import { useApi } from "@/app/api/use-api";

export const useReportOffers = (reportId: number) => {
  return useApi<OfferWithProfessional[]>(`/api/reports/${reportId}/offers`);
};
