"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";

interface NotificationToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function NotificationToggle({
  enabled,
  onToggle,
  isLoading = false,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <div>
          <Label htmlFor="notify-email" className="text-sm font-medium">
            Email értesítők
          </Label>
          <p className="text-xs text-muted-foreground">
            {enabled ? "Bekapcsolva" : "Kikapcsolva"}
          </p>
        </div>
      </div>
      <Switch
        id="notify-email"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={isLoading}
        aria-label="Email értesítők"
      />
    </div>
  );
}
