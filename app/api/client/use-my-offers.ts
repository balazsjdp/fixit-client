import { useApi } from "@/app/api/use-api";
import { MyOffer } from "@/types/offer";

export const useMyOffers = () => {
  return useApi<MyOffer[]>("/api/pro/offers");
};
