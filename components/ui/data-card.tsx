import * as React from "react";
import { Calendar, ArrowRight, MapPin, Banknote, User, Wrench } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface DataCardProps {
  id: number | string;
  title: string;
  statusBadge: React.ReactNode;
  categoryBadge?: React.ReactNode;
  urgencyBadge?: React.ReactNode;
  date: string | Date;
  price?: number;
  travelFee?: number;
  location?: string;
  personName?: string;
  role?: 'pro' | 'client';
  detailsUrl: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DataCard({
  title,
  statusBadge,
  categoryBadge,
  urgencyBadge,
  date,
  price,
  travelFee,
  location,
  personName,
  role,
  detailsUrl,
  actions,
  className,
}: DataCardProps) {
  return (
    <div className={cn(
      "group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-primary/40 transition-all duration-200",
      className
    )}>
      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* Header: Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statusBadge}
          {categoryBadge}
          {urgencyBadge}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{format(new Date(date), "yyyy. MMMM d.", { locale: hu })}</span>
          </div>

          {price !== undefined && (
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Banknote className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                {price.toLocaleString("hu-HU")} Ft
                {travelFee !== undefined && travelFee > 0 && (
                  <span className="text-muted-foreground font-normal text-xs ml-1">
                    (+ {travelFee.toLocaleString("hu-HU")} Ft kiszállás)
                  </span>
                )}
              </span>
            </div>
          )}

          {personName && (
            <div className="flex items-center gap-2">
              {role === 'pro' ? (
                <User className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Wrench className="w-4 h-4 text-primary shrink-0" />
              )}
              <span className="truncate">{personName}</span>
            </div>
          )}

          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Footer: Actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {actions}
          </div>
          
          <Button variant="outline" asChild className="group/btn h-10 px-5 rounded-xl border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
            <Link href={detailsUrl} className="flex items-center gap-2 font-semibold">
              Részletek
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
