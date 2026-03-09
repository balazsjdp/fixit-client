import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MyOffersPage from "./page";
import { Professional } from "@/types/professional";
import { MyOffer } from "@/types/offer";
import { Category } from "@/types/category";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

vi.mock("@/app/api/client/professionals", () => ({
  useMyProfessionalProfile: vi.fn(),
}));

vi.mock("@/app/api/client/use-my-offers", () => ({
  useMyOffers: vi.fn(),
}));

vi.mock("@/app/api/client/categories", () => ({
  useCategories: vi.fn(),
}));

import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useCategories } from "@/app/api/client/categories";
import { useRouter } from "next/navigation";

const mockUsePro = useMyProfessionalProfile as ReturnType<typeof vi.fn>;
const mockUseOffers = useMyOffers as ReturnType<typeof vi.fn>;
const mockUseCategories = useCategories as ReturnType<typeof vi.fn>;
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const approvedPro: Professional = {
  id: 1,
  userId: "uid-1",
  name: "Kovács János",
  phone: "+36301234567",
  categoryIds: [1],
  radiusKm: 20,
  lat: 47.4979,
  lng: 19.0402,
  creditBalance: 150,
  status: "approved",
  createdAt: "2024-01-01T00:00:00Z",
  avgRating: 4.5,
  ratingCount: 12,
  badges: [],
  notifyEmail: true,
};

const mockCategories: Category[] = [
  { id: "1", label: "Vízvezeték-szerelés", icon: "wrench" },
];

const pendingOffer: MyOffer = {
  id: 20,
  reportId: 5,
  categoryId: 1,
  shortDescription: "Csöpögő csap",
  description: "Csöpög a konyhai csap",
  urgency: 50,
  estimatedPrice: 25000,
  travelFee: 3000,
  status: "pending",
  createdAt: "2026-03-05T10:00:00Z",
  reportStatusSlug: "open",
  filePath: "",
};

const acceptedOffer: MyOffer = {
  ...pendingOffer,
  id: 21,
  status: "accepted",
  address: {
    postcode: "2085",
    city: "Pilisvörösvár",
    street: "Fő út",
    houseNumber: "12",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupPage(offers: MyOffer[] = [], proOverride?: Partial<Professional>) {
  mockUsePro.mockReturnValue({
    data: { ...approvedPro, ...proOverride },
    isLoading: false,
    error: null,
    mutate: vi.fn(),
  });
  mockUseOffers.mockReturnValue({
    data: offers,
    isLoading: false,
    error: null,
    mutate: vi.fn(),
  });
  mockUseCategories.mockReturnValue({ data: mockCategories });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseRouter.mockReturnValue({ replace: vi.fn() });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MyOffersPage", () => {
  it("renders page header", () => {
    setupPage();
    render(<MyOffersPage />);
    expect(screen.getByText("Ajánlataim")).toBeInTheDocument();
  });

  it("shows skeleton while pro loading", () => {
    mockUsePro.mockReturnValue({ data: null, isLoading: true, error: null, mutate: vi.fn() });
    mockUseOffers.mockReturnValue({ data: null, isLoading: false, error: null });
    mockUseCategories.mockReturnValue({ data: [] });
    render(<MyOffersPage />);
    // Skeleton renders, no header
    expect(screen.queryByText("Ajánlataim")).not.toBeInTheDocument();
  });

  it("redirects to register if no pro profile", () => {
    const replace = vi.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockUsePro.mockReturnValue({ data: null, isLoading: false, error: new Error("404"), mutate: vi.fn() });
    mockUseOffers.mockReturnValue({ data: null, isLoading: false, error: null });
    mockUseCategories.mockReturnValue({ data: [] });
    render(<MyOffersPage />);
    expect(replace).toHaveBeenCalledWith("/pro/register");
  });

  it("shows empty state when no offers", () => {
    setupPage([]);
    render(<MyOffersPage />);
    expect(screen.getByTestId("no-offers")).toBeInTheDocument();
  });

  it("shows error state when offers fetch fails", () => {
    mockUsePro.mockReturnValue({ data: approvedPro, isLoading: false, error: null, mutate: vi.fn() });
    mockUseOffers.mockReturnValue({ data: null, isLoading: false, error: new Error("fail") });
    mockUseCategories.mockReturnValue({ data: mockCategories });
    render(<MyOffersPage />);
    expect(screen.getByTestId("offers-error")).toBeInTheDocument();
  });

  it("renders offer cards", () => {
    setupPage([pendingOffer, acceptedOffer]);
    render(<MyOffersPage />);
    expect(screen.getByTestId("offers-list")).toBeInTheDocument();
    expect(screen.getByTestId("my-offer-card-20")).toBeInTheDocument();
    expect(screen.getByTestId("my-offer-card-21")).toBeInTheDocument();
  });

  it("shows skeleton while offers loading", () => {
    mockUsePro.mockReturnValue({ data: approvedPro, isLoading: false, error: null, mutate: vi.fn() });
    mockUseOffers.mockReturnValue({ data: null, isLoading: true, error: null });
    mockUseCategories.mockReturnValue({ data: mockCategories });
    render(<MyOffersPage />);
    expect(screen.queryByTestId("offers-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("no-offers")).not.toBeInTheDocument();
  });

  it("passes correct category to offer card", () => {
    setupPage([pendingOffer]);
    render(<MyOffersPage />);
    expect(screen.getByText("Vízvezeték-szerelés")).toBeInTheDocument();
  });

  it("shows accepted address for accepted offer", () => {
    setupPage([acceptedOffer]);
    render(<MyOffersPage />);
    expect(screen.getByTestId("accepted-address")).toBeInTheDocument();
    expect(screen.getByText(/Pilisvörösvár/)).toBeInTheDocument();
  });
});
