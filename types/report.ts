export interface ProReport {
  id: number;
  categoryId: number;
  description: string;
  urgency: number;
  distanceKm: number;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface MyReport {
  id: number;
  categoryId: number;
  description: string;
  urgency: number;
  filePath: string;
  offerCount: number;
  hasAccepted: boolean;
  createdAt: string;
}

