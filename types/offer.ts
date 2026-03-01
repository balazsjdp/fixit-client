export type OfferStatus = "pending" | "accepted" | "rejected";

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface ProfessionalWithStats {
  id: number;
  name: string;
  phone: string;
  avgRating: number;
  ratingCount: number;
  badges: Badge[];
}

export interface OfferWithProfessional {
  id: number;
  reportId: number;
  professionalId: number;
  estimatedPrice: number;
  travelFee: number;
  status: OfferStatus;
  createdAt: string;
  professional: ProfessionalWithStats;
}
