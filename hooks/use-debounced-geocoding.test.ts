import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedGeocoding } from "./use-debounced-geocoding";

vi.mock("@/lib/geocoding", () => ({
  geocodeAddress: vi.fn().mockResolvedValue({ lat: 47.5, lng: 19.0 }),
}));

vi.mock("@/lib/logger", () => ({
  default: { error: vi.fn() },
}));

import { geocodeAddress } from "@/lib/geocoding";
const mockGeocode = vi.mocked(geocodeAddress);

const emptyAddress = { postcode: "", city: "", street: "", houseNumber: "" };
const filledAddress = { postcode: "1234", city: "Budapest", street: "Fő út", houseNumber: "1" };

describe("useDebouncedGeocoding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not call geocodeAddress when all fields are empty", async () => {
    renderHook(() => useDebouncedGeocoding(emptyAddress, vi.fn()));
    vi.advanceTimersByTime(2000);
    await Promise.resolve();
    expect(mockGeocode).not.toHaveBeenCalled();
  });

  it("calls geocodeAddress after 1s debounce", async () => {
    renderHook(() => useDebouncedGeocoding(filledAddress, vi.fn()));
    expect(mockGeocode).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(mockGeocode).toHaveBeenCalledWith(filledAddress);
  });

  it("calls onSuccess with geocoded coords", async () => {
    const onSuccess = vi.fn();
    renderHook(() => useDebouncedGeocoding(filledAddress, onSuccess));
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();
    expect(onSuccess).toHaveBeenCalledWith({ lat: 47.5, lng: 19.0 });
  });

  it("geocoding state is true during debounce, false after", async () => {
    const { result } = renderHook(() => useDebouncedGeocoding(filledAddress, vi.fn()));
    expect(result.current.geocoding).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.geocoding).toBe(false);
  });

  it("skips geocoding when skipNextGeocode.current is true", async () => {
    const { result, rerender } = renderHook(
      ({ addr }) => useDebouncedGeocoding(addr, vi.fn()),
      { initialProps: { addr: emptyAddress } }
    );
    // Set flag before re-rendering with filled address
    result.current.skipNextGeocode.current = true;
    rerender({ addr: filledAddress });
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(mockGeocode).not.toHaveBeenCalled();
    // Flag should be reset after the skip
    expect(result.current.skipNextGeocode.current).toBe(false);
  });

  it("debounces – cancels previous timer on rapid changes", async () => {
    const { rerender } = renderHook(
      ({ addr }) => useDebouncedGeocoding(addr, vi.fn()),
      { initialProps: { addr: { ...emptyAddress, city: "B" } } }
    );
    vi.advanceTimersByTime(500);
    rerender({ addr: { ...emptyAddress, city: "Bu" } });
    vi.advanceTimersByTime(500);
    expect(mockGeocode).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    await Promise.resolve();
    expect(mockGeocode).toHaveBeenCalledTimes(1);
  });

  it("does not call onSuccess when geocodeAddress returns null", async () => {
    mockGeocode.mockResolvedValueOnce(null);
    const onSuccess = vi.fn();
    renderHook(() => useDebouncedGeocoding(filledAddress, onSuccess));
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
