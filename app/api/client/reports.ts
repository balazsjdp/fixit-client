import api from "@/lib/api";
import { ReportCreationResponseDTO } from "@/types/dto/reportCreationResponse.dto";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function createReport(formData: FormData) {
  const response = await api.post<ReportCreationResponseDTO>(
    `${API_BASE_URL}/reports`,
    formData
  );

  return response.data;
}
