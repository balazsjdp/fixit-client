"use client";

import { use, useState } from "react";
import { CategoryBadge } from "@/components/features/badges/category-badge";
import { ReportStatusBadge } from "@/components/features/badges/report-status-badge";
import { OfferStatusBadge } from "@/components/features/badges/offer-status-badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  User,
  Clock,
  Info,
} from "lucide-react";
import { ProfessionalCard } from "@/components/features/professional-card";
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
    categories?.find((c) => Number(c.id) === report?.categoryId)?.label ??
    "Ismeretlen";

  const handleOfferAccepted = () => {
    mutateOffers();
    mutateReports();
  };

  if (reportsLoading || offersLoading) {
    return (
      <main className="max-w-5xl mx-auto w-full">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (reportsError || !report) {
    return (
      <main className="max-w-5xl mx-auto w-full">
        <Link
          href="/client/my-reports"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza a bejelentésekhez
        </Link>
        <Card className="py-12 text-center border-dashed border-2">
          <CardContent>
            <p className="text-muted-foreground font-medium">A bejelentés nem található vagy hiba történt a betöltésekor.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const imageUrl = report.filePath
    ? `${config.apiBaseUrl}/${report.filePath}`
    : null;

  const acceptedOffer = offers?.find((o) => o.status === "accepted");

  return (
    <main className="max-w-6xl mx-auto w-full pb-12">
      <Link
        href="/client/my-reports"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Vissza a bejelentésekhez
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {report.shortDescription}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(report.createdAt).toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <span>•</span>
          <CategoryBadge label={categoryLabel} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Report Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Section */}
          <Card className="overflow-hidden shadow-sm">
            <div className="aspect-video relative bg-muted/30 flex items-center justify-center">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Hiba fotója"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="w-12 h-12 opacity-50" />
                  <span className="text-sm font-medium">Nincs csatolt kép</span>
                </div>
              )}
            </div>
          </Card>

          {/* Description Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Részletes leírás
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status & Offers */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="pb-3 bg-muted/10">
              <CardTitle className="text-base">Bejelentés állapota</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4"/> Sürgősség</span>
                <UrgencyBadge urgency={report.urgency} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Info className="w-4 h-4"/> Státusz</span>
                <ReportStatusBadge hasAccepted={report.hasAccepted} />
              </div>
            </CardContent>
          </Card>

          {/* Accepted Professional Card */}
          {report.hasAccepted && acceptedOffer && (
            <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Elfogadott szakember
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-green-700 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {acceptedOffer.professional.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Szakember</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <a
                    href={`tel:${acceptedOffer.professional.phone}`}
                    className="flex items-center gap-2 w-full justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Hívás: {acceptedOffer.professional.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Offers List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center justify-between">
              Ajánlatok
              {offers?.length ? (
                <span className="bg-primary/10 text-primary text-xs py-0.5 px-2.5 rounded-full font-bold">
                  {offers.length} db
                </span>
              ) : null}
            </h3>

            {!offers?.length ? (
              <Card className="border-dashed shadow-none bg-transparent">
                <CardContent className="pt-6 pb-6 text-center text-muted-foreground text-sm">
                  Még nem érkezett ajánlat.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
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
        </div>
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
    <Card 
      className={`overflow-hidden transition-all shadow-sm ${
        offer.status === "accepted"
          ? "border-green-400 dark:border-green-600 ring-1 ring-green-400/20"
          : "hover:border-primary/50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <ProfessionalCard
              name={offer.professional.name}
              avgRating={offer.professional.avgRating}
              ratingCount={offer.professional.ratingCount}
              badges={offer.professional.badges}
            />
            {offer.status !== "pending" && (
              <div className="shrink-0">
                <OfferStatusBadge status={offer.status} />
              </div>
            )}
          </div>

          <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Munkadíj:</span>
              <span className="font-medium">{offer.estimatedPrice.toLocaleString("hu-HU")} Ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kiszállás:</span>
              <span className="font-medium">{offer.travelFee.toLocaleString("hu-HU")} Ft</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Összesen:</span>
              <span className="font-bold text-primary text-base">
                {totalPrice.toLocaleString("hu-HU")} Ft
              </span>
            </div>
          </div>

          {!report.hasAccepted && offer.status === "pending" && (
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button className="w-full">Elfogadom az ajánlatot</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ajánlat elfogadása</AlertDialogTitle>
                  <AlertDialogDescription>
                    Biztosan elfogadja <strong className="text-foreground">{offer.professional.name}</strong> ajánlatát 
                    <strong className="text-foreground ml-1">{totalPrice.toLocaleString("hu-HU")} Ft</strong> összegben? 
                    <br/><br/>
                    A művelet végleges, és a kapcsolatfelvételhez szükséges kreditek levonásra kerülnek.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mégsem</AlertDialogCancel>
                  <Button onClick={handleAccept} disabled={isAccepting}>
                    {isAccepting ? "Feldolgozás..." : "Igen, elfogadom"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
