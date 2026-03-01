import api from "@/lib/api";

export async function acceptOffer(reportId: number, offerId: number) {
  const response = await api.patch(
    `/api/reports/${reportId}/offers/${offerId}/accept`
  );
  return response.data;
}
