import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavItems } from "./use-nav-items";

vi.mock("@/components/auth/KeycloakProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/app/api/client/professionals", () => ({
  useMyProfessionalProfile: vi.fn(),
}));

import { useAuth } from "@/components/auth/KeycloakProvider";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";

const mockUseAuth = vi.mocked(useAuth);
const mockUseMyProfessionalProfile = vi.mocked(useMyProfessionalProfile);

describe("useNavItems – loading state", () => {
  it("returns isLoading=true while keycloak is not ready", () => {
    mockUseAuth.mockReturnValue({ keycloak: null, isReady: false });
    mockUseMyProfessionalProfile.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);

    const { result } = renderHook(() => useNavItems());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.groups).toHaveLength(0);
  });

  it("returns isLoading=true while professional profile is loading", () => {
    mockUseAuth.mockReturnValue({
      keycloak: { hasRealmRole: () => false },
      isReady: true,
    });
    mockUseMyProfessionalProfile.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);

    const { result } = renderHook(() => useNavItems());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.groups).toHaveLength(0);
  });
});

describe("useNavItems – client user", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      keycloak: { hasRealmRole: () => false },
      isReady: true,
    });
    mockUseMyProfessionalProfile.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
  });

  it("returns a single group without label", () => {
    const { result } = renderHook(() => useNavItems());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].label).toBeUndefined();
  });

  it("returns 4 client menu items including Pro registration link", () => {
    const { result } = renderHook(() => useNavItems());
    const items = result.current.groups[0].items;
    expect(items).toHaveLength(4);
    expect(items.map((i) => i.url)).toContain("/pro/register");
    expect(items.map((i) => i.url)).toContain("/client/new");
    expect(items.map((i) => i.url)).toContain("/client/my-reports");
  });
});

describe("useNavItems – pro user", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      keycloak: { hasRealmRole: () => false },
      isReady: true,
    });
    mockUseMyProfessionalProfile.mockReturnValue({
      data: { id: 1, status: "approved" },
      isLoading: false,
    } as never);
  });

  it("returns a single group without label", () => {
    const { result } = renderHook(() => useNavItems());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].label).toBeUndefined();
  });

  it("returns 3 pro menu items including offers link, no client-only links", () => {
    const { result } = renderHook(() => useNavItems());
    const items = result.current.groups[0].items;
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.url)).toContain("/pro");
    expect(items.map((i) => i.url)).toContain("/pro/offers");
    expect(items.map((i) => i.url)).not.toContain("/client/new");
    expect(items.map((i) => i.url)).not.toContain("/pro/register");
  });

  it("also works for pending pros", () => {
    mockUseMyProfessionalProfile.mockReturnValue({
      data: { id: 2, status: "pending" },
      isLoading: false,
    } as never);

    const { result } = renderHook(() => useNavItems());
    const items = result.current.groups[0].items;
    expect(items.map((i) => i.url)).toContain("/pro");
  });
});

describe("useNavItems – admin user", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      keycloak: { hasRealmRole: (role: string) => role === "admin" },
      isReady: true,
    });
    mockUseMyProfessionalProfile.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
  });

  it("returns 3 groups with labels", () => {
    const { result } = renderHook(() => useNavItems());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.groups).toHaveLength(3);
    expect(result.current.groups.map((g) => g.label)).toEqual([
      "Ügyfél",
      "Szakember",
      "Adminisztráció",
    ]);
  });

  it("admin group contains the /admin URL", () => {
    const { result } = renderHook(() => useNavItems());
    const adminGroup = result.current.groups.find(
      (g) => g.label === "Adminisztráció"
    );
    expect(adminGroup?.items.map((i) => i.url)).toContain("/admin");
  });

  it("client group does not contain Pro registration link", () => {
    const { result } = renderHook(() => useNavItems());
    const clientGroup = result.current.groups.find((g) => g.label === "Ügyfél");
    expect(clientGroup?.items.map((i) => i.url)).not.toContain("/pro/register");
  });

  it("szakember group contains /pro and /pro/offers URLs", () => {
    const { result } = renderHook(() => useNavItems());
    const proGroup = result.current.groups.find(
      (g) => g.label === "Szakember"
    );
    expect(proGroup?.items.map((i) => i.url)).toContain("/pro");
    expect(proGroup?.items.map((i) => i.url)).toContain("/pro/offers");
  });
});
