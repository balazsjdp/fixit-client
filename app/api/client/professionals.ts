import { config } from "@/app.config";
import api from "@/lib/api";
import useSWR from "swr";
import { useApi } from "@/app/api/use-api";
import {
  Professional,
  RegisterProfessionalRequest,
} from "@/types/professional";

export async function registerProfessional(
  data: RegisterProfessionalRequest
): Promise<{ id: number; message: string }> {
  const response = await api.post<{ id: number; message: string }>(
    `${config.apiBaseUrl}/api/professionals`,
    data
  );
  return response.data;
}

const fetcher = (url: string) =>
  api.get<Professional>(url).then((res) => res.data);

export const useMyProfessionalProfile = (enabled = true) => {
  return useSWR<Professional>(enabled ? "/api/professionals/me" : null, fetcher, {
    revalidateOnFocus: false,
  });
};

export async function updateProRadius(radiusKm: number): Promise<void> {
  await api.patch("/api/professionals/me", { radiusKm });
}

export async function updateProLocation(lat: number, lng: number): Promise<void> {
  await api.patch("/api/professionals/me/location", { lat, lng });
}

export async function updateProNotificationPreference(notifyEmail: boolean): Promise<void> {
  await api.patch("/api/professionals/me/notifications", { notifyEmail });
}
