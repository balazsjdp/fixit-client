"use client";

import { Calendar, MapPin } from "lucide-react";
import { MyOffer, OfferStatus } from "@/types/offer";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { urgencyLabel, urgencyColor } from "@/lib/urgency";
import { CategoryBadge } from "./badges/category-badge";
import { OfferStatusBadge } from "./badges/offer-status-badge";

interface MyOfferCardProps {
  offer: MyOffer;
  category: Category | undefined;
}

export function MyOfferCard({ offer, category }: MyOfferCardProps) {
  return (
    <div
      data-testid={`my-offer-card-${offer.id}`}
      className={cn(
        "bg-white dark:bg-slate-900 border rounded-xl p-4",
        offer.status === "accepted"
          ? "border-green-300 dark:border-green-800"
          : "border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 w-2.5 h-2.5 rounded-full shrink-0",
            urgencyColor(offer.urgency)
          )}
          aria-label={urgencyLabel(offer.urgency)}
        />
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <CategoryBadge label={category?.label ?? "Ismeretlen"} />
            <OfferStatusBadge status={offer.status} />
          </div>

          {/* Description */}
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
            {offer.description}
          </p>

          {/* Price row */}
          <div className="flex items-center gap-4 text-sm mb-2">
            <span className="text-muted-foreground">
              Munkadíj:{" "}
              <span className="font-semibold text-foreground">
                {offer.estimatedPrice.toLocaleString("hu-HU")} Ft
              </span>
            </span>
            {offer.travelFee > 0 && (
              <span className="text-muted-foreground">
                Kiszállás:{" "}
                <span className="font-semibold text-foreground">
                  {offer.travelFee.toLocaleString("hu-HU")} Ft
                </span>
              </span>
            )}
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(offer.createdAt).toLocaleDateString("hu-HU", {
              month: "short",
              day: "numeric",
            })}
          </p>

          {/* Address – only shown for accepted offers */}
          {offer.status === "accepted" && offer.address && (
            <div
              data-testid="accepted-address"
              className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            >
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" />
                Helyszín
              </p>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                {offer.address.postcode} {offer.address.city},{" "}
                {offer.address.street} {offer.address.houseNumber}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
