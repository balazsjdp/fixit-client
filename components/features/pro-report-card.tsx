"use client";

import { Calendar, Navigation } from "lucide-react";
import { ProReport } from "@/types/report";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { urgencyLabel, urgencyColor } from "@/lib/urgency";
import { UrgencyBadge } from "../ui/urgency-badge";

interface ProReportCardProps {
  report: ProReport;
  category: Category | undefined;
  highlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onOffer?: (reportId: number) => void;
}

export function ProReportCard({
  report,
  category,
  highlighted = false,
  onMouseEnter,
  onMouseLeave,
  onOffer,
}: ProReportCardProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all cursor-default",
        highlighted
          ? "border-primary shadow-md shadow-primary/10"
          : "border-slate-200 dark:border-slate-800 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 w-2.5 h-2.5 rounded-full shrink-0",
            urgencyColor(report.urgency)
          )}
          aria-label={urgencyLabel(report.urgency)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wide">
              {category?.label ?? "Ismeretlen kategória"}
            </span>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {report.distanceKm.toFixed(1)} km
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
            {report.description}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(report.createdAt).toLocaleDateString("hu-HU", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={report.urgency} />
              {onOffer && (
                <Button
                  className="h-7 rounded-full text-xs px-2 bg-primary cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOffer(report.id);
                  }}
                  data-testid={`offer-btn-${report.id}`}
                >
                  Ajánlatot adok
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
