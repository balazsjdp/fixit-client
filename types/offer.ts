import { ReportStatusSlug } from "./report";

export type OfferStatus = "pending" | "accepted" | "rejected";

export interface MyOffer {
  id: number;
  reportId: number;
  categoryId: number;
  shortDescription: string;
  description: string;
  urgency: number;
  estimatedPrice: number;
  travelFee: number;
  status: OfferStatus;
  createdAt: string;
  reportStatusSlug: ReportStatusSlug;
  filePaths: string[];
  clientName?: string;
  clientPhone?: string;
  address?: {
    postcode: string;
    city: string;
    street: string;
    houseNumber: string;
  };
}

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
