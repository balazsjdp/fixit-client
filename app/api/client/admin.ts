import { config } from "@/app.config";
import api from "@/lib/api";
import { useApi } from "@/app/api/use-api";
import { Professional } from "@/types/professional";

export const useAdminProfessionals = (status?: string) => {
  const query = status ? `?status=${status}` : "";
  return useApi<Professional[]>(`/api/admin/professionals${query}`);
};

export async function approveProfessional(id: number): Promise<void> {
  await api.patch(`${config.apiBaseUrl}/api/admin/professionals/${id}/approve`);
}

export async function addCredits(
  id: number,
  amount: number,
  note?: string
): Promise<void> {
  await api.post(
    `${config.apiBaseUrl}/api/admin/professionals/${id}/credits`,
    { amount, note }
  );
}
