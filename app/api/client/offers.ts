import api from "@/lib/api";

export async function acceptOffer(reportId: number, offerId: number) {
  const response = await api.patch(
    `/api/reports/${reportId}/offers/${offerId}/accept`
  );
  return response.data;
}

export interface SubmitOfferRequest {
  estimatedPrice: number;
  travelFee: number;
}

export async function submitOffer(
  reportId: number,
  data: SubmitOfferRequest
): Promise<{ id: number; message: string }> {
  const response = await api.post<{ id: number; message: string }>(
    `/api/pro/reports/${reportId}/offers`,
    data
  );
  return response.data;
}

export async function deleteOffer(offerId: number) {
  const response = await api.delete(`/api/pro/offers/${offerId}`);
  return response.data;
}

export async function releaseReport(reportId: number) {
  const response = await api.post(`/api/pro/reports/${reportId}/release`);
  return response.data;
}
