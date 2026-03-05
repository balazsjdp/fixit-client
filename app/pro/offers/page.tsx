"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MyOfferCard } from "@/components/features/my-offer-card";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useCategories } from "@/app/api/client/categories";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";

export default function MyOffersPage() {
  const router = useRouter();
  const { data: pro, isLoading: proLoading, error: proError } =
    useMyProfessionalProfile();
  const { data: offers, isLoading: offersLoading, error: offersError } =
    useMyOffers();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (proError) {
      router.replace("/pro/register");
    }
  }, [proError, router]);

  if (proLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!pro) return null;

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

      {offersLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : offersError ? (
        <p
          className="text-muted-foreground py-12 text-center"
          data-testid="offers-error"
        >
          Hiba az ajánlatok betöltése során.
        </p>
      ) : !offers?.length ? (
        <p
          className="text-muted-foreground py-12 text-center"
          data-testid="no-offers"
        >
          Még nem adtál be ajánlatot.
        </p>
      ) : (
        <div className="space-y-3" data-testid="offers-list">
          {offers.map((offer) => (
            <MyOfferCard
              key={offer.id}
              offer={offer}
              category={categories?.find(
                (c) => String(c.id) === String(offer.categoryId)
              )}
            />
          ))}
        </div>
      )}
    </main>
  );
}
