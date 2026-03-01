"use client";

import { use, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ImageOff,
  Phone,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { config } from "@/app.config";
import { useMyReports } from "@/app/api/client/use-my-reports";
import { useReportOffers } from "@/app/api/client/use-report-offers";
import { useCategories } from "@/app/api/client/categories";
import { acceptOffer } from "@/app/api/client/offers";
import { OfferWithProfessional } from "@/types/offer";
import { MyReport } from "@/types/report";
import { toast } from "sonner";

const URGENCY_LABELS: Record<number, string> = {
  1: "Alacsony",
  2: "Közepes",
  3: "Magas",
  4: "Sürgős",
  5: "Kritikus",
};

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reportId = Number(id);

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
    mutate: mutateReports,
  } = useMyReports();
  const {
    data: offers,
    isLoading: offersLoading,
    mutate: mutateOffers,
  } = useReportOffers(reportId);
  const { data: categories } = useCategories();

  const report = reports?.find((r) => r.id === reportId);
  const categoryLabel =
    categories?.find((c) => c.id === String(report?.categoryId))?.label ??
    "Ismeretlen";

  const handleOfferAccepted = () => {
    mutateOffers();
    mutateReports();
  };

  if (reportsLoading || offersLoading) {
    return (
      <main>
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-40 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </main>
    );
  }

  if (reportsError || !report) {
    return (
      <main>
        <Link
          href="/client/my-reports"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza a bejelentésekhez
        </Link>
        <p className="text-muted-foreground py-12 text-center">
          A bejelentés nem található.
        </p>
      </main>
    );
  }

  const imageUrl = report.filePath
    ? `${config.apiBaseUrl}/${report.filePath}`
    : null;

  const acceptedOffer = offers?.find((o) => o.status === "accepted");

  return (
    <main>
      <Link
        href="/client/my-reports"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Vissza a bejelentésekhez
      </Link>

      {/* Report header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex gap-5 mb-6">
        <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Hiba fotója"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              {categoryLabel}
            </Badge>
            <Badge variant={report.hasAccepted ? "secondary" : "default"}>
              {report.hasAccepted ? "Lezárva" : "Folyamatban"}
            </Badge>
            <Badge variant="outline" className="px-2 py-1 text-xs">
              {URGENCY_LABELS[report.urgency] ?? String(report.urgency)}
            </Badge>
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white mb-2">
            {report.description}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar size={14} />
            {new Date(report.createdAt).toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Accepted professional contact */}
      {report.hasAccepted && acceptedOffer && (
        <div className="mb-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-green-700 dark:text-green-400">
              Elfogadott szakember
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">
                {acceptedOffer.professional.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${acceptedOffer.professional.phone}`}
                className="font-semibold text-primary hover:underline"
              >
                {acceptedOffer.professional.phone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Offers */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Ajánlatok
          {offers?.length ? (
            <span className="text-muted-foreground font-normal text-base ml-2">
              ({offers.length})
            </span>
          ) : null}
        </h2>

        {!offers?.length ? (
          <p className="text-muted-foreground py-8 text-center">
            Még nem érkezett ajánlat erre a bejelentésre.
          </p>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                report={report}
                reportId={reportId}
                onAccepted={handleOfferAccepted}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OfferCard({
  offer,
  report,
  reportId,
  onAccepted,
}: {
  offer: OfferWithProfessional;
  report: MyReport;
  reportId: number;
  onAccepted: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptOffer(reportId, offer.id);
      toast.success("Ajánlat sikeresen elfogadva!");
      setDialogOpen(false);
      onAccepted();
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 402) {
          toast.error("Nincs elegendő kredit az ajánlat elfogadásához.");
        } else if (err.response?.status === 409) {
          toast.error("Ez az ajánlat már fel lett dolgozva.");
        } else {
          toast.error("Hiba az ajánlat elfogadása során.");
        }
      } else {
        toast.error("Hiba az ajánlat elfogadása során.");
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const totalPrice = offer.estimatedPrice + offer.travelFee;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all ${
        offer.status === "accepted"
          ? "border-green-300 dark:border-green-700"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="font-bold text-slate-900 dark:text-white">
              {offer.professional.name}
            </p>
            {offer.status === "accepted" && (
              <Badge
                variant="secondary"
                className="text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
              >
                Elfogadott
              </Badge>
            )}
            {offer.status === "rejected" && (
              <Badge variant="secondary" className="text-slate-500">
                Elutasított
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold">
              {offer.professional.avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({offer.professional.ratingCount} értékelés)
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Munkadíj: </span>
              <span className="font-semibold">
                {offer.estimatedPrice.toLocaleString("hu-HU")} Ft
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Kiszállási díj: </span>
              <span className="font-semibold">
                {offer.travelFee.toLocaleString("hu-HU")} Ft
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Összesen: </span>
              <span className="font-bold text-primary">
                {totalPrice.toLocaleString("hu-HU")} Ft
              </span>
            </div>
          </div>
        </div>

        {!report.hasAccepted && offer.status === "pending" && (
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button className="shrink-0">Elfogad</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Elfogadja az ajánlatot?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-semibold text-foreground">
                    {offer.professional.name}
                  </span>{" "}
                  ajánlatát fogadja el:{" "}
                  <span className="font-semibold text-foreground">
                    {totalPrice.toLocaleString("hu-HU")} Ft
                  </span>{" "}
                  összegben. Ez a művelet krediteket von le a fiókjából.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Mégsem</AlertDialogCancel>
                <Button onClick={handleAccept} disabled={isAccepting}>
                  {isAccepting ? "Elfogadás..." : "Elfogadom"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {offer.professional.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {offer.professional.badges.map((badge) => (
            <span
              key={badge.id}
              title={badge.description}
              className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full"
            >
              {badge.icon} {badge.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
