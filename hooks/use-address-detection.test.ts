import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAddressDetection } from "./use-address-detection";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("@/lib/geocoding", () => ({
  reverseGeocode: vi.fn().mockResolvedValue({
    postcode: "2085",
    city: "Pilisvörösvár",
    street: "Fő út",
    houseNumber: "12",
  }),
  geocodeAddress: vi.fn().mockResolvedValue({ lat: 47.6, lng: 18.9 }),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn() },
}));

import { reverseGeocode } from "@/lib/geocoding";
const mockReverseGeocode = reverseGeocode as ReturnType<typeof vi.fn>;

// ── Helpers ──────────────────────────────────────────────────────────────────

const emptyAddress = { postcode: "", city: "", street: "", houseNumber: "" };

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useAddressDetection – initial state", () => {
  it("starts with gpsLoading=false, geocoding=false, detected=false", () => {
    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange: vi.fn(),
        onCoordsChange: vi.fn(),
        zipResolverEnabled: false,
      })
    );
    expect(result.current.gpsLoading).toBe(false);
    expect(result.current.geocoding).toBe(false);
    expect(result.current.detected).toBe(false);
  });

  it("exposes handleDetect function", () => {
    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange: vi.fn(),
        onCoordsChange: vi.fn(),
        zipResolverEnabled: false,
      })
    );
    expect(typeof result.current.handleDetect).toBe("function");
  });

  it("exposes skipNextGeocode ref", () => {
    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange: vi.fn(),
        onCoordsChange: vi.fn(),
        zipResolverEnabled: false,
      })
    );
    expect(result.current.skipNextGeocode).toBeDefined();
    expect(result.current.skipNextGeocode.current).toBe(false);
  });
});

describe("useAddressDetection – GPS detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onCoordsChange with GPS coordinates", async () => {
    setupGeolocation(47.5, 19.1);
    const onCoordsChange = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange: vi.fn(),
        onCoordsChange,
        zipResolverEnabled: false,
      })
    );

    act(() => result.current.handleDetect());

    await waitFor(() =>
      expect(onCoordsChange).toHaveBeenCalledWith({ lat: 47.5, lng: 19.1 })
    );
  });

  it("sets detected=true after successful GPS", async () => {
    setupGeolocation(47.5, 19.1);
    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange: vi.fn(),
        onCoordsChange: vi.fn().mockResolvedValue(undefined),
        zipResolverEnabled: false,
      })
    );

    act(() => result.current.handleDetect());

    await waitFor(() => expect(result.current.detected).toBe(true));
  });

  it("calls onAddressChange with reverse-geocoded address after GPS", async () => {
    setupGeolocation(47.5, 19.1);
    const onAddressChange = vi.fn();
    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange,
        onCoordsChange: vi.fn().mockResolvedValue(undefined),
        zipResolverEnabled: false,
      })
    );

    act(() => result.current.handleDetect());

    await waitFor(() =>
      expect(onAddressChange).toHaveBeenCalledWith(
        expect.objectContaining({ city: "Pilisvörösvár" })
      )
    );
  });

  it("sets skipNextGeocode=true before calling onAddressChange after GPS", async () => {
    setupGeolocation(47.5, 19.1);
    let skipWhenAddressFilled = false;

    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange: () => {
          skipWhenAddressFilled = result.current.skipNextGeocode.current;
        },
        onCoordsChange: vi.fn().mockResolvedValue(undefined),
        zipResolverEnabled: false,
      })
    );

    act(() => result.current.handleDetect());

    await waitFor(() => expect(skipWhenAddressFilled).toBe(true));
  });

  it("does not call onCoordsChange if geolocation is not supported", () => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });
    const onCoordsChange = vi.fn();
    const { result } = renderHook(() =>
      useAddressDetection({
        address: emptyAddress,
        onAddressChange: vi.fn(),
        onCoordsChange,
        zipResolverEnabled: false,
      })
    );

    act(() => result.current.handleDetect());

    expect(onCoordsChange).not.toHaveBeenCalled();
  });
});

describe("useAddressDetection – zip code resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does NOT fetch city when zipResolverEnabled=false", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({ json: async () => ({ zips: [] }) } as Response);

    renderHook(() =>
      useAddressDetection({
        address: { ...emptyAddress, postcode: "1234" },
        onAddressChange: vi.fn(),
        onCoordsChange: vi.fn(),
        zipResolverEnabled: false,
      })
    );

    await Promise.resolve();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches city when zipResolverEnabled=true and postcode has 4 chars", async () => {
    const onAddressChange = vi.fn();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ zips: [{ name: "Budapest" }] }),
    } as Response);

    renderHook(() =>
      useAddressDetection({
        address: { ...emptyAddress, postcode: "1234" },
        onAddressChange,
        onCoordsChange: vi.fn(),
        zipResolverEnabled: true,
      })
    );

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://hur.webmania.cc/zips/1234.json"
      )
    );
    await waitFor(() =>
      expect(onAddressChange).toHaveBeenCalledWith({ city: "Budapest" })
    );
  });

  it("does NOT fetch when postcode has fewer than 4 chars", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({ json: async () => ({ zips: [] }) } as Response);

    renderHook(() =>
      useAddressDetection({
        address: { ...emptyAddress, postcode: "123" },
        onAddressChange: vi.fn(),
        onCoordsChange: vi.fn(),
        zipResolverEnabled: true,
      })
    );

    await Promise.resolve();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
