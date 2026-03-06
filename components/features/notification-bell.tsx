"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import { markNotificationsRead } from "@/app/api/client/notifications";
import { useNotifications } from "@/app/api/client/use-notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/types/notification";

function getNotificationRoute(n: Notification): string | null {
  switch (n.type) {
    case "offer_accepted":
      return "/pro/offers";
    case "new_report":
      return "/pro";
    case "new_offer": {
      const reportId = n.payload?.reportId;
      return reportId
        ? `/client/my-reports/${reportId}`
        : "/client/my-reports";
    }
    default:
      return null;
  }
}

export function NotificationBell() {
  const { data: notifications, mutate } = useNotifications();
  const router = useRouter();

  const items = notifications ?? [];
  const unreadCount = items.filter((n) => !n.readAt).length;

  const handleOpenChange = async (open: boolean) => {
    if (open && unreadCount > 0) {
      await markNotificationsRead();
      mutate();
    }
  };

  const handleItemClick = (n: Notification) => {
    const route = getNotificationRoute(n);
    if (route) router.push(route);
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Értesítések"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              data-testid="notification-badge"
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto p-0">
        <div className="flex items-center px-4 py-3 border-b">
          <span className="font-semibold text-sm">Értesítések</span>
        </div>
        {items.length === 0 ? (
          <p
            data-testid="no-notifications"
            className="px-4 py-8 text-center text-sm text-muted-foreground"
          >
            Nincsenek értesítések
          </p>
        ) : (
          <ul>
            {items.map((n) => (
              <li
                key={n.id}
                data-testid={`notification-item-${n.id}`}
                onClick={() => handleItemClick(n)}
                className={`px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-accent transition-colors ${
                  !n.readAt ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleDateString("hu-HU")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
