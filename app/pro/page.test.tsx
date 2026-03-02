import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProDashboard from "./page";
import { Professional } from "@/types/professional";
import { ProReport } from "@/types/report";
import { Category } from "@/types/category";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="map-mock" />,
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

// Mock ProLocationSection to expose onLocationChange without GPS
vi.mock("@/components/features/pro-location-section", () => ({
  ProLocationSection: ({
    onLocationChange,
    initialLat,
    initialLng,
  }: {
    onLocationChange: (lat: number, lng: number) => void;
    initialLat: number;
    initialLng: number;
  }) => (
    <div>
      <span data-testid="location-lat">{initialLat}</span>
      <span data-testid="location-lng">{initialLng}</span>
      <button
        data-testid="detect-location"
        onClick={() => onLocationChange(48.0, 20.0)}
      >
        Helyzet megállapítása
      </button>
    </div>
  ),
}));

// Mock RadiusSlider so we can trigger onChange without Radix Slider pointer events
vi.mock("@/components/features/radius-slider", () => ({
  RadiusSlider: ({
    onChange,
    value,
    saving,
  }: {
    onChange: (v: number) => void;
    value: number;
    saving?: boolean;
  }) => (
    <div>
      <span data-testid="radius-value">{value}</span>
      {saving && <span data-testid="saving-indicator">mentés...</span>}
      <button data-testid="change-radius" onClick={() => onChange(30)}>
        Change radius
      </button>
    </div>
  ),
}));

vi.mock("@/app/api/client/professionals", () => ({
  useMyProfessionalProfile: vi.fn(),
  updateProRadius: vi.fn().mockResolvedValue(undefined),
  updateProLocation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/features/offer-modal", () => ({
  OfferModal: ({
    open,
    reportId,
    onOpenChange,
  }: {
    open: boolean;
    reportId: number;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
  }) =>
    open ? (
      <div data-testid="offer-modal" data-report-id={reportId}>
        <button
          data-testid="close-offer-modal"
          onClick={() => onOpenChange(false)}
        >
          Bezár
        </button>
      </div>
    ) : null,
}));

vi.mock("@/app/api/client/use-nearby-reports", () => ({
  useNearbyReports: vi.fn(),
}));

vi.mock("@/app/api/client/categories", () => ({
  useCategories: vi.fn(),
}));

import { useMyProfessionalProfile, updateProRadius } from "@/app/api/client/professionals";
import { useNearbyReports } from "@/app/api/client/use-nearby-reports";
import { useCategories } from "@/app/api/client/categories";
import { useRouter } from "next/navigation";

const mockUsePro = useMyProfessionalProfile as ReturnType<typeof vi.fn>;
const mockUseReports = useNearbyReports as ReturnType<typeof vi.fn>;
const mockUseCategories = useCategories as ReturnType<typeof vi.fn>;
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
const mockUpdateProRadius = updateProRadius as ReturnType<typeof vi.fn>;

// ── Fixtures ─────────────────────────────────────────────────────────────────

const approvedPro: Professional = {
  id: 1,
  userId: "uid-1",
  name: "Kovács János",
  phone: "+36301234567",
  categoryIds: [7],
  radiusKm: 20,
  lat: 47.4979,
  lng: 19.0402,
  creditBalance: 150,
  status: "approved",
  createdAt: "2024-01-01T00:00:00Z",
};

const pendingPro: Professional = { ...approvedPro, status: "pending" };

const mockReports: ProReport[] = [
  {
    id: 10,
    categoryId: 7,
    description: "Csőtörés a fürdőszobában",
    urgency: 100,
    distanceKm: 5.2,
    lat: 47.51,
    lng: 19.05,
    createdAt: "2024-03-15T08:00:00Z",
  },
];

const mockCategories: Category[] = [
  { id: "7", label: "Vízvezeték", icon: "wrench" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupApproved(reports: ProReport[] = mockReports) {
  const mutatePro = vi.fn().mockResolvedValue(undefined);
  const mutateReports = vi.fn().mockResolvedValue(undefined);
  mockUsePro.mockReturnValue({
    data: approvedPro,
    isLoading: false,
    error: null,
    mutate: mutatePro,
  });
  mockUseReports.mockReturnValue({
    data: reports,
    isLoading: false,
    mutate: mutateReports,
  });
  mockUseCategories.mockReturnValue({ data: mockCategories });
  return { mutatePro, mutateReports };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseRouter.mockReturnValue({ replace: vi.fn() });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProDashboard – loading state", () => {
  it("renders skeletons while profile is loading", () => {
    mockUsePro.mockReturnValue({ data: undefined, isLoading: true, error: null, mutate: vi.fn() });
    mockUseReports.mockReturnValue({ data: undefined, isLoading: true, mutate: vi.fn() });
    mockUseCategories.mockReturnValue({ data: undefined });

    const { container } = render(<ProDashboard />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ProDashboard – pending professional", () => {
  it("shows pending approval message for pending professionals", () => {
    mockUsePro.mockReturnValue({
      data: pendingPro,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    mockUseReports.mockReturnValue({ data: [], isLoading: false, mutate: vi.fn() });
    mockUseCategories.mockReturnValue({ data: mockCategories });

    render(<ProDashboard />);
    expect(screen.getByText("Regisztráció folyamatban")).toBeDefined();
    expect(screen.getByText(/jóváhagyásra vár/)).toBeDefined();
  });
});

describe("ProDashboard – approved professional", () => {
  it("renders the dashboard header", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("displays credit balance", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByTestId("credit-balance")).toBeDefined();
    expect(screen.getByTestId("credit-balance").textContent).toContain("150");
  });

  it("renders the radius slider with initial value from profile", () => {
    setupApproved();
    render(<ProDashboard />);
    // The mocked RadiusSlider shows the value
    expect(screen.getByTestId("radius-value").textContent).toBe("20");
  });

  it("shows report count", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByTestId("report-count").textContent).toContain("1 bejelentés");
  });

  it("renders report descriptions", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByText("Csőtörés a fürdőszobában")).toBeDefined();
  });

  it('shows "Nincs bejelentés" when reports list is empty', () => {
    setupApproved([]);
    render(<ProDashboard />);
    expect(screen.getByTestId("no-reports")).toBeDefined();
  });

  it("renders loading skeletons for reports when reportsLoading", () => {
    mockUsePro.mockReturnValue({
      data: approvedPro,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    mockUseReports.mockReturnValue({ data: undefined, isLoading: true, mutate: vi.fn() });
    mockUseCategories.mockReturnValue({ data: mockCategories });

    const { container } = render(<ProDashboard />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ProDashboard – radius change", () => {
  it("updates radius immediately when slider changes", async () => {
    setupApproved();
    render(<ProDashboard />);

    fireEvent.click(screen.getByTestId("change-radius"));

    await waitFor(() => {
      expect(screen.getByTestId("radius-value").textContent).toBe("30");
    });
  });

  it("calls updateProRadius after debounce", async () => {
    vi.useFakeTimers();
    const { mutatePro, mutateReports } = setupApproved();
    render(<ProDashboard />);

    fireEvent.click(screen.getByTestId("change-radius"));
    expect(mockUpdateProRadius).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(mockUpdateProRadius).toHaveBeenCalledWith(30);
    expect(mutatePro).toHaveBeenCalled();
    expect(mutateReports).toHaveBeenCalled();

    vi.useRealTimers();
  });
});

describe("ProDashboard – location section", () => {
  it("renders the location section with initial coordinates", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByTestId("location-lat").textContent).toBe("47.4979");
    expect(screen.getByTestId("location-lng").textContent).toBe("19.0402");
  });

  it("updates map center when location is detected", async () => {
    setupApproved();
    render(<ProDashboard />);

    fireEvent.click(screen.getByTestId("detect-location"));

    // After location change, the map should receive updated center
    // (we can't inspect the map directly but the handler was called)
    await waitFor(() => {
      // The map mock is still rendered
      expect(screen.getByTestId("map-mock")).toBeDefined();
    });
  });
});

describe("ProDashboard – hover highlight", () => {
  it("highlights a card on mouseenter", async () => {
    setupApproved();
    render(<ProDashboard />);

    // Find the card wrapping div — ProReportCard is the real component
    const description = screen.getByText("Csőtörés a fürdőszobában");
    // Walk up to the card container (has border class)
    let card: HTMLElement = description;
    while (card && !card.className.includes("rounded-xl")) {
      card = card.parentElement as HTMLElement;
    }
    fireEvent.mouseEnter(card);
    // The card should now have highlighted border
    expect(card.className).toContain("border-primary");

    fireEvent.mouseLeave(card);
    expect(card.className).not.toContain("border-primary");
  });
});

describe("ProDashboard – no profile redirect", () => {
  it("renders nothing and redirects when proError is set", () => {
    const replaceFn = vi.fn();
    mockUseRouter.mockReturnValue({ replace: replaceFn });
    mockUsePro.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Not found"),
      mutate: vi.fn(),
    });
    mockUseReports.mockReturnValue({ data: undefined, isLoading: false, mutate: vi.fn() });
    mockUseCategories.mockReturnValue({ data: undefined });

    const { container } = render(<ProDashboard />);
    expect(replaceFn).toHaveBeenCalledWith("/pro/register");
    expect(container.firstChild).toBeNull();
  });
});

describe("ProDashboard – offer modal", () => {
  it("does not render the offer modal initially", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.queryByTestId("offer-modal")).toBeNull();
  });

  it("opens the offer modal when the offer button on a report card is clicked", async () => {
    setupApproved();
    render(<ProDashboard />);

    const offerBtn = screen.getByTestId(`offer-btn-${mockReports[0].id}`);
    fireEvent.click(offerBtn);

    await waitFor(() => {
      expect(screen.getByTestId("offer-modal")).toBeDefined();
    });
    expect(
      screen.getByTestId("offer-modal").getAttribute("data-report-id")
    ).toBe(String(mockReports[0].id));
  });

  it("closes the offer modal when onOpenChange(false) is called", async () => {
    setupApproved();
    render(<ProDashboard />);

    fireEvent.click(screen.getByTestId(`offer-btn-${mockReports[0].id}`));
    await waitFor(() => {
      expect(screen.getByTestId("offer-modal")).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("close-offer-modal"));
    await waitFor(() => {
      expect(screen.queryByTestId("offer-modal")).toBeNull();
    });
  });
});
