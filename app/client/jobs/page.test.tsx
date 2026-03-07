import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MyJobsPage from "./page";
import { JobWithDetails, JobStatus } from "@/types/job";

vi.mock("@/app/api/client/jobs", () => ({
  useMyJobs: vi.fn(),
}));

import { useMyJobs } from "@/app/api/client/jobs";
const mockUseMyJobs = useMyJobs as ReturnType<typeof vi.fn>;

const sampleJob: JobWithDetails = {
  id: 2,
  offerId: 11,
  reportId: 6,
  professionalId: 4,
  clientUserId: "uid-me",
  price: 30000,
  travelFee: 0,
  status: JobStatus.Completed,
  clientConfirmed: true,
  proConfirmed: true,
  createdAt: "2026-01-10T08:00:00Z",
  shortDescription: "Villanyszerelés",
  categoryId: 2,
  professionalName: "Nagy Béla",
  professionalPhone: "+36701234567",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MyJobsPage", () => {
  it("renders page header", () => {
    mockUseMyJobs.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<MyJobsPage />);
    expect(screen.getByText("Munkáim")).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    mockUseMyJobs.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    const { container } = render(<MyJobsPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("shows error state", () => {
    mockUseMyJobs.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("fail"),
    });
    render(<MyJobsPage />);
    expect(screen.getByTestId("jobs-error")).toBeInTheDocument();
  });

  it("shows empty state when no jobs", () => {
    mockUseMyJobs.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<MyJobsPage />);
    expect(screen.getByTestId("no-jobs")).toBeInTheDocument();
  });

  it("renders job rows in table", () => {
    mockUseMyJobs.mockReturnValue({
      data: [sampleJob],
      isLoading: false,
      error: null,
    });
    render(<MyJobsPage />);
    expect(screen.getByTestId("jobs-list")).toBeInTheDocument();
    expect(screen.getByTestId("job-row-2")).toBeInTheDocument();
    expect(screen.getByText("Villanyszerelés")).toBeInTheDocument();
    expect(screen.getByText("Elvégezve")).toBeInTheDocument();
    expect(screen.getByText("Nagy Béla")).toBeInTheDocument();
  });

  it("links to client job detail page", () => {
    mockUseMyJobs.mockReturnValue({
      data: [sampleJob],
      isLoading: false,
      error: null,
    });
    render(<MyJobsPage />);
    const link = screen.getByRole("link", { name: "Villanyszerelés" });
    expect(link).toHaveAttribute("href", "/client/jobs/2");
  });
});
