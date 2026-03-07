import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProJobsPage from "./page";
import { JobWithDetails, JobStatus } from "@/types/job";

vi.mock("@/app/api/client/jobs", () => ({
  useProJobs: vi.fn(),
}));

import { useProJobs } from "@/app/api/client/jobs";
const mockUseProJobs = useProJobs as ReturnType<typeof vi.fn>;

const sampleJob: JobWithDetails = {
  id: 1,
  offerId: 10,
  reportId: 5,
  professionalId: 3,
  clientUserId: "uid-client-xyz",
  price: 20000,
  travelFee: 2000,
  status: JobStatus.InProgress,
  clientConfirmed: false,
  proConfirmed: false,
  createdAt: "2026-01-01T10:00:00Z",
  shortDescription: "Csöpög a csap",
  categoryId: 1,
  professionalName: "Kovács János",
  professionalPhone: "+36301234567",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProJobsPage", () => {
  it("renders page header", () => {
    mockUseProJobs.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<ProJobsPage />);
    expect(screen.getByText("Vállalt munkáim")).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    mockUseProJobs.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    const { container } = render(<ProJobsPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("shows error state", () => {
    mockUseProJobs.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("fail"),
    });
    render(<ProJobsPage />);
    expect(
      screen.getByText(/Hiba történt a munkák betöltésekor/)
    ).toBeInTheDocument();
  });

  it("shows empty state when no jobs", () => {
    mockUseProJobs.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<ProJobsPage />);
    expect(
      screen.getByText(/Még nincsenek vállalt munkáid/)
    ).toBeInTheDocument();
  });

  it("renders job rows in table", () => {
    mockUseProJobs.mockReturnValue({
      data: [sampleJob],
      isLoading: false,
      error: null,
    });
    render(<ProJobsPage />);
    expect(screen.getByTestId("job-row-1")).toBeInTheDocument();
    expect(screen.getByText("Csöpög a csap")).toBeInTheDocument();
    expect(screen.getByText("Folyamatban")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    mockUseProJobs.mockReturnValue({
      data: [sampleJob],
      isLoading: false,
      error: null,
    });
    render(<ProJobsPage />);
    expect(screen.getByText("Leírás")).toBeInTheDocument();
    expect(screen.getByText("Státusz")).toBeInTheDocument();
    expect(screen.getByText("Dátum")).toBeInTheDocument();
    expect(screen.getByText("Díj")).toBeInTheDocument();
    expect(screen.getByText("Ügyfél")).toBeInTheDocument();
  });

  it("links to job detail page", () => {
    mockUseProJobs.mockReturnValue({
      data: [sampleJob],
      isLoading: false,
      error: null,
    });
    render(<ProJobsPage />);
    const link = screen.getByRole("link", { name: "Csöpög a csap" });
    expect(link).toHaveAttribute("href", "/pro/jobs/1");
  });
});
