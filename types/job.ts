export enum JobStatus {
  InProgress = 'in_progress',
  PendingCompletion = 'pending_completion',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
  Disputed = 'disputed',
}

export interface Job {
  id: number;
  offerId: number;
  reportId: number;
  professionalId: number;
  clientUserId: string;
  price: number;
  travelFee: number;
  status: JobStatus;
  clientConfirmed: boolean;
  proConfirmed: boolean;
  cancellationReason?: string;
  cancelledBy?: string;
  autoCloseAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface JobWithDetails extends Job {
  shortDescription: string;
  categoryId: number;
  urgency: number;
  professionalName: string;
  professionalPhone: string;
  address?: {
    postcode: string;
    city: string;
    street: string;
    houseNumber: string;
  };
}
