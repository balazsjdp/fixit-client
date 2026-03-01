import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import MyReports from "./page";
import { MyReport } from "@/types/report";
import { Category } from "@/types/category";

vi.mock("@/app/api/client/use-my-reports", () => ({
  useMyReports: vi.fn(),
}));

vi.mock("@/app/api/client/categories", () => ({
  useCategories: vi.fn(),
}));

vi.mock("@/app/api/client/reports", () => ({
  deleteReport: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/app.config", () => ({
  config: { apiBaseUrl: "http://localhost:8080" },
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn(), info: vi.fn() },
}));

import { useMyReports } from "@/app/api/client/use-my-reports";
import { useCategories } from "@/app/api/client/categories";
import { deleteReport } from "@/app/api/client/reports";
import { toast } from "sonner";

const mockUseMyReports = useMyReports as ReturnType<typeof vi.fn>;
const mockUseCategories = useCategories as ReturnType<typeof vi.fn>;
const mockDeleteReport = deleteReport as ReturnType<typeof vi.fn>;
const mockToast = toast as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};
const mockMutate = vi.fn();

const mockCategories: Category[] = [
  { id: "1", label: "Vízvezeték", icon: "wrench" },
  { id: "2", label: "Villamosság", icon: "zap" },
];

const mockReports: MyReport[] = [
  {
    id: 1,
    categoryId: 1,
    description: "Csöpögő csap a konyhában",
    urgency: 50,
    filePath: "",
    offerCount: 2,
    hasAccepted: false,
    createdAt: "2024-03-12T10:00:00Z",
  },
  {
    id: 2,
    categoryId: 2,
    description: "Nem működik a kapcsoló",
    urgency: 0,
    filePath: "",
    offerCount: 0,
    hasAccepted: true,
    createdAt: "2024-03-01T08:00:00Z",
  },
];

function setup(
  reports: MyReport[] = mockReports,
  isLoading = false,
  error: Error | null = null
) {
  mockUseMyReports.mockReturnValue({
    data: reports,
    isLoading,
    error,
    mutate: mockMutate,
  });
  mockUseCategories.mockReturnValue({ data: mockCategories });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MyReports page – header", () => {
  it("renders the page heading", () => {
    setup();
    render(<MyReports />);
    expect(screen.getByText("Bejelentett hibáim")).toBeDefined();
  });

  it("renders the subtitle", () => {
    setup();
    render(<MyReports />);
    expect(screen.getByText(/Kövesse nyomon/)).toBeDefined();
  });

  it('renders "Új hiba bejelentése" link to /client/new', () => {
    setup();
    render(<MyReports />);
    const link = screen.getByText("Új hiba bejelentése").closest("a");
    expect(link?.getAttribute("href")).toBe("/client/new");
  });
});

describe("MyReports page – loading and error states", () => {
  it("shows loading skeletons while loading", () => {
    setup([], true);
    const { container } = render(<MyReports />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows error message when fetch fails", () => {
    setup([], false, new Error("Network error"));
    render(<MyReports />);
    expect(screen.getByText(/Hiba a bejelentések/)).toBeDefined();
  });

  it("shows empty state when no reports", () => {
    setup([]);
    render(<MyReports />);
    expect(screen.getByText(/Még nincs bejelentett hibája/)).toBeDefined();
  });
});

describe("MyReports page – report cards", () => {
  it("renders report descriptions", () => {
    setup();
    render(<MyReports />);
    expect(screen.getByText("Csöpögő csap a konyhában")).toBeDefined();
    expect(screen.getByText("Nem működik a kapcsoló")).toBeDefined();
  });

  it("resolves and renders category labels", () => {
    setup();
    render(<MyReports />);
    expect(screen.getByText("Vízvezeték")).toBeDefined();
    expect(screen.getByText("Villamosság")).toBeDefined();
  });

  it('shows "Ismeretlen" for unknown category', () => {
    const reportsWithUnknownCat: MyReport[] = [
      { ...mockReports[0], categoryId: 99 },
    ];
    setup(reportsWithUnknownCat);
    render(<MyReports />);
    expect(screen.getByText("Ismeretlen")).toBeDefined();
  });

  it('renders "Folyamatban" badge for non-accepted reports', () => {
    setup();
    render(<MyReports />);
    expect(screen.getByText("Folyamatban")).toBeDefined();
  });

  it('renders "Lezárva" badge for accepted reports', () => {
    setup();
    render(<MyReports />);
    expect(screen.getByText("Lezárva")).toBeDefined();
  });

  it("renders offer count for reports with offers", () => {
    setup();
    render(<MyReports />);
    expect(screen.getByText("2 ajánlat")).toBeDefined();
  });

  it("does not render offer count for reports with zero offers", () => {
    setup([mockReports[1]]);
    render(<MyReports />);
    expect(screen.queryByText(/ajánlat/)).toBeNull();
  });
});

describe("MyReports page – edit and delete buttons", () => {
  it("shows edit and delete buttons only for non-accepted reports", () => {
    setup();
    render(<MyReports />);
    const editButtons = screen.getAllByRole("button", { name: "Szerkesztés" });
    expect(editButtons).toHaveLength(1);
    const deleteButtons = screen.getAllByRole("button", { name: "Törlés" });
    expect(deleteButtons).toHaveLength(1);
  });

  it("edit button links to the correct edit route", () => {
    setup([mockReports[0]]);
    render(<MyReports />);
    const editLink = screen
      .getByRole("button", { name: "Szerkesztés" })
      .closest("a");
    expect(editLink?.getAttribute("href")).toBe("/client/my-reports/1/edit");
  });

  it("always shows the details button", () => {
    setup();
    render(<MyReports />);
    const detailButtons = screen.getAllByRole("button", { name: "Részletek" });
    expect(detailButtons).toHaveLength(2);
  });
});

describe("MyReports page – image thumbnail", () => {
  it("renders an image when filePath is set", () => {
    const reportWithImage: MyReport[] = [
      { ...mockReports[0], filePath: "uploads/test.jpg" },
    ];
    setup(reportWithImage);
    render(<MyReports />);
    const img = screen.getByAltText("Hiba fotója") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.src).toContain("uploads/test.jpg");
  });

  it("renders placeholder icon when filePath is empty", () => {
    const reportNoImage: MyReport[] = [
      { ...mockReports[0], filePath: "" },
    ];
    setup(reportNoImage);
    const { container } = render(<MyReports />);
    expect(screen.queryByAltText("Hiba fotója")).toBeNull();
    // The placeholder container should be present
    expect(container.querySelector(".rounded-xl")).toBeDefined();
  });
});

describe("MyReports page – delete flow", () => {
  it("opens confirmation dialog on delete button click", () => {
    setup([mockReports[0]]);
    render(<MyReports />);
    fireEvent.click(screen.getByRole("button", { name: "Törlés" }));
    expect(screen.getByText("Biztosan törli a bejelentést?")).toBeDefined();
  });

  it("does not delete when Mégsem is clicked", async () => {
    setup([mockReports[0]]);
    render(<MyReports />);
    fireEvent.click(screen.getByRole("button", { name: "Törlés" }));
    fireEvent.click(screen.getByText("Mégsem"));
    await waitFor(() => {
      expect(mockDeleteReport).not.toHaveBeenCalled();
    });
  });

  it("calls deleteReport and shows success toast on confirm", async () => {
    mockDeleteReport.mockResolvedValue({});
    setup([mockReports[0]]);
    render(<MyReports />);

    fireEvent.click(screen.getByRole("button", { name: "Törlés" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(mockDeleteReport).toHaveBeenCalledWith(1);
      expect(mockToast.success).toHaveBeenCalledWith(
        "Bejelentés sikeresen törölve!"
      );
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it("shows error toast when deletion fails", async () => {
    mockDeleteReport.mockRejectedValue(new Error("server error"));
    setup([mockReports[0]]);
    render(<MyReports />);

    fireEvent.click(screen.getByRole("button", { name: "Törlés" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Hiba a törlés során!");
    });
  });
});
