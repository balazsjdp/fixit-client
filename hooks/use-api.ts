import useSWR from "swr";
import { fetcher } from "@/app/api/fetcher";

export const useApi = <T>(path: string | null) => {
  const { data, error, isLoading } = useSWR<T>(path, fetcher.get);

  return {
    data,
    error,
    isLoading,
  };
};
