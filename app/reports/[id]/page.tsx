"use client";

import { use, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ImageOff,
  Phone,
  User,
  Clock,
  Info,
  XCircle,
  Star,
  MapPin,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import { CategoryBadge } from "@/components/features/badges/category-badge";
import { ReportStatusBadge } from "@/components/features/badges/report-status-badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
import { OfferStatusBadge } from "@/components/features/badges/offer-status-badge";
import { ProfessionalCard } from "@/components/features/professional-card";
import { useMyReports } from "@/app/api/client/use-my-reports";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import { useReportOffers } from "@/app/api/client/use-report-offers";
import { useCategories } from "@/app/api/client/categories";
import { acceptOffer } from "@/app/api/client/offers";
import {
  confirmReport,
  cancelReport,
  submitReview,
  releaseTicket,
} from "@/app/api/client/reports";
import { config } from "@/app.config";
import { ReportStatusSlug, MyReport } from "@/types/report";
import { MyOffer, OfferWithProfessional } from "@/types/offer";

const STARS = [1, 2, 3, 4, 5];

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reportId = Number(id);

  const {
    data: reports,
    isLoading: reportsLoading,
    mutate: mutateReports,
  } = useMyReports();

  // Determine if this report belongs to the current user (client view)
  const myReport = reports?.find((r) => r.id === reportId);
  const isKnownClient = !reportsLoading && !!myReport;

  // Only query professional profile if the user is NOT a known client
  const needsProCheck = !reportsLoading && !myReport;
  const { data: pro, isLoading: proLoading } = useMyProfessionalProfile(needsProCheck);
  const {
    data: myOffers,
    isLoading: offersLoading,
    mutate: mutateMyOffers,
  } = useMyOffers(!!pro);
  const { data: categories } = useCategories();

  const proOffer = myOffers?.find((o) => o.reportId === reportId);
  const isClient = isKnownClient;
  const isProView = !isClient && !!proOffer;

  // Fetch report offers only for the client (SWR skips when key is null)
  const { data: reportOffers, mutate: mutateReportOffers } = useReportOffers(
    isClient ? reportId : null
  );

  const isLoading = reportsLoading || (needsProCheck && (proLoading || (!!pro && offersLoading)));

  // Derived shared values
  const categoryId = myReport?.categoryId ?? proOffer?.categoryId;
  const categoryLabel =
    categories?.find((c) => Number(c.id) === categoryId)?.label ?? "Ismeretlen";
  const statusSlug = (myReport?.statusSlug ??
    proOffer?.reportStatusSlug) as ReportStatusSlug | undefined;
  const shortDescription =
    myReport?.shortDescription ?? proOffer?.shortDescription ?? "";
  const description = myReport?.description ?? proOffer?.description ?? "";
  const urgency = myReport?.urgency ?? proOffer?.urgency ?? 0;
  const createdAt = myReport?.createdAt ?? proOffer?.createdAt ?? "";
  const filePath = myReport?.filePath ?? proOffer?.filePath ?? "";
  const imageUrl = filePath ? `${config.apiBaseUrl}/${filePath}` : null;

  if (isLoading) {
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

  if (!isClient && !isProView) {
    return (
      <main className="max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza
        </Link>
        <Card className="py-12 text-center border-dashed border-2">
          <CardContent>
            <p className="text-muted-foreground font-medium">
              A ticket nem található vagy nincs hozzáférésed.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const backHref = isClient ? "/client/my-reports" : "/pro/offers";
  const backLabel = isClient
    ? "Vissza a bejelentéseimhez"
    : "Vissza az ajánlataimhoz";

  return (
    <main className="max-w-6xl mx-auto w-full pb-12">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {shortDescription}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(createdAt).toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <span>•</span>
          <CategoryBadge label={categoryLabel} />
          {isProView && (
            <>
              <span>•</span>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Szakember nézet
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image */}
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

          {/* Description */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Részletes leírás
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            </CardContent>
          </Card>

          {/* CLIENT: action panel */}
          {isClient && myReport && (
            <ClientActionPanel
              report={myReport}
              reportId={reportId}
              onMutate={() => {
                mutateReports();
                mutateReportOffers();
              }}
            />
          )}

          {/* PRO: client contact + action panel */}
          {isProView && proOffer && (
            <ProPanel
              proOffer={proOffer}
              reportId={reportId}
              onMutate={() => mutateMyOffers()}
            />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status card */}
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="pb-3 bg-muted/10">
              <CardTitle className="text-base">Ticket állapota</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Sürgősség
                </span>
                <UrgencyBadge urgency={urgency} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Státusz
                </span>
                {statusSlug && <ReportStatusBadge status={statusSlug} />}
              </div>
            </CardContent>
          </Card>

          {/* CLIENT: assigned pro card + offers list */}
          {isClient && myReport && (
            <ClientSidebar
              report={myReport}
              reportId={reportId}
              offers={reportOffers}
              onOfferAccepted={() => {
                mutateReports();
                mutateReportOffers();
              }}
            />
          )}

            {/* PRO: client contact card */}
          {isProView && proOffer && (
            <ProClientContactCard proOffer={proOffer} />
          )}

          {/* PRO: offer details */}
          {isProView && proOffer && <ProSidebar proOffer={proOffer} />}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// CLIENT sub-components
// ─────────────────────────────────────────────

function ClientActionPanel({
  report,
  reportId,
  onMutate,
}: {
  report: MyReport;
  reportId: number;
  onMutate: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const canAct =
    report.statusSlug === "assigned" ||
    report.statusSlug === "pending_completion";
  const canReview = report.statusSlug === "completed" && !reviewDone;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmReport(reportId);
      toast.success("Visszaigazolva!");
      onMutate();
    } catch {
      toast.error("Hiba a visszaigazolás során.");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelReport(reportId, cancelReason);
      toast.success("Bejelentés visszavonva.");
      setCancelOpen(false);
      setCancelReason("");
      onMutate();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error("A bejelentés már nem vonható vissza.");
      } else {
        toast.error("Hiba a visszavonás során.");
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async () => {
    setSubmittingReview(true);
    try {
      await submitReview(reportId, { rating, comment, isAnonymous });
      toast.success("Értékelés elküldve!");
      setReviewDone(true);
      onMutate();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error("Ehhez a bejelentéshez már adott értékelést.");
        setReviewDone(true);
      } else {
        toast.error("Hiba az értékelés küldésekor.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!canAct && !canReview && !reviewDone) return null;

  return (
    <>
      {canAct && (
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="pb-3 bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Műveletek
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              {report.statusSlug === "pending_completion" && (
                <Button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex-1 sm:flex-none"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {confirming ? "Visszaigazolás..." : "Munkát késznek fogadom"}
                </Button>
              )}

              <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Visszavonás
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bejelentés visszavonása</AlertDialogTitle>
                    <AlertDialogDescription>
                      Kérjük, adja meg a visszavonás okát (legalább 10
                      karakter).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="Visszavonás oka..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="min-h-24"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Mégsem</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      disabled={cancelReason.length < 10 || cancelling}
                      onClick={handleCancel}
                    >
                      {cancelling ? "Visszavonás..." : "Végleges visszavonás"}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {canReview && (
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="pb-3 bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Értékelje a szakembert
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex gap-1">
              {STARS.map((star) => {
                const value = star * 2;
                const filled =
                  hoverRating > 0 ? value <= hoverRating : value <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={`${star} csillag`}
                  >
                    <Star
                      className={`w-8 h-8 ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  </button>
                );
              })}
            </div>
            <Textarea
              placeholder="Ossza meg véleményét (opcionális)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-24"
            />
            <div className="flex items-center gap-2">
              <input
                id="anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="anonymous"
                className="text-sm font-medium cursor-pointer"
              >
                Névtelenül értékelek
              </label>
            </div>
            <Button
              onClick={handleReviewSubmit}
              disabled={rating === 0 || submittingReview}
              className="w-full sm:w-auto"
            >
              <Star className="w-4 h-4 mr-2" />
              {submittingReview ? "Küldés..." : "Értékelés elküldése"}
            </Button>
          </CardContent>
        </Card>
      )}

      {reviewDone && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
          <p className="text-green-700 dark:text-green-400 font-medium">
            Köszönjük az értékelést!
          </p>
        </div>
      )}
    </>
  );
}

function ClientSidebar({
  report,
  reportId,
  offers,
  onOfferAccepted,
}: {
  report: MyReport;
  reportId: number;
  offers?: OfferWithProfessional[];
  onOfferAccepted: () => void;
}) {
  const isAssigned =
    report.statusSlug !== "open" && report.statusSlug !== "cancelled";
  const acceptedOffer = offers?.find((o) => o.status === "accepted");

  return (
    <>
      {/* Assigned pro card */}
      {isAssigned && acceptedOffer && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              Hozzárendelt szakember
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
            <a
              href={`tel:${acceptedOffer.professional.phone}`}
              className="flex items-center gap-2 w-full justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium text-sm"
            >
              <Phone className="w-4 h-4" />
              Hívás: {acceptedOffer.professional.phone}
            </a>
          </CardContent>
        </Card>
      )}

      {/* Pricing card */}
      {isAssigned && acceptedOffer && (
        <Card className="shadow-sm border-primary/20">
          <CardContent className="p-0">
            <div className="bg-primary/5 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Munkadíj:</span>
                <span className="font-medium">
                  {acceptedOffer.estimatedPrice.toLocaleString("hu-HU")} Ft
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kiszállás:</span>
                <span className="font-medium">
                  {acceptedOffer.travelFee.toLocaleString("hu-HU")} Ft
                </span>
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Összesen:</span>
                <span className="font-bold text-primary text-lg">
                  {(
                    acceptedOffer.estimatedPrice + acceptedOffer.travelFee
                  ).toLocaleString("hu-HU")}{" "}
                  Ft
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offers list (only when open) */}
      {report.statusSlug === "open" && (
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
                  onAccepted={onOfferAccepted}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
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
              <span className="font-medium">
                {offer.estimatedPrice.toLocaleString("hu-HU")} Ft
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kiszállás:</span>
              <span className="font-medium">
                {offer.travelFee.toLocaleString("hu-HU")} Ft
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Összesen:</span>
              <span className="font-bold text-primary text-base">
                {totalPrice.toLocaleString("hu-HU")} Ft
              </span>
            </div>
          </div>

          {report.statusSlug === "open" && offer.status === "pending" && (
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button className="w-full">Elfogadom az ajánlatot</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ajánlat elfogadása</AlertDialogTitle>
                  <AlertDialogDescription>
                    Biztosan elfogadja{" "}
                    <strong className="text-foreground">
                      {offer.professional.name}
                    </strong>{" "}
                    ajánlatát{" "}
                    <strong className="text-foreground ml-1">
                      {totalPrice.toLocaleString("hu-HU")} Ft
                    </strong>{" "}
                    összegben?
                    <br />
                    <br />A művelet végleges, és a kapcsolatfelvételhez
                    szükséges kreditek levonásra kerülnek.
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

// ─────────────────────────────────────────────
// PRO sub-components
// ─────────────────────────────────────────────

function ProPanel({
  proOffer,
  reportId,
  onMutate,
}: {
  proOffer: MyOffer;
  reportId: number;
  onMutate: () => void;
}) {
  const isAssignedToMe = proOffer.status === "accepted";
  const reportStatus = proOffer.reportStatusSlug;

  const [confirming, setConfirming] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmReport(reportId);
      toast.success("Munka készre jelentve!");
      onMutate();
    } catch {
      toast.error("Hiba a készre jelentés során.");
    } finally {
      setConfirming(false);
    }
  };

  const handleRelease = async () => {
    setReleasing(true);
    try {
      await releaseTicket(reportId);
      toast.success("Ticket visszaadva a piacra.");
      setReleaseOpen(false);
      onMutate();
    } catch {
      toast.error("Hiba a lemondás során.");
    } finally {
      setReleasing(false);
    }
  };

  if (!isAssignedToMe) {
    // Pending offer state
    return (
      <Card className="shadow-sm border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Clock className="w-5 h-5" />
            Ajánlatod állapota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {proOffer.status === "rejected"
              ? "Az ajánlatodat nem fogadták el erre a ticketre."
              : "Az ajánlatod beküldve, várod az ügyfél visszajelzését."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pro action card */}
      {isAssignedToMe && reportStatus === "assigned" && (
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="pb-3 bg-muted/10">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Műveletek
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {confirming ? "Feldolgozás..." : "Munka elvégezve – Készre jelenés"}
            </Button>

            <AlertDialog open={releaseOpen} onOpenChange={setReleaseOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <XCircle className="w-4 h-4 mr-2" />
                  Lemondás
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ticket lemondása</AlertDialogTitle>
                  <AlertDialogDescription>
                    Biztosan le szeretné mondani ezt a munkát? A ticket
                    visszakerül a nyitott piacra, és más szakember is ajánlatot
                    tehet rá.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mégsem</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={handleRelease}
                    disabled={releasing}
                  >
                    {releasing ? "Lemondás..." : "Igen, lemondok"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {isAssignedToMe && reportStatus === "pending_completion" && (
        <Card className="shadow-sm border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="pt-6 pb-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                Várakozás az ügyfél visszaigazolására
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                A munkát készre jelentetted. Ha az ügyfél 7 napon belül nem
                reagál, a rendszer automatikusan lezárja a ticketet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isAssignedToMe && reportStatus === "completed" && (
        <Card className="shadow-sm border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="pt-6 pb-5 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
              Munka sikeresen befejezve
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProClientContactCard({ proOffer }: { proOffer: MyOffer }) {
  const isAssignedToMe = proOffer.status === "accepted";
  const reportStatus = proOffer.reportStatusSlug;
  const showClientContact =
    isAssignedToMe &&
    (reportStatus === "assigned" ||
      reportStatus === "pending_completion" ||
      reportStatus === "completed");

  if (!showClientContact) return null;

  return (
    <Card className="shadow-sm border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
          <User className="w-5 h-5" />
          Ügyfél adatai
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {proOffer.clientName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{proOffer.clientName}</span>
          </div>
        )}
        {proOffer.clientPhone && (
          <a
            href={`tel:${proOffer.clientPhone}`}
            className="flex items-center gap-2 w-full justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium text-sm"
          >
            <Phone className="w-4 h-4" />
            Hívás: {proOffer.clientPhone}
          </a>
        )}
        {proOffer.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {proOffer.address.postcode} {proOffer.address.city},{" "}
              {proOffer.address.street} {proOffer.address.houseNumber}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProSidebar({ proOffer }: { proOffer: MyOffer }) {
  return (
    <Card className="shadow-sm border-primary/20">
      <CardHeader className="pb-3 bg-muted/10">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          Az ajánlatom
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Státusz:</span>
          <OfferStatusBadge status={proOffer.status} />
        </div>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Munkadíj:</span>
          <span className="font-medium">
            {proOffer.estimatedPrice.toLocaleString("hu-HU")} Ft
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Kiszállás:</span>
          <span className="font-medium">
            {proOffer.travelFee.toLocaleString("hu-HU")} Ft
          </span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Összesen:</span>
          <span className="font-bold text-primary text-lg">
            {(proOffer.estimatedPrice + proOffer.travelFee).toLocaleString(
              "hu-HU"
            )}{" "}
            Ft
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
