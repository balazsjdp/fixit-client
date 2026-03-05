"use client";

import { Star } from "lucide-react";
import { Badge as BadgeType } from "@/types/offer";
import { ProfessionalBadges } from "./badges/professional-badges";

interface ProfessionalCardProps {
  name: string;
  avgRating: number;
  ratingCount: number;
  badges: BadgeType[];
}

export function ProfessionalCard({
  name,
  avgRating,
  ratingCount,
  badges,
}: ProfessionalCardProps) {
  return (
    <div>
      <p className="font-bold text-slate-900 dark:text-white mb-1">{name}</p>

      <div className="flex items-center gap-1 mb-2" data-testid="rating">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-semibold">{(avgRating ?? 0).toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">
          ({ratingCount} értékelés)
        </span>
      </div>

      <ProfessionalBadges badges={badges} />
    </div>
  );
}
