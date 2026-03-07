import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { use } from "react";
import ProJobDetailPage from "./page";
import { JobWithDetails, JobStatus } from "@/types/job";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, use: vi.fn() };
});

vi.mock("@/app/api/client/jobs", () => ({
  useJob: vi.fn(),
  confirmJob: vi.fn(),
  cancelJob: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useJob, confirmJob, cancelJob } from "@/app/api/client/jobs";
import { toast } from "sonner";

const mockUseJob = useJob as ReturnType<typeof vi.fn>;
const mockConfirmJob = confirmJob as ReturnType<typeof vi.fn>;
const mockCancelJob = cancelJob as ReturnType<typeof vi.fn>;
const mockUse = use as ReturnType<typeof vi.fn>;

const baseJob: JobWithDetails = {
  id: 7,
  offerId: 2,
  reportId: 3,
  professionalId: 4,
  clientUserId: "abcd-1234-efgh-5678",
  price: 25000,
  travelFee: 0,
  status: JobStatus.InProgress,
  clientConfirmed: false,
  proConfirmed: false,
  createdAt: "2026-01-15T10:00:00Z",
  shortDescription: "Csapcsere",
  categoryId: 1,
  professionalName: "Kovács János",
  professionalPhone: "+36301234567",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUse.mockReturnValue({ id: "7" });
});

describe("ProJobDetailPage", () => {
  it("shows skeleton while loading", () => {
    mockUseJob.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      mutate: vi.fn(),
    });
    const { container } = render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("shows not found when error", () => {
    mockUseJob.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("not found"),
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(screen.getByText("A munka nem található.")).toBeInTheDocument();
  });

  it("renders job header details", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(screen.getByText("Csapcsere")).toBeInTheDocument();
    expect(screen.getByText("Folyamatban")).toBeInTheDocument();
    expect(screen.getByText(/25.000/)).toBeInTheDocument();
  });

  it("shows confirmation status panel for InProgress", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(screen.getByText(/Visszaigazolás állapota/)).toBeInTheDocument();
    expect(screen.getByText(/Te:/)).toBeInTheDocument();
    expect(screen.getByText(/Ügyfél:/)).toBeInTheDocument();
  });

  it("shows confirm button when not yet confirmed", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, proConfirmed: false },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(screen.getByTestId("confirm-btn")).toBeInTheDocument();
  });

  it("hides confirm button when already confirmed", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, proConfirmed: true },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(screen.queryByTestId("confirm-btn")).not.toBeInTheDocument();
  });

  it("calls confirmJob and shows success toast", async () => {
    const mutate = vi.fn();
    mockConfirmJob.mockResolvedValue({});
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate,
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() => {
      expect(mockConfirmJob).toHaveBeenCalledWith(7);
      expect(toast.success).toHaveBeenCalledWith("Munka visszaigazolva!");
      expect(mutate).toHaveBeenCalled();
    });
  });

  it("shows error toast when confirmJob fails", async () => {
    mockConfirmJob.mockRejectedValue(new Error("fail"));
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Hiba a visszaigazolás során.");
    });
  });

  it("shows cancel button and opens dialog", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    expect(screen.getByTestId("cancel-reason")).toBeInTheDocument();
  });

  it("disables cancel confirm button when reason is too short", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    const confirmBtn = screen.getByTestId("cancel-confirm-btn");
    expect(confirmBtn).toBeDisabled();
    fireEvent.change(screen.getByTestId("cancel-reason"), {
      target: { value: "Rövid" },
    });
    expect(confirmBtn).toBeDisabled();
  });

  it("enables cancel confirm button when reason is long enough", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    fireEvent.change(screen.getByTestId("cancel-reason"), {
      target: { value: "Ez egy elég hosszú visszavonási ok" },
    });
    expect(screen.getByTestId("cancel-confirm-btn")).not.toBeDisabled();
  });

  it("calls cancelJob with reason and shows success toast", async () => {
    const mutate = vi.fn();
    mockCancelJob.mockResolvedValue(undefined);
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate,
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    const reason = "Ez egy elég hosszú visszavonási ok";
    fireEvent.change(screen.getByTestId("cancel-reason"), {
      target: { value: reason },
    });
    fireEvent.click(screen.getByTestId("cancel-confirm-btn"));
    await waitFor(() => {
      expect(mockCancelJob).toHaveBeenCalledWith(7, reason);
      expect(toast.success).toHaveBeenCalledWith("Munka visszavonva.");
      expect(mutate).toHaveBeenCalled();
    });
  });

  it("shows 409 conflict error on cancel", async () => {
    const err = Object.assign(new Error("conflict"), {
      isAxiosError: true,
      response: { status: 409 },
    });
    mockCancelJob.mockRejectedValue(err);
    // Make isAxiosError return true
    vi.mock("axios", () => ({ isAxiosError: (e: unknown) => !!(e as { isAxiosError?: boolean }).isAxiosError }));
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    fireEvent.change(screen.getByTestId("cancel-reason"), {
      target: { value: "Egy elég hosszú visszavonási ok szöveg" },
    });
    fireEvent.click(screen.getByTestId("cancel-confirm-btn"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("shows completed banner for completed job", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(
      screen.getByText("Ez a munka sikeresen elvégezve.")
    ).toBeInTheDocument();
  });

  it("shows cancellation reason for cancelled job", () => {
    mockUseJob.mockReturnValue({
      data: {
        ...baseJob,
        status: JobStatus.Cancelled,
        cancellationReason: "Nem tudtam menni",
      },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(screen.getByText("Nem tudtam menni")).toBeInTheDocument();
  });

  it("does not show actions for completed job", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ProJobDetailPage params={Promise.resolve({ id: "7" })} />
    );
    expect(screen.queryByTestId("confirm-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cancel-btn")).not.toBeInTheDocument();
  });
});
