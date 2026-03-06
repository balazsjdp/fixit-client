import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import ReportDetailPage from "./page";
import { MyReport } from "@/types/report";
import { Category } from "@/types/category";
import { OfferWithProfessional } from "@/types/offer";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, use: vi.fn((val: unknown) => val) };
});

vi.mock("@/app/api/client/use-my-reports", () => ({
  useMyReports: vi.fn(),
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

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/app.config", () => ({
  config: { apiBaseUrl: "http://localhost:8080" },
}));

import { useMyReports } from "@/app/api/client/use-my-reports";
import { useReportOffers } from "@/app/api/client/use-report-offers";
import { useCategories } from "@/app/api/client/categories";
import { acceptOffer } from "@/app/api/client/offers";
import { toast } from "sonner";

const mockUseMyReports = useMyReports as ReturnType<typeof vi.fn>;
const mockUseReportOffers = useReportOffers as ReturnType<typeof vi.fn>;
const mockUseCategories = useCategories as ReturnType<typeof vi.fn>;
const mockAcceptOffer = acceptOffer as ReturnType<typeof vi.fn>;
const mockToast = toast as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};
const mockMutateReports = vi.fn();
const mockMutateOffers = vi.fn();

const mockCategories: Category[] = [
  { id: "1", label: "Vízvezeték", icon: "wrench" },
];

const mockReport: MyReport = {
  id: 1,
  categoryId: 1,
  shortDescription: "Csöpögő csap a konyhában",
  description: "Csöpögő csap a konyhában részletesen",
  urgency: 3,
  filePath: "",
  offerCount: 2,
  hasAccepted: false,
  createdAt: "2024-03-12T10:00:00Z",
};

const mockOffer: OfferWithProfessional = {
  id: 10,
  reportId: 1,
  professionalId: 5,
  estimatedPrice: 15000,
  travelFee: 3000,
  status: "pending",
  createdAt: "2024-03-13T10:00:00Z",
  professional: {
    id: 5,
    name: "Kiss János",
    phone: "+36301234567",
    avgRating: 4.7,
    ratingCount: 23,
    badges: [],
  },
};

// params passed as plain object since react.use is mocked to identity
const params = { id: "1" } as unknown as Promise<{ id: string }>;

function setup({
  reports = [mockReport],
  offers = [mockOffer],
  reportsLoading = false,
  offersLoading = false,
  reportsError = null,
}: {
  reports?: MyReport[];
  offers?: OfferWithProfessional[];
  reportsLoading?: boolean;
  offersLoading?: boolean;
  reportsError?: Error | null;
} = {}) {
  mockUseMyReports.mockReturnValue({
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
    mutate: mockMutateReports,
  });
  mockUseReportOffers.mockReturnValue({
    data: offers,
    isLoading: offersLoading,
    mutate: mockMutateOffers,
  });
  mockUseCategories.mockReturnValue({ data: mockCategories });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ReportDetailPage – loading state", () => {
  it("shows loading skeletons while loading", () => {
    setup({ reportsLoading: true });
    const { container } = render(<ReportDetailPage params={params} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ReportDetailPage – error / not found state", () => {
  it("shows not found message when report list is empty", () => {
    setup({ reports: [] });
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("A bejelentés nem található.")).toBeDefined();
  });

  it("shows not found message when reports fail to load", () => {
    setup({ reportsError: new Error("Network error") });
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("A bejelentés nem található.")).toBeDefined();
  });

  it('renders back link in error state', () => {
    setup({ reports: [] });
    render(<ReportDetailPage params={params} />);
    const links = screen.getAllByText("Vissza a bejelentésekhez");
    expect(links[0].closest("a")?.getAttribute("href")).toBe(
      "/client/my-reports"
    );
  });
});

describe("ReportDetailPage – report header", () => {
  it("renders the report description", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Csöpögő csap a konyhában")).toBeDefined();
  });

  it("renders the resolved category label", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Vízvezeték")).toBeDefined();
  });

  it("renders the urgency label (Sürgős for urgency=3)", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Sürgős")).toBeDefined();
  });

  it('renders "Folyamatban" badge for non-accepted report', () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Folyamatban")).toBeDefined();
  });

  it('renders "Lezárva" badge for accepted report', () => {
    setup({ reports: [{ ...mockReport, hasAccepted: true }] });
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Lezárva")).toBeDefined();
  });

  it("renders image when filePath is set", () => {
    setup({ reports: [{ ...mockReport, filePath: "uploads/test.jpg" }] });
    render(<ReportDetailPage params={params} />);
    const img = screen.getByAltText("Hiba fotója") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.src).toContain("uploads/test.jpg");
  });

  it("renders placeholder icon when no image", () => {
    setup({ reports: [{ ...mockReport, filePath: "" }] });
    render(<ReportDetailPage params={params} />);
    expect(screen.queryByAltText("Hiba fotója")).toBeNull();
  });

  it('renders "Vissza a bejelentésekhez" back link', () => {
    setup();
    render(<ReportDetailPage params={params} />);
    const link = screen.getAllByText("Vissza a bejelentésekhez")[0].closest("a");
    expect(link?.getAttribute("href")).toBe("/client/my-reports");
  });
});

describe("ReportDetailPage – accepted professional card", () => {
  it("does not show accepted professional card for non-accepted report", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.queryByText("Elfogadott szakember")).toBeNull();
  });

  it("shows professional name and phone after acceptance", () => {
    const acceptedReport = { ...mockReport, hasAccepted: true };
    const acceptedOffer = { ...mockOffer, status: "accepted" as const };
    setup({ reports: [acceptedReport], offers: [acceptedOffer] });
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Elfogadott szakember")).toBeDefined();
    // name appears in both accepted card and offer list - check at least one exists
    expect(screen.getAllByText("Kiss János").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("+36301234567")).toBeDefined();
  });

  it("phone is a tel: link", () => {
    const acceptedReport = { ...mockReport, hasAccepted: true };
    const acceptedOffer = { ...mockOffer, status: "accepted" as const };
    setup({ reports: [acceptedReport], offers: [acceptedOffer] });
    render(<ReportDetailPage params={params} />);
    const phoneLink = screen.getByText("+36301234567").closest("a");
    expect(phoneLink?.getAttribute("href")).toBe("tel:+36301234567");
  });
});

describe("ReportDetailPage – offers list", () => {
  it("shows empty message when no offers", () => {
    setup({ offers: [] });
    render(<ReportDetailPage params={params} />);
    expect(
      screen.getByText("Még nem érkezett ajánlat erre a bejelentésre.")
    ).toBeDefined();
  });

  it("renders the offer count in section heading", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("(1)")).toBeDefined();
  });

  it("renders the professional name", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Kiss János")).toBeDefined();
  });

  it("renders the professional rating", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("4.7")).toBeDefined();
    expect(screen.getByText("(23 értékelés)")).toBeDefined();
  });

  it("renders price labels", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Munkadíj:")).toBeDefined();
    expect(screen.getByText("Kiszállási díj:")).toBeDefined();
    expect(screen.getByText("Összesen:")).toBeDefined();
  });

  it("renders badges for professionals with badges", () => {
    const offerWithBadge: OfferWithProfessional = {
      ...mockOffer,
      professional: {
        ...mockOffer.professional,
        badges: [
          { id: 1, name: "Megbízható", description: "Megbízható szakember", icon: "⭐" },
        ],
      },
    };
    setup({ offers: [offerWithBadge] });
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("⭐ Megbízható")).toBeDefined();
  });

  it('shows "Elfogadott" badge for accepted offer', () => {
    setup({ offers: [{ ...mockOffer, status: "accepted" }] });
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Elfogadott")).toBeDefined();
  });

  it('shows "Elutasított" badge for rejected offer', () => {
    setup({ offers: [{ ...mockOffer, status: "rejected" }] });
    render(<ReportDetailPage params={params} />);
    expect(screen.getByText("Elutasított")).toBeDefined();
  });
});

describe("ReportDetailPage – accept offer flow", () => {
  it("shows Elfogad button for pending offer on non-accepted report", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    expect(screen.getByRole("button", { name: "Elfogad" })).toBeDefined();
  });

  it("does not show Elfogad button when report is already accepted", () => {
    setup({
      reports: [{ ...mockReport, hasAccepted: true }],
      offers: [{ ...mockOffer, status: "pending" }],
    });
    render(<ReportDetailPage params={params} />);
    expect(screen.queryByRole("button", { name: "Elfogad" })).toBeNull();
  });

  it("does not show Elfogad button for accepted offer", () => {
    setup({ offers: [{ ...mockOffer, status: "accepted" }] });
    render(<ReportDetailPage params={params} />);
    expect(screen.queryByRole("button", { name: "Elfogad" })).toBeNull();
  });

  it("does not show Elfogad button for rejected offer", () => {
    setup({ offers: [{ ...mockOffer, status: "rejected" }] });
    render(<ReportDetailPage params={params} />);
    expect(screen.queryByRole("button", { name: "Elfogad" })).toBeNull();
  });

  it("opens confirmation dialog on Elfogad click", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    expect(screen.getByText("Elfogadja az ajánlatot?")).toBeDefined();
  });

  it("shows professional name in confirmation dialog", () => {
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Kiss János")).toBeDefined();
  });

  it("does not call acceptOffer when Mégsem is clicked", async () => {
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    fireEvent.click(screen.getByText("Mégsem"));
    await waitFor(() => {
      expect(mockAcceptOffer).not.toHaveBeenCalled();
    });
  });

  it("calls acceptOffer with correct IDs and shows success toast", async () => {
    mockAcceptOffer.mockResolvedValue({ message: "ok" });
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Elfogadom" }));
    await waitFor(() => {
      expect(mockAcceptOffer).toHaveBeenCalledWith(1, 10);
      expect(mockToast.success).toHaveBeenCalledWith(
        "Ajánlat sikeresen elfogadva!"
      );
    });
  });

  it("calls mutate on both reports and offers after acceptance", async () => {
    mockAcceptOffer.mockResolvedValue({ message: "ok" });
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Elfogadom" }));
    await waitFor(() => {
      expect(mockMutateOffers).toHaveBeenCalled();
      expect(mockMutateReports).toHaveBeenCalled();
    });
  });

  it("shows specific error toast for 402 (insufficient credits)", async () => {
    mockAcceptOffer.mockRejectedValue({
      isAxiosError: true,
      response: { status: 402 },
    });
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Elfogadom" }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Nincs elegendő kredit az ajánlat elfogadásához."
      );
    });
  });

  it("shows specific error toast for 409 (already processed)", async () => {
    mockAcceptOffer.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409 },
    });
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Elfogadom" }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Ez az ajánlat már fel lett dolgozva."
      );
    });
  });

  it("shows generic error toast for other axios errors", async () => {
    mockAcceptOffer.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500 },
    });
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Elfogadom" }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Hiba az ajánlat elfogadása során."
      );
    });
  });

  it("shows generic error toast for non-axios errors", async () => {
    mockAcceptOffer.mockRejectedValue(new Error("Network failure"));
    setup();
    render(<ReportDetailPage params={params} />);
    fireEvent.click(screen.getByRole("button", { name: "Elfogad" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Elfogadom" }));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Hiba az ajánlat elfogadása során."
      );
    });
  });
});
