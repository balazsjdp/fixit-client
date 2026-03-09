import { OfferWithProfessional } from "@/types/offer";
import api from "@/lib/api";
import useSWR from "swr";

const fetcher = (url: string) =>
  api.get<OfferWithProfessional[]>(url).then((r) => r.data);

export const useReportOffers = (reportId: number | null) => {
  return useSWR<OfferWithProfessional[]>(
    reportId !== null ? `/api/reports/${reportId}/offers` : null,
    fetcher
  );
};
