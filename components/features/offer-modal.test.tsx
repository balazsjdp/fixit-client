import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OfferModal } from "./offer-modal";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/app/api/client/offers", () => ({
  submitOffer: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock axios so isAxiosError works predictably in jsdom
vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    isAxiosError: (e: unknown): boolean =>
      typeof e === "object" &&
      e !== null &&
      (e as Record<string, unknown>).isAxiosError === true,
  };
});

import { submitOffer } from "@/app/api/client/offers";
import { toast } from "sonner";

const mockSubmitOffer = submitOffer as ReturnType<typeof vi.fn>;
const mockToast = toast as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function renderModal(
  overrides: Partial<React.ComponentProps<typeof OfferModal>> = {}
) {
  const props = {
    reportId: 42,
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
  return { ...render(<OfferModal {...props} />), props };
}

function makeAxiosError(status: number) {
  return Object.assign(new Error("AxiosError"), {
    isAxiosError: true,
    response: { status },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("OfferModal – initial render", () => {
  it("renders the modal title", () => {
    renderModal();
    expect(screen.getByText("Ajánlatot adok")).toBeDefined();
  });

  it("renders the form inputs", () => {
    renderModal();
    expect(screen.getByTestId("input-estimated-price")).toBeDefined();
    expect(screen.getByTestId("input-travel-fee")).toBeDefined();
  });

  it("renders the submit button", () => {
    renderModal();
    expect(screen.getByTestId("submit-offer-btn")).toBeDefined();
  });

  it("renders the cancel button with Mégsem text", () => {
    renderModal();
    expect(screen.getByText("Mégsem")).toBeDefined();
  });

  it("does not render when open=false", () => {
    renderModal({ open: false });
    expect(screen.queryByText("Ajánlatot adok")).toBeNull();
  });
});

describe("OfferModal – form validation", () => {
  it("shows error toast when estimated price is empty", async () => {
    renderModal();
    fireEvent.click(screen.getByTestId("submit-offer-btn"));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("becsült munkadíjat")
      );
    });
    expect(mockSubmitOffer).not.toHaveBeenCalled();
  });

  it("shows error toast when estimated price is zero", async () => {
    renderModal();
    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("becsült munkadíjat")
      );
    });
  });

  it("shows error toast when travel fee is negative", async () => {
    renderModal();
    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "10000" },
    });
    fireEvent.change(screen.getByTestId("input-travel-fee"), {
      target: { value: "-100" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("negatív")
      );
    });
  });
});

describe("OfferModal – successful submission", () => {
  it("calls submitOffer with correct arguments", async () => {
    mockSubmitOffer.mockResolvedValue({ id: 1, message: "ok" });
    const { props } = renderModal();

    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "15000" },
    });
    fireEvent.change(screen.getByTestId("input-travel-fee"), {
      target: { value: "3000" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));

    await waitFor(() => {
      expect(mockSubmitOffer).toHaveBeenCalledWith(42, {
        estimatedPrice: 15000,
        travelFee: 3000,
      });
    });
    expect(mockToast.success).toHaveBeenCalled();
    expect(props.onSuccess).toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("defaults travel fee to 0 when left empty", async () => {
    mockSubmitOffer.mockResolvedValue({ id: 2, message: "ok" });
    renderModal();

    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "8000" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));

    await waitFor(() => {
      expect(mockSubmitOffer).toHaveBeenCalledWith(42, {
        estimatedPrice: 8000,
        travelFee: 0,
      });
    });
  });
});

describe("OfferModal – error handling", () => {
  it("shows duplicate offer error on 409 response and switches to readonly", async () => {
    mockSubmitOffer.mockRejectedValue(makeAxiosError(409));
    renderModal();

    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Már adtál ajánlatot erre a bejelentésre."
      );
    });
  });

  it("shows forbidden error on 403 response", async () => {
    mockSubmitOffer.mockRejectedValue(makeAxiosError(403));
    renderModal();

    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Csak jóváhagyott szakemberek adhatnak ajánlatot."
      );
    });
  });

  it("shows generic axios error on other status codes", async () => {
    mockSubmitOffer.mockRejectedValue(makeAxiosError(500));
    renderModal();

    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Hiba az ajánlat beküldése során. Próbáld újra."
      );
    });
  });

  it("shows generic error on non-axios failure", async () => {
    mockSubmitOffer.mockRejectedValue(new Error("Network error"));
    renderModal();

    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Hiba az ajánlat beküldése során. Próbáld újra."
      );
    });
  });
});

describe("OfferModal – readonly mode after successful submission", () => {
  it("calls onOpenChange(false) and onSuccess after successful submit", async () => {
    mockSubmitOffer.mockResolvedValue({ id: 3, message: "ok" });
    const { props } = renderModal();

    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "20000" },
    });
    fireEvent.change(screen.getByTestId("input-travel-fee"), {
      target: { value: "5000" },
    });
    fireEvent.click(screen.getByTestId("submit-offer-btn"));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Ajánlat sikeresen beküldve!"
      );
      expect(props.onOpenChange).toHaveBeenCalledWith(false);
      expect(props.onSuccess).toHaveBeenCalled();
    });
  });
});

describe("OfferModal – handleOpenChange (close without submitting)", () => {
  it("calls onOpenChange when cancel button is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <OfferModal
        reportId={42}
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Mégsem"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("resets form inputs when the modal is re-opened after closing", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <OfferModal
        reportId={42}
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={vi.fn()}
      />
    );

    // Type into the form
    fireEvent.change(screen.getByTestId("input-estimated-price"), {
      target: { value: "12000" },
    });
    expect(
      (screen.getByTestId("input-estimated-price") as HTMLInputElement).value
    ).toBe("12000");

    // Simulate closing and re-opening (parent controls open prop)
    rerender(
      <OfferModal
        reportId={42}
        open={false}
        onOpenChange={onOpenChange}
        onSuccess={vi.fn()}
      />
    );
    rerender(
      <OfferModal
        reportId={42}
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={vi.fn()}
      />
    );

    // Inputs should be reset
    expect(
      (screen.getByTestId("input-estimated-price") as HTMLInputElement).value
    ).toBe("");
  });
});
