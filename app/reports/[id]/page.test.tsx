import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TicketDetailPage from "./page";
import { MyReport, ReportStatusSlug } from "@/types/report";
import { MyOffer, OfferWithProfessional } from "@/types/offer";
import { Category } from "@/types/category";
import { Professional } from "@/types/professional";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, use: vi.fn((val: unknown) => val) };
});

vi.mock("@/app/api/client/use-my-reports", () => ({
  useMyReports: vi.fn(),
}));
vi.mock("@/app/api/client/use-my-offers", () => ({
  useMyOffers: vi.fn(),
}));
vi.mock("@/app/api/client/professionals", () => ({
  useMyProfessionalProfile: vi.fn(),
}));
vi.mock("@/app/api/client/use-report-offers", () => ({
  useReportOffers: vi.fn(),
}));
vi.mock("@/app/api/client/categories", () => ({
  useCategories: vi.fn(),
}));
vi.mock("@/app/api/client/offers", () => ({
  acceptOffer: vi.fn(),
}));
vi.mock("@/app/api/client/reports", () => ({
  confirmReport: vi.fn(),
  cancelReport: vi.fn(),
  submitReview: vi.fn(),
  releaseTicket: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/app.config", () => ({
  config: { apiBaseUrl: "http://localhost:8080" },
}));

import { useMyReports } from "@/app/api/client/use-my-reports";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import { useReportOffers } from "@/app/api/client/use-report-offers";
import { useCategories } from "@/app/api/client/categories";
import { confirmReport, releaseTicket } from "@/app/api/client/reports";
import { toast } from "sonner";

const mockUseMyReports = useMyReports as ReturnType<typeof vi.fn>;
const mockUseMyOffers = useMyOffers as ReturnType<typeof vi.fn>;
const mockUsePro = useMyProfessionalProfile as ReturnType<typeof vi.fn>;
const mockUseReportOffers = useReportOffers as ReturnType<typeof vi.fn>;
const mockUseCategories = useCategories as ReturnType<typeof vi.fn>;
const mockConfirmReport = confirmReport as ReturnType<typeof vi.fn>;
const mockReleaseTicket = releaseTicket as ReturnType<typeof vi.fn>;
const mockMutate = vi.fn();

// ── Fixtures ──────────────────────────────────────────────────────────────────

const REPORT_ID = 42;

const mockCategories: Category[] = [
  { id: "1", label: "Vízvezetékszerelő", icon: "wrench" },
];

const clientReport: MyReport = {
  id: REPORT_ID,
  categoryId: 1,
  statusId: 1,
  statusSlug: "open",
  shortDescription: "Csöpögő csap",
  description: "A konyhai csap folyamatosan csöpög.",
  urgency: 50,
  filePath: "",
  offerCount: 1,
  hasAccepted: false,
  createdAt: "2026-01-01T10:00:00Z",
};

const assignedReport: MyReport = {
  ...clientReport,
  statusSlug: "assigned",
  hasAccepted: true,
};

const pendingCompletionReport: MyReport = {
  ...clientReport,
  statusSlug: "pending_completion",
  hasAccepted: true,
};

const mockOfferWithPro: OfferWithProfessional = {
  id: 99,
  reportId: REPORT_ID,
  professionalId: 7,
  estimatedPrice: 20000,
  travelFee: 2000,
  status: "pending",
  createdAt: "2026-01-01T11:00:00Z",
  professional: {
    id: 7,
    name: "Kovács János",
    phone: "+36301234567",
    avgRating: 4.5,
    ratingCount: 10,
    badges: [],
  },
};

const acceptedOfferWithPro: OfferWithProfessional = {
  ...mockOfferWithPro,
  status: "accepted",
};

const proOffer: MyOffer = {
  id: 99,
  reportId: REPORT_ID,
  categoryId: 1,
  shortDescription: "Csöpögő csap",
  description: "A konyhai csap folyamatosan csöpög.",
  urgency: 50,
  estimatedPrice: 20000,
  travelFee: 2000,
  status: "accepted",
  createdAt: "2026-01-01T11:00:00Z",
  reportStatusSlug: "assigned",
  filePath: "",
  clientName: "Ügyfél Béla",
  clientPhone: "+36201234567",
  address: {
    postcode: "1011",
    city: "Budapest",
    street: "Fő utca",
    houseNumber: "1",
  },
};

const approvedPro: Professional = {
  id: 7,
  userId: "pro-uid",
  name: "Kovács János",
  phone: "+36301234567",
  categoryIds: [1],
  radiusKm: 20,
  lat: 47.5,
  lng: 19.0,
  creditBalance: 5000,
  status: "approved",
  createdAt: "2026-01-01T00:00:00Z",
  avgRating: 4.5,
  ratingCount: 10,
  badges: [],
  notifyEmail: true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupClientView(reportOverride?: Partial<MyReport>, offers: OfferWithProfessional[] = []) {
  mockUseMyReports.mockReturnValue({
    data: [{ ...clientReport, ...reportOverride }],
    isLoading: false,
    mutate: mockMutate,
  });
  mockUseMyOffers.mockReturnValue({ data: [], isLoading: false, mutate: mockMutate });
  mockUsePro.mockReturnValue({ data: null, isLoading: false });
  mockUseReportOffers.mockReturnValue({ data: offers, isLoading: false, mutate: mockMutate });
  mockUseCategories.mockReturnValue({ data: mockCategories });
}

function setupProView(offerOverride?: Partial<MyOffer>) {
  mockUseMyReports.mockReturnValue({ data: [], isLoading: false, mutate: mockMutate });
  mockUseMyOffers.mockReturnValue({
    data: [{ ...proOffer, ...offerOverride }],
    isLoading: false,
    mutate: mockMutate,
  });
  mockUsePro.mockReturnValue({ data: approvedPro, isLoading: false });
  mockUseReportOffers.mockReturnValue({ data: [], isLoading: false, mutate: mockMutate });
  mockUseCategories.mockReturnValue({ data: mockCategories });
}

// The `use` mock returns `val` directly, so pass a plain object (not a Promise)
// to simulate synchronous resolution in tests.
const renderPage = () =>
  render(
    <TicketDetailPage
      params={{ id: String(REPORT_ID) } as unknown as Promise<{ id: string }>}
    />
  );

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TicketDetailPage – loading state", () => {
  it("shows skeleton while data is loading", () => {
    mockUseMyReports.mockReturnValue({ data: undefined, isLoading: true, mutate: mockMutate });
    mockUseMyOffers.mockReturnValue({ data: undefined, isLoading: true, mutate: mockMutate });
    mockUsePro.mockReturnValue({ data: null, isLoading: true });
    mockUseReportOffers.mockReturnValue({ data: undefined, isLoading: false, mutate: mockMutate });
    mockUseCategories.mockReturnValue({ data: [] });

    renderPage();
    expect(screen.queryByText("Csöpögő csap")).not.toBeInTheDocument();
  });
});

describe("TicketDetailPage – access denied", () => {
  it("shows not found when user has no access", () => {
    mockUseMyReports.mockReturnValue({ data: [], isLoading: false, mutate: mockMutate });
    mockUseMyOffers.mockReturnValue({ data: [], isLoading: false, mutate: mockMutate });
    mockUsePro.mockReturnValue({ data: null, isLoading: false });
    mockUseReportOffers.mockReturnValue({ data: [], isLoading: false, mutate: mockMutate });
    mockUseCategories.mockReturnValue({ data: [] });

    renderPage();
    expect(screen.getByText(/nem található/i)).toBeInTheDocument();
  });
});

describe("TicketDetailPage – client view", () => {
  it("renders the report title and description", () => {
    setupClientView();
    renderPage();
    expect(screen.getByText("Csöpögő csap")).toBeInTheDocument();
    expect(screen.getByText(/konyhai csap/)).toBeInTheDocument();
  });

  it("shows 'Vissza a bejelentéseimhez' back link for client", () => {
    setupClientView();
    renderPage();
    expect(screen.getByText("Vissza a bejelentéseimhez")).toBeInTheDocument();
  });

  it("shows offer list for open report", () => {
    setupClientView({}, [mockOfferWithPro]);
    renderPage();
    expect(screen.getByText("Kovács János")).toBeInTheDocument();
  });

  it("shows pending_completion confirmation button", () => {
    setupClientView({ statusSlug: "pending_completion", hasAccepted: true }, [acceptedOfferWithPro]);
    renderPage();
    expect(screen.getByText(/Munkát késznek fogadom/)).toBeInTheDocument();
  });

  it("calls confirmReport when confirm button clicked", async () => {
    mockConfirmReport.mockResolvedValue({});
    setupClientView({ statusSlug: "pending_completion", hasAccepted: true }, [acceptedOfferWithPro]);
    renderPage();

    fireEvent.click(screen.getByText(/Munkát késznek fogadom/));
    await waitFor(() => expect(mockConfirmReport).toHaveBeenCalledWith(REPORT_ID));
  });

  it("shows assigned pro contact card when report is assigned", () => {
    setupClientView({ statusSlug: "assigned", hasAccepted: true }, [acceptedOfferWithPro]);
    renderPage();
    expect(screen.getByText(/Hozzárendelt szakember/)).toBeInTheDocument();
    expect(screen.getByText(/Kovács János/)).toBeInTheDocument();
  });

  it("shows review form for completed report", () => {
    setupClientView({ statusSlug: "completed" }, [acceptedOfferWithPro]);
    renderPage();
    expect(screen.getByText(/Értékelje a szakembert/)).toBeInTheDocument();
  });
});

describe("TicketDetailPage – pro view", () => {
  it("renders the ticket title for pro", () => {
    setupProView();
    renderPage();
    expect(screen.getByText("Csöpögő csap")).toBeInTheDocument();
  });

  it("shows 'Vissza az ajánlataimhoz' back link for pro", () => {
    setupProView();
    renderPage();
    expect(screen.getByText("Vissza az ajánlataimhoz")).toBeInTheDocument();
  });

  it("shows 'Szakember nézet' badge", () => {
    setupProView();
    renderPage();
    expect(screen.getByText("Szakember nézet")).toBeInTheDocument();
  });

  it("shows client contact info when assigned to pro", () => {
    setupProView({ reportStatusSlug: "assigned" });
    renderPage();
    expect(screen.getByText("Ügyfél adatai")).toBeInTheDocument();
    expect(screen.getByText("Ügyfél Béla")).toBeInTheDocument();
    expect(screen.getByText(/1011.*Budapest/)).toBeInTheDocument();
  });

  it("shows action buttons when assigned", () => {
    setupProView({ reportStatusSlug: "assigned" });
    renderPage();
    expect(screen.getByText(/Munka elvégezve/)).toBeInTheDocument();
    expect(screen.getByText("Lemondás")).toBeInTheDocument();
  });

  it("calls confirmReport on készre jelent click", async () => {
    mockConfirmReport.mockResolvedValue({});
    setupProView({ reportStatusSlug: "assigned" });
    renderPage();

    fireEvent.click(screen.getByText(/Munka elvégezve/));
    await waitFor(() => expect(mockConfirmReport).toHaveBeenCalledWith(REPORT_ID));
  });

  it("calls releaseTicket after confirming release dialog", async () => {
    mockReleaseTicket.mockResolvedValue({});
    setupProView({ reportStatusSlug: "assigned" });
    renderPage();

    fireEvent.click(screen.getByText("Lemondás"));
    // Confirm dialog should appear
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    fireEvent.click(screen.getByText("Igen, lemondok"));
    await waitFor(() => expect(mockReleaseTicket).toHaveBeenCalledWith(REPORT_ID));
  });

  it("shows waiting message when pending_completion", () => {
    setupProView({ reportStatusSlug: "pending_completion" });
    renderPage();
    expect(screen.getByText(/Várakozás az ügyfél visszaigazolására/)).toBeInTheDocument();
  });

  it("shows completed message when ticket is done", () => {
    setupProView({ reportStatusSlug: "completed" });
    renderPage();
    expect(screen.getByText(/Munka sikeresen befejezve/)).toBeInTheDocument();
  });

  it("shows pending offer message when offer not yet accepted", () => {
    setupProView({ status: "pending", reportStatusSlug: "open" });
    renderPage();
    expect(screen.getByText(/Az ajánlatod beküldve/)).toBeInTheDocument();
  });

  it("shows pro offer details in sidebar", () => {
    setupProView();
    renderPage();
    expect(screen.getByText("Az ajánlatom")).toBeInTheDocument();
    expect(screen.getByText(/20.*000/)).toBeInTheDocument();
  });
});
