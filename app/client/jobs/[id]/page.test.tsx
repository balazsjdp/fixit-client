import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { use } from "react";
import ClientJobDetailPage from "./page";
import { JobWithDetails, JobStatus } from "@/types/job";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, use: vi.fn() };
});

vi.mock("@/app/api/client/jobs", () => ({
  useJob: vi.fn(),
  confirmJob: vi.fn(),
  cancelJob: vi.fn(),
  submitReview: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useJob, confirmJob, cancelJob, submitReview } from "@/app/api/client/jobs";
import { toast } from "sonner";

const mockUseJob = useJob as ReturnType<typeof vi.fn>;
const mockConfirmJob = confirmJob as ReturnType<typeof vi.fn>;
const mockCancelJob = cancelJob as ReturnType<typeof vi.fn>;
const mockSubmitReview = submitReview as ReturnType<typeof vi.fn>;
const mockUse = use as ReturnType<typeof vi.fn>;

const baseJob: JobWithDetails = {
  id: 5,
  offerId: 1,
  reportId: 2,
  professionalId: 3,
  clientUserId: "uid-client",
  price: 18000,
  travelFee: 1500,
  status: JobStatus.InProgress,
  clientConfirmed: false,
  proConfirmed: false,
  createdAt: "2026-02-10T09:00:00Z",
  shortDescription: "Radiátor csere",
  categoryId: 3,
  professionalName: "Tóth Péter",
  professionalPhone: "+36201112222",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUse.mockReturnValue({ id: "5" });
});

describe("ClientJobDetailPage", () => {
  it("shows skeleton while loading", () => {
    mockUseJob.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      mutate: vi.fn(),
    });
    const { container } = render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0
    );
  });

  it("shows not found when error", () => {
    mockUseJob.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("fail"),
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.getByText("A munka nem található.")).toBeInTheDocument();
  });

  it("renders job header with professional name and phone", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.getByText("Radiátor csere")).toBeInTheDocument();
    expect(screen.getByText("Tóth Péter")).toBeInTheDocument();
    expect(screen.getByText("+36201112222")).toBeInTheDocument();
    expect(screen.getByText("Folyamatban")).toBeInTheDocument();
  });

  it("shows travel fee in price when > 0", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.getByText(/kiszállás/)).toBeInTheDocument();
  });

  it("shows confirmation status for InProgress job", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.getByText(/Visszaigazolás állapota/)).toBeInTheDocument();
    expect(screen.getByText(/Te:/)).toBeInTheDocument();
    expect(screen.getByText(/Szakember:/)).toBeInTheDocument();
  });

  it("shows confirm button when client has not confirmed", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.getByTestId("confirm-btn")).toBeInTheDocument();
  });

  it("hides confirm button when client already confirmed", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, clientConfirmed: true },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
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
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() => {
      expect(mockConfirmJob).toHaveBeenCalledWith(5);
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
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("confirm-btn"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Hiba a visszaigazolás során.");
    });
  });

  it("opens cancel dialog and enforces min 10 chars", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    const confirmBtn = screen.getByTestId("cancel-confirm-btn");
    expect(confirmBtn).toBeDisabled();
    fireEvent.change(screen.getByTestId("cancel-reason"), {
      target: { value: "Rövid" },
    });
    expect(confirmBtn).toBeDisabled();
  });

  it("enables cancel button with enough reason text", () => {
    mockUseJob.mockReturnValue({
      data: baseJob,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    fireEvent.change(screen.getByTestId("cancel-reason"), {
      target: { value: "Megváltozott a tervem ezért" },
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
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("cancel-btn"));
    const reason = "Megváltozott a tervem ezért";
    fireEvent.change(screen.getByTestId("cancel-reason"), {
      target: { value: reason },
    });
    fireEvent.click(screen.getByTestId("cancel-confirm-btn"));
    await waitFor(() => {
      expect(mockCancelJob).toHaveBeenCalledWith(5, reason);
      expect(toast.success).toHaveBeenCalledWith("Munka visszavonva.");
      expect(mutate).toHaveBeenCalled();
    });
  });

  it("does not show actions or review form for cancelled job", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Cancelled },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.queryByTestId("confirm-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cancel-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("star-rating")).not.toBeInTheDocument();
  });

  it("shows completed banner and review form for completed job", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(
      screen.getByText("Ez a munka sikeresen elvégezve.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("star-rating")).toBeInTheDocument();
    expect(screen.getByTestId("review-comment")).toBeInTheDocument();
    expect(screen.getByTestId("anonymous-checkbox")).toBeInTheDocument();
    expect(screen.getByTestId("submit-review-btn")).toBeInTheDocument();
  });

  it("submit review button disabled when no stars selected", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.getByTestId("submit-review-btn")).toBeDisabled();
  });

  it("enables submit review button when stars selected", () => {
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("star-4"));
    expect(screen.getByTestId("submit-review-btn")).not.toBeDisabled();
  });

  it("submits review with correct payload and shows success toast", async () => {
    const mutate = vi.fn();
    mockSubmitReview.mockResolvedValue(undefined);
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate,
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("star-5"));
    fireEvent.change(screen.getByTestId("review-comment"), {
      target: { value: "Kiváló munka!" },
    });
    fireEvent.click(screen.getByTestId("submit-review-btn"));
    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith(5, {
        rating: 10,
        comment: "Kiváló munka!",
        isAnonymous: false,
      });
      expect(toast.success).toHaveBeenCalledWith("Értékelés elküldve!");
    });
  });

  it("shows thank you message after review submitted", async () => {
    mockSubmitReview.mockResolvedValue(undefined);
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("star-3"));
    fireEvent.click(screen.getByTestId("submit-review-btn"));
    await waitFor(() => {
      expect(screen.getByText("Köszönjük az értékelést!")).toBeInTheDocument();
    });
  });

  it("shows anonymous checkbox and submits with isAnonymous=true", async () => {
    const mutate = vi.fn();
    mockSubmitReview.mockResolvedValue(undefined);
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate,
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("star-4"));
    fireEvent.click(screen.getByTestId("anonymous-checkbox"));
    fireEvent.click(screen.getByTestId("submit-review-btn"));
    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith(5, {
        rating: 8,
        comment: "",
        isAnonymous: true,
      });
    });
  });

  it("shows error toast on review submission failure", async () => {
    mockSubmitReview.mockRejectedValue(new Error("fail"));
    mockUseJob.mockReturnValue({
      data: { ...baseJob, status: JobStatus.Completed },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    fireEvent.click(screen.getByTestId("star-2"));
    fireEvent.click(screen.getByTestId("submit-review-btn"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Hiba az értékelés küldésekor."
      );
    });
  });

  it("shows cancellation reason for cancelled job", () => {
    mockUseJob.mockReturnValue({
      data: {
        ...baseJob,
        status: JobStatus.Cancelled,
        cancellationReason: "Munkaidő ütközés",
      },
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });
    render(
      <ClientJobDetailPage params={Promise.resolve({ id: "5" })} />
    );
    expect(screen.getByText("Munkaidő ütközés")).toBeInTheDocument();
  });
});
