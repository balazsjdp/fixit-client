import { config } from "@/app.config";
import api from "@/lib/api";
import { ReportCreationResponseDTO } from "@/types/dto/reportCreationResponse.dto";

export async function createReport(formData: FormData) {
  const response = await api.post<ReportCreationResponseDTO>(
    `${config.apiBaseUrl}/api/reports`,
    formData
  );

  return response.data;
}

export async function deleteReport(id: number) {
  const response = await api.delete(`/api/reports/${id}`);
  return response.data;
}

export async function confirmReport(id: number) {
  const response = await api.patch(`/api/reports/${id}/confirm`);
  return response.data;
}

export async function cancelReport(id: number, reason: string) {
  const response = await api.patch(`/api/reports/${id}/cancel`, { reason });
  return response.data;
}

export interface SubmitReviewRequest {
  rating: number;
  comment?: string;
  isAnonymous: boolean;
}

export async function submitReview(reportId: number, data: SubmitReviewRequest) {
  const response = await api.post(`/api/reports/${reportId}/reviews`, data);
  return response.data;
}

export async function releaseTicket(id: number) {
  const response = await api.post(`/api/pro/reports/${id}/release`);
  return response.data;
}
