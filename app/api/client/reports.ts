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
