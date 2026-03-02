import { Badge } from "./offer";

export type ProfessionalStatus = "pending" | "approved";

export interface Professional {
  id: number;
  userId: string;
  name: string;
  phone: string;
  categoryIds: number[];
  radiusKm: number;
  lat: number;
  lng: number;
  creditBalance: number;
  status: ProfessionalStatus;
  createdAt: string;
  avgRating: number;
  ratingCount: number;
  badges: Badge[];
}

export interface RegisterProfessionalRequest {
  name: string;
  phone: string;
  categoryIds: number[];
  radiusKm: number;
  lat?: number;
  lng?: number;
}
