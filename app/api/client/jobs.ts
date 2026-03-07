import api from "@/lib/api";
import { Job, JobWithDetails } from "@/types/job";
import useSWR from "swr";

export const getProJobs = async (): Promise<JobWithDetails[]> => {
  const { data } = await api.get("/api/pro/jobs");
  return data;
};

export const getMyJobs = async (): Promise<JobWithDetails[]> => {
  const { data } = await api.get("/api/jobs/mine");
  return data;
};

export const getJobByID = async (id: number): Promise<JobWithDetails> => {
  const { data } = await api.get(`/api/jobs/${id}`);
  return data;
};

export const confirmJob = async (id: number): Promise<Job> => {
  const { data } = await api.patch(`/api/jobs/${id}/confirm`);
  return data;
};

export const cancelJob = async (id: number, reason: string): Promise<void> => {
  await api.patch(`/api/jobs/${id}/cancel`, { reason });
};

export function useProJobs() {
  return useSWR<JobWithDetails[]>("/api/pro/jobs", getProJobs);
}

export function useMyJobs() {
  return useSWR<JobWithDetails[]>("/api/jobs/mine", getMyJobs);
}

export function useJob(id: number | null) {
  return useSWR<JobWithDetails>(id ? `/api/jobs/${id}` : null, () => getJobByID(id!));
}

export interface SubmitReviewRequest {
  rating: number; // 0–10
  comment?: string;
  isAnonymous?: boolean;
}

export const submitReview = async (
  jobId: number,
  payload: SubmitReviewRequest
): Promise<void> => {
  await api.post(`/api/jobs/${jobId}/reviews`, payload);
};
