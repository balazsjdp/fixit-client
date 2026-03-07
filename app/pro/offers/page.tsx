"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OfferStatusBadge } from "@/components/features/badges/offer-status-badge";
import { CategoryBadge } from "@/components/features/badges/category-badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useCategories } from "@/app/api/client/categories";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import { DataCard } from "@/components/ui/data-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyOffersPage() {
  const router = useRouter();
  const {
    data: pro,
    isLoading: proLoading,
    error: proError,
  } = useMyProfessionalProfile();
  const {
    data: offers,
    isLoading: offersLoading,
    error: offersError,
  } = useMyOffers();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (proError) {
      router.replace("/pro/register");
    }
  }, [proError, router]);

  if (!pro && !proLoading) return null;

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
          Ajánlataim
        </h1>
        <p className="text-lg text-muted-foreground">
          Az összes beadott ajánlatod és azok aktuális státusza.
        </p>
      </div>

      {offersLoading || proLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : offersError ? (
        <div className="text-center py-20 bg-destructive/5 rounded-2xl border-2 border-dashed border-destructive/20">
          <p className="text-destructive font-medium">
            Hiba az ajánlatok betöltése során.
          </p>
        </div>
      ) : !offers?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
          <p className="text-muted-foreground text-lg font-medium">
            Még nem adtál be ajánlatot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const category = categories?.find(
              (c) => String(c.id) === String(offer.categoryId)
            );
            return (
              <DataCard
                key={offer.id}
                id={offer.id}
                title={offer.shortDescription}
                statusBadge={<OfferStatusBadge status={offer.status} />}
                categoryBadge={<CategoryBadge label={category?.label ?? "Ismeretlen"} />}
                urgencyBadge={<UrgencyBadge urgency={offer.urgency} />}
                date={offer.createdAt}
                price={offer.estimatedPrice}
                travelFee={offer.travelFee}
                location={offer.status === "accepted" && offer.address 
                  ? `${offer.address.city}, ${offer.address.street}` 
                  : "Csak elfogadás után látható"}
                detailsUrl={`/pro/reports/${offer.reportId}`}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
