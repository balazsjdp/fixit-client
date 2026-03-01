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

export interface UpdateReportRequest {
  description: string;
  urgency: number;
  categoryId: number;
  address: {
    postcode: string;
    city: string;
    street: string;
    houseNumber: string;
  };
  lat: number;
  lng: number;
}
