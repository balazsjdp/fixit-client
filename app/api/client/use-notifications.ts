import api from "@/lib/api";
import useSWR from "swr";
import { Notification } from "@/types/notification";

export const useNotifications = () => {
  const fetcher = (url: string) =>
    api.get<Notification[]>(url).then((res) => res.data);
  return useSWR<Notification[]>("/api/notifications", fetcher, {
    refreshInterval: 30000,
  });
};
