import api from "@/lib/api";
import useSWR from "swr";

export const useApi = <T>(uri: string) => {
  const fetcher = (url: string) => api.get<T>(url).then((res) => res.data);
  return useSWR<T>(uri, fetcher);
};
