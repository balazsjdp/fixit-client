"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitOffer } from "@/app/api/client/offers";

interface OfferModalProps {
  reportId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OfferModal({
  reportId,
  open,
  onOpenChange,
  onSuccess,
}: OfferModalProps) {
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [travelFee, setTravelFee] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedValues, setSubmittedValues] = useState<{
    estimatedPrice: number;
    travelFee: number;
  } | null>(null);

  // Reset form when the modal is closed externally (parent sets open=false)
  useEffect(() => {
    if (!open && !alreadySubmitted) {
      setEstimatedPrice("");
      setTravelFee("");
    }
  }, [open, alreadySubmitted]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const price = parseInt(estimatedPrice, 10);
    const fee = parseInt(travelFee, 10);

    if (!estimatedPrice || isNaN(price) || price <= 0) {
      toast.error("Adj meg érvényes becsült munkadíjat (minimum 1 Ft).");
      return;
    }
    if (travelFee !== "" && (isNaN(fee) || fee < 0)) {
      toast.error("A kiszállási díj nem lehet negatív.");
      return;
    }

    const travelFeeValue = travelFee === "" ? 0 : fee;

    setSubmitting(true);
    try {
      await submitOffer(reportId, {
        estimatedPrice: price,
        travelFee: travelFeeValue,
      });
      toast.success("Ajánlat sikeresen beküldve!");
      setAlreadySubmitted(true);
      setSubmittedValues({ estimatedPrice: price, travelFee: travelFeeValue });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          toast.error("Már adtál ajánlatot erre a bejelentésre.");
          setAlreadySubmitted(true);
        } else if (err.response?.status === 403) {
          toast.error("Csak jóváhagyott szakemberek adhatnak ajánlatot.");
        } else {
          toast.error("Hiba az ajánlat beküldése során. Próbáld újra.");
        }
      } else {
        toast.error("Hiba az ajánlat beküldése során. Próbáld újra.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {alreadySubmitted ? "Beküldött ajánlatod" : "Ajánlatot adok"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {alreadySubmitted
              ? "Már beküldtél ajánlatot erre a bejelentésre."
              : "Add meg a becsült munkadíjat és a kiszállási díjat."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {alreadySubmitted && submittedValues ? (
          <div
            className="space-y-3 py-2"
            data-testid="offer-readonly"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Becsült munkadíj:</span>
              <span className="font-semibold">
                {submittedValues.estimatedPrice.toLocaleString("hu-HU")} Ft
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kiszállási díj:</span>
              <span className="font-semibold">
                {submittedValues.travelFee.toLocaleString("hu-HU")} Ft
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <span className="text-muted-foreground font-medium">Összesen:</span>
              <span className="font-bold text-primary">
                {(
                  submittedValues.estimatedPrice + submittedValues.travelFee
                ).toLocaleString("hu-HU")}{" "}
                Ft
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2" data-testid="offer-form">
            <div className="space-y-1.5">
              <label
                htmlFor="estimated-price"
                className="text-sm font-medium text-foreground"
              >
                Becsült munkadíj (Ft)
              </label>
              <Input
                id="estimated-price"
                type="number"
                min="1"
                placeholder="pl. 15000"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                data-testid="input-estimated-price"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="travel-fee"
                className="text-sm font-medium text-foreground"
              >
                Kiszállási díj (Ft)
              </label>
              <Input
                id="travel-fee"
                type="number"
                min="0"
                placeholder="pl. 3000 (elhagyható)"
                value={travelFee}
                onChange={(e) => setTravelFee(e.target.value)}
                data-testid="input-travel-fee"
              />
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>
            {alreadySubmitted ? "Bezár" : "Mégsem"}
          </AlertDialogCancel>
          {!alreadySubmitted && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="submit-offer-btn"
            >
              {submitting ? "Beküldés..." : "Ajánlat beküldése"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
