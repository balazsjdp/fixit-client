import { useApi } from "@/app/api/use-api";
import { MyOffer } from "@/types/offer";

export const useMyOffers = (enabled = true) => {
  return useApi<MyOffer[]>(enabled ? "/api/pro/offers" : null);
};
