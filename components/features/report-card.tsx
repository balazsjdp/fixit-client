"use client";

import { useState, ReactNode } from "react";
import { Calendar, FileText, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "./badges/category-badge";
import { UrgencyBadge } from "./badges/urgency-badge";
import { urgencyColor } from "@/lib/urgency";
import { config } from "@/app.config";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ReportCardBaseProps {
  id: number;
  shortDescription: string;
  description: string;
  urgency: number;
  filePath?: string;
  createdAt: string | Date;
  categoryLabel: string;
  statusBadges?: ReactNode;
  stats?: ReactNode;
  actions?: ReactNode;
  highlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ReportCard({
  shortDescription,
  description,
  urgency,
  filePath,
  createdAt,
  categoryLabel,
  statusBadges,
  stats,
  actions,
  highlighted = false,
  onMouseEnter,
  onMouseLeave,
}: ReportCardBaseProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const imageUrl = filePath
    ? `${config.apiBaseUrl}/${filePath}`
    : null;

  return (
    <>
      <div
        data-testid="report-card"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          "group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-200",
          highlighted
            ? "border-primary ring-1 ring-primary/10"
            : "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
        )}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Header: Category, Statuses and Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div 
                className={cn("w-2 h-2 rounded-full", urgencyColor(urgency))} 
                title="Sürgősség"
              />
              <CategoryBadge label={categoryLabel} />
              {statusBadges}
            </div>
            {stats}
          </div>

          <div className="flex gap-4">
            {/* Image Preview */}
            {imageUrl && (
              <div 
                className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-zoom-in group/img"
                onClick={() => setIsImageOpen(true)}
              >
                <img
                  src={imageUrl}
                  alt="Hiba fotója"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            {/* Content: Title & Toggle */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                {shortDescription}
              </h3>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-all"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Kevesebb részlet
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Részletek és leírás
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Expandable Description */}
          {isExpanded && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FileText className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <p className="leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Footer: Date and Actions */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(createdAt).toLocaleDateString("hu-HU", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              <UrgencyBadge urgency={urgency} />
            </div>

            <div className="flex items-center gap-2">
              {actions}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageOpen && imageUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
          onClick={() => setIsImageOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsImageOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div 
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt="Hiba fotója nagyítva"
              className="w-full h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}
    </>
  );
}
