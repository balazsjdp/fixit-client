"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OfferStatusBadge } from "@/components/features/badges/offer-status-badge";
import { CategoryBadge } from "@/components/features/badges/category-badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useCategories } from "@/app/api/client/categories";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import { deleteOffer } from "@/app/api/client/offers";
import { DataCard } from "@/components/ui/data-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    mutate,
  } = useMyOffers();
  const { data: categories } = useCategories();
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  useEffect(() => {
    if (proError) {
      router.replace("/pro/register");
    }
  }, [proError, router]);

  const handleWithdraw = async (id: number) => {
    setWithdrawingId(id);
    try {
      await deleteOffer(id);
      toast.success("Ajánlat sikeresen visszavonva!");
      mutate();
    } catch {
      toast.error("Hiba a visszavonás során!");
    } finally {
      setWithdrawingId(null);
    }
  };

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
        <div data-testid="offers-error" className="text-center py-20 bg-destructive/5 rounded-2xl border-2 border-dashed border-destructive/20">
          <p className="text-destructive font-medium">
            Hiba az ajánlatok betöltése során.
          </p>
        </div>
      ) : !offers?.length ? (
        <div data-testid="no-offers" className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
          <p className="text-muted-foreground text-lg font-medium">
            Még nem adtál be ajánlatot.
          </p>
        </div>
      ) : (
        <div data-testid="offers-list" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const category = categories?.find(
              (c) => String(c.id) === String(offer.categoryId)
            );
            return (
              <div key={offer.id} data-testid={`my-offer-card-${offer.id}`}>
              <DataCard
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
                locationTestId={offer.status === "accepted" ? "accepted-address" : undefined}
                detailsUrl={`/reports/${offer.reportId}`}
                className={offer.status === 'accepted' ? 'border-green-100 dark:border-green-900/30' : ''}
                actions={
                  offer.status === "pending" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-medium"
                          disabled={withdrawingId === offer.id}
                        >
                          <Trash2 className="w-4 h-4" />
                          Visszavonás
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Biztosan visszavonja az ajánlatot?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Ezt a műveletet nem lehet visszavonni.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Mégsem</AlertDialogCancel>
                          <Button
                            variant="destructive"
                            onClick={() => handleWithdraw(offer.id)}
                            disabled={withdrawingId === offer.id}
                          >
                            Visszavonás
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )
                }
              />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
