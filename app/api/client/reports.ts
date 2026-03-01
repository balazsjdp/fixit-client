import { config } from "@/app.config";
import api from "@/lib/api";
import { ReportCreationResponseDTO } from "@/types/dto/reportCreationResponse.dto";
import { UpdateReportRequest } from "@/types/report";

export async function createReport(formData: FormData) {
  const response = await api.post<ReportCreationResponseDTO>(
    `${config.apiBaseUrl}/api/reports`,
    formData
  );

  return response.data;
}

export async function updateReport(id: number, data: UpdateReportRequest) {
  const response = await api.put(`/api/reports/${id}`, data);
  return response.data;
}

export async function deleteReport(id: number) {
  const response = await api.delete(`/api/reports/${id}`);
  return response.data;
}
