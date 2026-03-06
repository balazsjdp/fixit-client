export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  payload?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}
