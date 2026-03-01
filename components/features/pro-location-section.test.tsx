import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProLocationSection } from "./pro-location-section";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("@/store/config/config-store-provider", () => ({
  useConfigFromStore: vi.fn().mockReturnValue({
    featureFlags: { zipCodeResolver: false },
  }),
}));

vi.mock("@/lib/geocoding", () => ({
  reverseGeocode: vi.fn().mockResolvedValue({
    postcode: "2085",
    city: "Pilisvörösvár",
    street: "Fő út",
    houseNumber: "12",
  }),
  geocodeAddress: vi.fn().mockResolvedValue({ lat: 47.6, lng: 18.9 }),
}));

vi.mock("@/app/api/client/professionals", () => ({
  updateProLocation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn() },
}));

import { reverseGeocode, geocodeAddress } from "@/lib/geocoding";
import { updateProLocation } from "@/app/api/client/professionals";

const mockReverseGeocode = reverseGeocode as ReturnType<typeof vi.fn>;
const mockGeocodeAddress = geocodeAddress as ReturnType<typeof vi.fn>;
const mockUpdateProLocation = updateProLocation as ReturnType<typeof vi.fn>;

// ── Geolocation mock ──────────────────────────────────────────────────────────

function setupGeolocation(lat = 47.49, lng = 19.04) {
  Object.defineProperty(global.navigator, "geolocation", {
    value: {
      getCurrentPosition: vi.fn((success) =>
        success({ coords: { latitude: lat, longitude: lng } })
      ),
    },
    configurable: true,
  });
}

// ── Shared props ──────────────────────────────────────────────────────────────

const defaultProps = {
  initialLat: 47.4979,
  initialLng: 19.0402,
  onLocationChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ProLocationSection – rendering", () => {
  it("renders the section title", () => {
    render(<ProLocationSection {...defaultProps} />);
    expect(screen.getByText("Az én helyzetem")).toBeDefined();
  });

  it("renders the GPS detect button", () => {
    render(<ProLocationSection {...defaultProps} />);
    expect(screen.getByText("Helyzet automatikus meghatározása")).toBeDefined();
  });

  it("renders the save address button", () => {
    render(<ProLocationSection {...defaultProps} />);
    expect(screen.getByText("Cím mentése")).toBeDefined();
  });

  it("renders all four address input fields", () => {
    render(<ProLocationSection {...defaultProps} />);
    expect(screen.getByLabelText("Irányítószám")).toBeDefined();
    expect(screen.getByLabelText("Város")).toBeDefined();
    expect(screen.getByLabelText("Közterület neve")).toBeDefined();
    expect(screen.getByLabelText("Házszám")).toBeDefined();
  });

  it("fills address fields from reverseGeocode on mount", async () => {
    render(<ProLocationSection {...defaultProps} />);
    await waitFor(() => {
      expect((screen.getByLabelText("Irányítószám") as HTMLInputElement).value).toBe("2085");
      expect((screen.getByLabelText("Város") as HTMLInputElement).value).toBe("Pilisvörösvár");
      expect((screen.getByLabelText("Közterület neve") as HTMLInputElement).value).toBe("Fő út");
      expect((screen.getByLabelText("Házszám") as HTMLInputElement).value).toBe("12");
    });
  });

  it("save button is disabled when no city and no postcode", async () => {
    mockReverseGeocode.mockResolvedValueOnce(null);
    render(<ProLocationSection {...defaultProps} />);
    await waitFor(() => {
      const saveBtn = screen.getByText("Cím mentése").closest("button");
      expect(saveBtn?.disabled).toBe(true);
    });
  });
});

describe("ProLocationSection – address input", () => {
  it("updates a field when user types", async () => {
    render(<ProLocationSection {...defaultProps} />);
    await waitFor(() =>
      expect((screen.getByLabelText("Irányítószám") as HTMLInputElement).value).toBe("2085")
    );

    fireEvent.change(screen.getByLabelText("Irányítószám"), {
      target: { name: "postcode", value: "1234" },
    });
    expect((screen.getByLabelText("Irányítószám") as HTMLInputElement).value).toBe("1234");
  });

  it("calls geocodeAddress and updateProLocation when save clicked", async () => {
    render(<ProLocationSection {...defaultProps} />);
    await waitFor(() =>
      expect((screen.getByLabelText("Város") as HTMLInputElement).value).toBe("Pilisvörösvár")
    );

    fireEvent.click(screen.getByText("Cím mentése"));

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalled();
      expect(mockUpdateProLocation).toHaveBeenCalledWith(47.6, 18.9);
    });
  });

  it("calls onLocationChange after save address succeeds", async () => {
    const onLocationChange = vi.fn();
    render(<ProLocationSection {...defaultProps} onLocationChange={onLocationChange} />);
    await waitFor(() =>
      expect((screen.getByLabelText("Város") as HTMLInputElement).value).toBe("Pilisvörösvár")
    );

    fireEvent.click(screen.getByText("Cím mentése"));

    await waitFor(() => {
      expect(onLocationChange).toHaveBeenCalledWith(47.6, 18.9);
    });
  });

  it("shows 'Helyzet rögzítve' after save address succeeds", async () => {
    render(<ProLocationSection {...defaultProps} />);
    await waitFor(() =>
      expect((screen.getByLabelText("Város") as HTMLInputElement).value).toBe("Pilisvörösvár")
    );

    fireEvent.click(screen.getByText("Cím mentése"));

    await waitFor(() => {
      expect(screen.getByText("Helyzet rögzítve")).toBeDefined();
    });
  });
});

describe("ProLocationSection – GPS detection", () => {
  it("calls updateProLocation and onLocationChange with GPS coordinates", async () => {
    setupGeolocation(47.5, 19.1);
    const onLocationChange = vi.fn();
    render(<ProLocationSection {...defaultProps} onLocationChange={onLocationChange} />);

    fireEvent.click(screen.getByText("Helyzet automatikus meghatározása"));

    await waitFor(() => {
      expect(mockUpdateProLocation).toHaveBeenCalledWith(47.5, 19.1);
      expect(onLocationChange).toHaveBeenCalledWith(47.5, 19.1);
    });
  });

  it("shows 'Helyzet rögzítve' after GPS detection", async () => {
    setupGeolocation(47.5, 19.1);
    render(<ProLocationSection {...defaultProps} />);

    fireEvent.click(screen.getByText("Helyzet automatikus meghatározása"));

    await waitFor(() => {
      expect(screen.getByText("Helyzet rögzítve")).toBeDefined();
    });
  });

  it("fills address fields after GPS detection via reverseGeocode", async () => {
    setupGeolocation(47.5, 19.1);
    mockReverseGeocode
      .mockResolvedValueOnce({ postcode: "2085", city: "Pilisvörösvár", street: "Fő út", houseNumber: "12" })
      .mockResolvedValueOnce({ postcode: "1001", city: "Budapest", street: "Váci út", houseNumber: "1" });

    render(<ProLocationSection {...defaultProps} />);
    await waitFor(() =>
      expect((screen.getByLabelText("Város") as HTMLInputElement).value).toBe("Pilisvörösvár")
    );

    fireEvent.click(screen.getByText("Helyzet automatikus meghatározása"));

    await waitFor(() => {
      expect((screen.getByLabelText("Város") as HTMLInputElement).value).toBe("Budapest");
    });
  });
});
