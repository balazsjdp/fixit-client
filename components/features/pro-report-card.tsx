"use client";

import { Navigation, ArrowRight } from "lucide-react";
import { ProReport } from "@/types/report";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { ReportCard } from "./report-card";

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
    <ReportCard
      id={report.id}
      shortDescription={report.shortDescription}
      description={report.description}
      urgency={report.urgency}
      filePath={report.filePath}
      createdAt={report.createdAt}
      categoryLabel={category?.label ?? "Ismeretlen"}
      highlighted={highlighted}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      stats={
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg">
          <Navigation className="w-3.5 h-3.5" />
          {report.distanceKm.toFixed(1)} km
        </div>
      }
      actions={
        onOffer && (
          <Button
            size="sm"
            variant="default"
            className="h-9 px-4 rounded-lg font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 group/btn"
            onClick={(e) => {
              e.stopPropagation();
              onOffer(report.id);
            }}
            data-testid={`offer-btn-${report.id}`}
          >
            Ajánlat
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        )
      }
    />
  );
}
