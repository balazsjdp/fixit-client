import api from "@/lib/api";

export async function markNotificationsRead(): Promise<void> {
  await api.patch("/api/notifications/mark-read");
}
