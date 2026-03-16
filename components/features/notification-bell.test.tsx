import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationBell } from "./notification-bell";
import { Notification } from "@/types/notification";

vi.mock("@/app/api/client/use-notifications");
vi.mock("@/app/api/client/notifications");

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Radix DropdownMenu doesn't open properly in jsdom – use a simple controlled mock
vi.mock("@/components/ui/dropdown-menu", () => {
  const React = require("react");
  function DropdownMenu({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) {
    const [open, setOpen] = React.useState(false);
    const toggle = () => {
      const next = !open;
      setOpen(next);
      onOpenChange?.(next);
    };
    return React.createElement(
      "div",
      null,
      React.Children.map(children, (child: React.ReactElement) =>
        React.cloneElement(child, { __open: open, __toggle: toggle })
      )
    );
  }
  function DropdownMenuTrigger({
    children,
    asChild,
    __toggle,
  }: {
    children: React.ReactElement;
    asChild?: boolean;
    __toggle?: () => void;
  }) {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick: __toggle });
    }
    return React.createElement("button", { onClick: __toggle }, children);
  }
  function DropdownMenuContent({
    children,
    __open,
  }: {
    children: React.ReactNode;
    __open?: boolean;
  }) {
    if (!__open) return null;
    return React.createElement("div", null, children);
  }
  return { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent };
});

import { useNotifications } from "@/app/api/client/use-notifications";
import { markNotificationsRead } from "@/app/api/client/notifications";

const mockUseNotifications = vi.mocked(useNotifications);
const mockMarkRead = vi.mocked(markNotificationsRead);

const makeNotification = (
  overrides: Partial<Notification> = {}
): Notification => ({
  id: 1,
  userId: "user-1",
  title: "Test Title",
  message: "Test message",
  type: "offer_accepted",
  createdAt: "2024-01-15T10:00:00Z",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockMarkRead.mockResolvedValue(undefined);
});

describe("NotificationBell", () => {
  it("renders the bell button", () => {
    mockUseNotifications.mockReturnValue({
      data: [],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    expect(screen.getByRole("button", { name: "Értesítések" })).toBeInTheDocument();
  });

  it("does not show badge when there are no notifications", () => {
    mockUseNotifications.mockReturnValue({
      data: [],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
  });

  it("does not show badge when all notifications are read", () => {
    mockUseNotifications.mockReturnValue({
      data: [makeNotification({ readAt: "2024-01-15T11:00:00Z" })],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
  });

  it("shows badge with unread count", () => {
    mockUseNotifications.mockReturnValue({
      data: [
        makeNotification({ id: 1 }),
        makeNotification({ id: 2 }),
        makeNotification({ id: 3, readAt: "2024-01-15T11:00:00Z" }),
      ],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    expect(screen.getByTestId("notification-badge")).toHaveTextContent("2");
  });

  it("shows 9+ when unread count exceeds 9", () => {
    const notifications = Array.from({ length: 10 }, (_, i) =>
      makeNotification({ id: i + 1 })
    );
    mockUseNotifications.mockReturnValue({
      data: notifications,
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    expect(screen.getByTestId("notification-badge")).toHaveTextContent("9+");
  });

  it("shows 'Nincsenek értesítések' when list is empty after opening", async () => {
    mockUseNotifications.mockReturnValue({
      data: [],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: "Értesítések" }));

    await waitFor(() => {
      expect(screen.getByTestId("no-notifications")).toBeInTheDocument();
    });
  });

  it("shows notification items when list has data", async () => {
    mockUseNotifications.mockReturnValue({
      data: [makeNotification({ id: 1, title: "Ajánlat elfogadva" })],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: "Értesítések" }));

    await waitFor(() => {
      expect(screen.getByTestId("notification-item-1")).toBeInTheDocument();
      expect(screen.getByText("Ajánlat elfogadva")).toBeInTheDocument();
    });
  });

  it("calls markNotificationsRead when opened with unread notifications", async () => {
    const mutate = vi.fn();
    mockUseNotifications.mockReturnValue({
      data: [makeNotification({ id: 1 })],
      mutate,
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: "Értesítések" }));

    await waitFor(() => {
      expect(mockMarkRead).toHaveBeenCalledOnce();
      expect(mutate).toHaveBeenCalled();
    });
  });

  it("does not call markNotificationsRead when no unread notifications", async () => {
    mockUseNotifications.mockReturnValue({
      data: [makeNotification({ readAt: "2024-01-15T11:00:00Z" })],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: "Értesítések" }));

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
    expect(mockMarkRead).not.toHaveBeenCalled();
  });

  it("handles undefined data gracefully", () => {
    mockUseNotifications.mockReturnValue({
      data: undefined,
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
  });
});

describe("notification routing", () => {
  beforeEach(() => {
    mockMarkRead.mockResolvedValue(undefined);
  });

  const openAndClickItem = async (notification: Notification) => {
    mockUseNotifications.mockReturnValue({
      data: [notification],
      mutate: vi.fn(),
    } as ReturnType<typeof useNotifications>);

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole("button", { name: "Értesítések" }));
    await waitFor(() =>
      expect(screen.getByTestId(`notification-item-${notification.id}`)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId(`notification-item-${notification.id}`));
  };

  it("navigates to /pro for offer_accepted", async () => {
    await openAndClickItem(makeNotification({ type: "offer_accepted" }));
    expect(mockPush).toHaveBeenCalledWith("/pro");
  });

  it("navigates to /pro for new_report", async () => {
    await openAndClickItem(makeNotification({ type: "new_report" }));
    expect(mockPush).toHaveBeenCalledWith("/pro");
  });

  it("navigates to specific report for new_offer with reportId", async () => {
    await openAndClickItem(
      makeNotification({ type: "new_offer", payload: { reportId: 42 } })
    );
    expect(mockPush).toHaveBeenCalledWith("/reports/42");
  });

  it("navigates to /client/my-reports for new_offer without reportId", async () => {
    await openAndClickItem(makeNotification({ type: "new_offer" }));
    expect(mockPush).toHaveBeenCalledWith("/client/my-reports");
  });

  it("does not navigate for credit_deducted", async () => {
    await openAndClickItem(makeNotification({ type: "credit_deducted" }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
