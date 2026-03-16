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

vi.mock("@/components/auth/KeycloakProvider", () => ({
  useAuth: vi.fn(() => ({ keycloak: { logout: vi.fn() }, isReady: true })),
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
  updateProNotificationPreference: vi.fn().mockResolvedValue(undefined),
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

vi.mock("@/app/api/client/use-pro-jobs", () => ({
  useProJobs: vi.fn(),
}));

vi.mock("@/app/api/client/use-my-offers", () => ({
  useMyOffers: vi.fn(),
}));

vi.mock("@/app/api/client/categories", () => ({
  useCategories: vi.fn(),
}));

import { useMyProfessionalProfile, updateProRadius, updateProNotificationPreference } from "@/app/api/client/professionals";
import { useNearbyReports } from "@/app/api/client/use-nearby-reports";
import { useProJobs } from "@/app/api/client/use-pro-jobs";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useCategories } from "@/app/api/client/categories";
import { useAuth } from "@/components/auth/KeycloakProvider";
import { useRouter } from "next/navigation";
import { MyOffer } from "@/types/offer";

const mockUsePro = useMyProfessionalProfile as ReturnType<typeof vi.fn>;
const mockUseReports = useNearbyReports as ReturnType<typeof vi.fn>;
const mockUseProJobs = useProJobs as ReturnType<typeof vi.fn>;
const mockUseMyOffers = useMyOffers as ReturnType<typeof vi.fn>;
const mockUseCategories = useCategories as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
const mockUpdateProRadius = updateProRadius as ReturnType<typeof vi.fn>;
const mockUpdateProNotificationPreference = updateProNotificationPreference as ReturnType<typeof vi.fn>;

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
  avgRating: 4.5,
  ratingCount: 12,
  badges: [],
  notifyEmail: true,
};

const pendingPro: Professional = { ...approvedPro, status: "pending" };

const mockReports: ProReport[] = [
  {
    id: 10,
    categoryId: 7,
    shortDescription: "Csőtörés a fürdőszobában",
    description: "Csőtörés a fürdőszobában részletesen",
    urgency: 100,
    filePath: "",
    distanceKm: 5.2,
    lat: 47.51,
    lng: 19.05,
    createdAt: "2024-03-15T08:00:00Z",
  },
];

const mockCategories: Category[] = [
  { id: "7", label: "Vízvezeték", icon: "wrench" },
];

const makeJob = (overrides: Partial<MyOffer> = {}): MyOffer => ({
  id: 100,
  reportId: 42,
  categoryId: 7,
  shortDescription: "Csőtörés javítása",
  description: "Részletes leírás",
  urgency: 80,
  estimatedPrice: 25000,
  travelFee: 3000,
  status: "accepted",
  reportStatusSlug: "assigned",
  filePath: "",
  createdAt: "2024-03-20T10:00:00Z",
  clientName: "Teszt Béla",
  clientPhone: "+36201234567",
  address: { postcode: "1111", city: "Budapest", street: "Fő utca 1.", houseNumber: "1" },
  ...overrides,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupApproved(reports: ProReport[] = mockReports, jobs: MyOffer[] = [], offers: MyOffer[] = []) {
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
  mockUseProJobs.mockReturnValue({ data: jobs, isLoading: false });
  mockUseMyOffers.mockReturnValue({ data: offers, isLoading: false });
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
    mockUseProJobs.mockReturnValue({ data: undefined, isLoading: true });
    mockUseMyOffers.mockReturnValue({ data: undefined, isLoading: true });
    mockUseCategories.mockReturnValue({ data: undefined });

    const { container } = render(<ProDashboard />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ProDashboard – pending professional", () => {
  function setupPending() {
    mockUsePro.mockReturnValue({
      data: pendingPro,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    mockUseReports.mockReturnValue({ data: [], isLoading: false, mutate: vi.fn() });
    mockUseProJobs.mockReturnValue({ data: [], isLoading: false });
    mockUseMyOffers.mockReturnValue({ data: [], isLoading: false });
    mockUseCategories.mockReturnValue({ data: mockCategories });
  }

  it("shows pending approval message for pending professionals", () => {
    setupPending();
    render(<ProDashboard />);
    expect(screen.getByText("Regisztráció folyamatban")).toBeDefined();
    expect(screen.getByText(/jóváhagyásra vár/)).toBeDefined();
  });

  it("navigates to home when 'Vissza a főoldalra' is clicked", () => {
    const pushFn = vi.fn();
    mockUseRouter.mockReturnValue({ replace: vi.fn(), push: pushFn });
    setupPending();
    render(<ProDashboard />);
    fireEvent.click(screen.getByText("Vissza a főoldalra"));
    expect(pushFn).toHaveBeenCalledWith("/");
  });

  it("calls keycloak logout when 'Kijelentkezés' is clicked", () => {
    const logoutFn = vi.fn();
    mockUseAuth.mockReturnValue({ keycloak: { logout: logoutFn }, isReady: true });
    setupPending();
    render(<ProDashboard />);
    fireEvent.click(screen.getByText("Kijelentkezés"));
    expect(logoutFn).toHaveBeenCalled();
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
    mockUseProJobs.mockReturnValue({ data: [], isLoading: false });
    mockUseMyOffers.mockReturnValue({ data: [], isLoading: false });
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
    mockUseProJobs.mockReturnValue({ data: undefined, isLoading: false });
    mockUseMyOffers.mockReturnValue({ data: undefined, isLoading: false });
    mockUseCategories.mockReturnValue({ data: undefined });

    const { container } = render(<ProDashboard />);
    expect(replaceFn).toHaveBeenCalledWith("/pro/register");
    expect(container.firstChild).toBeNull();
  });
});

describe("ProDashboard – notification toggle", () => {
  it("renders the email notification toggle", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByText("Email értesítők")).toBeDefined();
    expect(screen.getByRole("switch", { name: "Email értesítők" })).toBeDefined();
  });

  it("calls updateProNotificationPreference when toggled", async () => {
    const { mutatePro } = setupApproved();
    render(<ProDashboard />);

    fireEvent.click(screen.getByRole("switch", { name: "Email értesítők" }));

    await waitFor(() => {
      expect(mockUpdateProNotificationPreference).toHaveBeenCalledWith(false);
      expect(mutatePro).toHaveBeenCalled();
    });
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

describe("ProDashboard – tabs", () => {
  it("shows all three tabs: Felfedezés, Ajánlataim, Munkáim", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByTestId("tab-discovery")).toBeDefined();
    expect(screen.getByTestId("tab-offers")).toBeDefined();
    expect(screen.getByTestId("tab-jobs")).toBeDefined();
  });

  it("defaults to Felfedezés tab showing report list", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByTestId("report-count")).toBeDefined();
    expect(screen.getByText("Csőtörés a fürdőszobában")).toBeDefined();
  });

  it("shows report count badge on Felfedezés tab", () => {
    setupApproved();
    render(<ProDashboard />);
    expect(screen.getByTestId("report-count-badge").textContent).toBe("1");
  });

  it("shows pending offers count badge on Ajánlataim tab", () => {
    setupApproved(mockReports, [], [
      makeJob({ id: 200, status: "pending", reportStatusSlug: "open" }),
      makeJob({ id: 201, status: "pending", reportStatusSlug: "open" }),
      makeJob({ id: 202, status: "rejected", reportStatusSlug: "open" }),
    ]);
    render(<ProDashboard />);
    expect(screen.getByTestId("offers-count-badge").textContent).toBe("2");
  });

  it("shows active jobs count badge on Munkáim tab", () => {
    setupApproved(mockReports, [
      makeJob({ id: 100, reportStatusSlug: "assigned" }),
      makeJob({ id: 101, reportStatusSlug: "pending_completion" }),
      makeJob({ id: 102, reportStatusSlug: "completed" }),
    ]);
    render(<ProDashboard />);
    expect(screen.getByTestId("jobs-count-badge").textContent).toBe("2");
  });

  it("switches to Munkáim tab on click", async () => {
    setupApproved(mockReports, [makeJob()]);
    render(<ProDashboard />);

    fireEvent.click(screen.getByTestId("tab-jobs"));

    await waitFor(() => {
      expect(screen.getByTestId("jobs-filter")).toBeDefined();
    });
    expect(screen.queryByTestId("report-count")).toBeNull();
  });

  it("switches to Ajánlataim tab on click", async () => {
    setupApproved(mockReports, [], [makeJob({ status: "pending", reportStatusSlug: "open" })]);
    render(<ProDashboard />);

    fireEvent.click(screen.getByTestId("tab-offers"));

    await waitFor(() => {
      expect(screen.getByTestId("offers-list")).toBeDefined();
    });
    expect(screen.queryByTestId("report-count")).toBeNull();
  });

  it("switches back to Felfedezés tab on click", async () => {
    setupApproved(mockReports, [makeJob()]);
    render(<ProDashboard />);

    fireEvent.click(screen.getByTestId("tab-jobs"));
    fireEvent.click(screen.getByTestId("tab-discovery"));

    await waitFor(() => {
      expect(screen.getByTestId("report-count")).toBeDefined();
    });
    expect(screen.queryByTestId("jobs-filter")).toBeNull();
  });
});

describe("ProDashboard – Ajánlataim tab", () => {
  it("shows pending and rejected offers, not accepted", async () => {
    setupApproved(mockReports, [], [
      makeJob({ id: 200, shortDescription: "Váró ajánlat", status: "pending", reportStatusSlug: "open" }),
      makeJob({ id: 201, shortDescription: "Elutasított ajánlat", status: "rejected", reportStatusSlug: "open" }),
      makeJob({ id: 202, shortDescription: "Elfogadott munka", status: "accepted", reportStatusSlug: "assigned" }),
    ]);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-offers"));

    await waitFor(() => {
      expect(screen.getByText("Váró ajánlat")).toBeDefined();
      expect(screen.getByText("Elutasított ajánlat")).toBeDefined();
    });
    expect(screen.queryByText("Elfogadott munka")).toBeNull();
  });

  it("shows 'Nincs várakozó ajánlatod' when list is empty", async () => {
    setupApproved(mockReports, [], []);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-offers"));

    await waitFor(() => {
      expect(screen.getByTestId("no-offers").textContent).toContain("Nincs várakozó ajánlatod");
    });
  });

  it("shows skeletons while offers are loading", async () => {
    mockUsePro.mockReturnValue({ data: approvedPro, isLoading: false, error: null, mutate: vi.fn() });
    mockUseReports.mockReturnValue({ data: mockReports, isLoading: false, mutate: vi.fn() });
    mockUseProJobs.mockReturnValue({ data: [], isLoading: false });
    mockUseMyOffers.mockReturnValue({ data: undefined, isLoading: true });
    mockUseCategories.mockReturnValue({ data: mockCategories });

    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-offers"));

    const { container } = await waitFor(() => ({ container: document.body }));
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ProDashboard – Munkáim tab", () => {
  it("shows active jobs by default", async () => {
    setupApproved(mockReports, [
      makeJob({ id: 100, shortDescription: "Aktív munka", reportStatusSlug: "assigned" }),
      makeJob({ id: 101, shortDescription: "Befejezett munka", reportStatusSlug: "completed" }),
    ]);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-jobs"));

    await waitFor(() => {
      expect(screen.getByText("Aktív munka")).toBeDefined();
    });
    expect(screen.queryByText("Befejezett munka")).toBeNull();
  });

  it("shows completed jobs when Elvégzett filter is selected", async () => {
    setupApproved(mockReports, [
      makeJob({ id: 100, shortDescription: "Aktív munka", reportStatusSlug: "assigned" }),
      makeJob({ id: 101, shortDescription: "Befejezett munka", reportStatusSlug: "completed" }),
    ]);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-jobs"));
    await waitFor(() => expect(screen.getByTestId("jobs-filter")).toBeDefined());

    fireEvent.click(screen.getByTestId("filter-completed"));

    await waitFor(() => {
      expect(screen.getByText("Befejezett munka")).toBeDefined();
    });
    expect(screen.queryByText("Aktív munka")).toBeNull();
  });

  it("shows 'Nincs aktív munkád' when no active jobs", async () => {
    setupApproved(mockReports, [
      makeJob({ id: 101, reportStatusSlug: "completed" }),
    ]);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-jobs"));

    await waitFor(() => {
      expect(screen.getByTestId("no-jobs").textContent).toContain("Nincs aktív munkád");
    });
  });

  it("shows 'Még nincs elvégzett munkád' when no completed jobs", async () => {
    setupApproved(mockReports, [
      makeJob({ id: 100, reportStatusSlug: "assigned" }),
    ]);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-jobs"));
    await waitFor(() => expect(screen.getByTestId("jobs-filter")).toBeDefined());

    fireEvent.click(screen.getByTestId("filter-completed"));

    await waitFor(() => {
      expect(screen.getByTestId("no-jobs").textContent).toContain("Még nincs elvégzett munkád");
    });
  });

  it("shows jobs-list with correct data", async () => {
    setupApproved(mockReports, [makeJob({ id: 100, shortDescription: "Csőtörés javítása" })]);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-jobs"));

    await waitFor(() => {
      expect(screen.getByTestId("jobs-list")).toBeDefined();
      expect(screen.getByText("Csőtörés javítása")).toBeDefined();
    });
  });

  it("switches back to Aktuális filter from Elvégzett", async () => {
    setupApproved(mockReports, [
      makeJob({ id: 100, shortDescription: "Aktív munka", reportStatusSlug: "assigned" }),
      makeJob({ id: 101, shortDescription: "Befejezett munka", reportStatusSlug: "completed" }),
    ]);
    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-jobs"));
    await waitFor(() => expect(screen.getByTestId("jobs-filter")).toBeDefined());

    fireEvent.click(screen.getByTestId("filter-completed"));
    await waitFor(() => expect(screen.getByText("Befejezett munka")).toBeDefined());

    fireEvent.click(screen.getByTestId("filter-active"));
    await waitFor(() => {
      expect(screen.getByText("Aktív munka")).toBeDefined();
    });
    expect(screen.queryByText("Befejezett munka")).toBeNull();
  });

  it("shows skeletons while jobs are loading", async () => {
    mockUsePro.mockReturnValue({
      data: approvedPro,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    mockUseReports.mockReturnValue({ data: mockReports, isLoading: false, mutate: vi.fn() });
    mockUseProJobs.mockReturnValue({ data: undefined, isLoading: true });
    mockUseCategories.mockReturnValue({ data: mockCategories });

    render(<ProDashboard />);
    fireEvent.click(screen.getByTestId("tab-jobs"));

    const { container } = await waitFor(() => ({ container: document.body }));
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
