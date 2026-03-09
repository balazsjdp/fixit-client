export type ReportStatusSlug = 'open' | 'assigned' | 'pending_completion' | 'completed' | 'disputed' | 'cancelled';

export interface ProReport {
  id: number;
  categoryId: number;
  statusId: number;
  statusSlug: ReportStatusSlug;
  shortDescription: string;
  description: string;
  urgency: number;
  filePath: string;
  distanceKm: number;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface MyReport {
  id: number;
  categoryId: number;
  statusId: number;
  statusSlug: ReportStatusSlug;
  assignedProId?: number;
  shortDescription: string;
  description: string;
  urgency: number;
  filePath: string;
  offerCount: number;
  hasAccepted: boolean;
  createdAt: string;
  price?: number;
  travelFee?: number;
}

