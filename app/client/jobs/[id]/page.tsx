"use client";

import { use, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  Star,
  User,
  XCircle,
  ImageOff,
  Info,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useJob,
  confirmJob,
  cancelJob,
  submitReview,
} from "@/app/api/client/jobs";
import { JobStatus } from "@/types/job";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { config } from "@/app.config";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";

const statusLabels: Record<JobStatus, string> = {
  [JobStatus.InProgress]: "Folyamatban",
  [JobStatus.PendingCompletion]: "Visszaigazolásra vár",
  [JobStatus.Completed]: "Elvégezve",
  [JobStatus.Cancelled]: "Visszavonva",
  [JobStatus.NoShow]: "Nem jelent meg",
  [JobStatus.Disputed]: "Vitás",
};

const statusVariant = (
  s: JobStatus
): "default" | "secondary" | "destructive" | "outline" => {
  if (s === JobStatus.Completed) return "outline";
  if (s === JobStatus.InProgress || s === JobStatus.PendingCompletion)
    return "secondary";
  return "destructive";
};

const STARS = [1, 2, 3, 4, 5];

export default function ClientJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const jobId = Number(id);
  const { data: job, isLoading, error, mutate } = useJob(jobId);

  const [confirming, setConfirming] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Review state
  const [rating, setRating] = useState(0); // 0–10 (5 stars * 2)
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmJob(jobId);
      toast.success("Munka visszaigazolva!");
      mutate();
    } catch {
      toast.error("Hiba a visszaigazolás során.");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelJob(jobId, cancelReason);
      toast.success("Munka visszavonva.");
      setCancelOpen(false);
      setCancelReason("");
      mutate();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error("A munka már nem vonható vissza.");
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
      await submitReview(jobId, { rating, comment, isAnonymous });
      toast.success("Értékelés elküldve!");
      setReviewDone(true);
      mutate();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error("Ehhez a munkához már adott értékelést.");
        setReviewDone(true);
      } else {
        toast.error("Hiba az értékelés küldésekor.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

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
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="max-w-5xl mx-auto w-full">
        <Link
          href="/client/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza a munkákhoz
        </Link>
        <Card className="py-12 text-center border-dashed border-2">
          <CardContent>
            <p className="text-muted-foreground font-medium">
              A munka nem található vagy hiba történt a betöltésekor.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const canAct =
    job.status === JobStatus.InProgress ||
    job.status === JobStatus.PendingCompletion;
  const alreadyConfirmed = job.clientConfirmed;
  const canReview = job.status === JobStatus.Completed && !reviewDone;
  
  const imageUrl = job.filePath
    ? `${config.apiBaseUrl}/${job.filePath}`
    : null;

  return (
    <main className="max-w-6xl mx-auto w-full pb-12">
      <Link
        href="/client/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Vissza a munkákhoz
      </Link>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {job.shortDescription}
          </h1>
          <Badge variant={statusVariant(job.status)} className="w-fit text-sm px-3 py-1">
            {statusLabels[job.status]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(job.createdAt), "yyyy. MMMM d.", { locale: hu })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Report Details & Image */}
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
                {job.description || "Nincs megadva részletes leírás."}
              </p>
            </CardContent>
          </Card>

          {/* Actions & Confirmation Status */}
          {canAct && (
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="pb-3 bg-muted/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Visszaigazolás állapota
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div
                    className={`flex-1 flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl border ${job.clientConfirmed ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-muted/50 border-muted text-muted-foreground"}`}
                  >
                    {job.clientConfirmed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                    Te: {job.clientConfirmed ? "Visszaigazolva" : "Visszaigazolásra vár"}
                  </div>
                  <div
                    className={`flex-1 flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl border ${job.proConfirmed ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-muted/50 border-muted text-muted-foreground"}`}
                  >
                    {job.proConfirmed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                    Szakember: {job.proConfirmed ? "Visszaigazolva" : "Visszaigazolásra vár"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!alreadyConfirmed && (
                    <Button
                      data-testid="confirm-btn"
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="flex-1 sm:flex-none"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {confirming ? "Visszaigazolás..." : "Munka elkészült"}
                    </Button>
                  )}

                  <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                    <AlertDialogTrigger asChild>
                      <Button data-testid="cancel-btn" variant="destructive" className="flex-1 sm:flex-none">
                        <XCircle className="w-4 h-4 mr-2" />
                        Visszavonás
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Munka visszavonása</AlertDialogTitle>
                        <AlertDialogDescription>
                          Kérjük, adja meg a visszavonás okát (legalább 10 karakter).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Textarea
                        data-testid="cancel-reason"
                        placeholder="Visszavonás oka..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="min-h-24"
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Mégsem</AlertDialogCancel>
                        <Button
                          data-testid="cancel-confirm-btn"
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

          {job.status === JobStatus.Completed && (
            <div className="flex items-center gap-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 shadow-sm">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold text-lg">Ez a munka sikeresen elvégezve.</p>
                {job.completedAt && (
                  <p className="text-sm opacity-80">
                    Befejezve: {format(new Date(job.completedAt), "yyyy. MMMM d. HH:mm", { locale: hu })}
                  </p>
                )}
              </div>
            </div>
          )}

          {job.status === JobStatus.Cancelled && job.cancellationReason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-destructive">
                <XCircle className="w-5 h-5" />
                <p className="font-bold">Munka visszavonva</p>
              </div>
              <p className="text-sm text-foreground/80"><span className="font-medium text-foreground">Ok:</span> {job.cancellationReason}</p>
              {job.cancelledBy && (
                <p className="text-xs text-muted-foreground mt-2">Visszavonta: {job.cancelledBy === 'client' ? 'Te' : 'Szakember'}</p>
              )}
            </div>
          )}

          {/* Review Form */}
          {canReview && (
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="pb-3 bg-muted/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Értékelje a szakembert
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-1" data-testid="star-rating">
                  {STARS.map((star) => {
                    const value = star * 2; // 2,4,6,8,10
                    const filled =
                      hoverRating > 0 ? value <= hoverRating : value <= rating;
                    return (
                      <button
                        key={star}
                        data-testid={`star-${star}`}
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
                  data-testid="review-comment"
                  placeholder="Ossza meg véleményét a munkával kapcsolatban (opcionális)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-24"
                />

                <div className="flex items-center gap-2">
                  <input
                    id="anonymous"
                    data-testid="anonymous-checkbox"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
                    Névtelenül értékelek
                  </label>
                </div>

                <Button
                  data-testid="submit-review-btn"
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

          {reviewDone && job.status === JobStatus.Completed && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
              <p className="text-green-700 dark:text-green-400 font-medium">
                Köszönjük az értékelést! A visszajelzése segít másoknak is a megfelelő szakember kiválasztásában.
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Pricing & Pro Info */}
        <div className="space-y-6">
          
          {/* Pro Info Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Szakember adatai
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col gap-1 text-base font-semibold">
                <span>{job.professionalName}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`tel:${job.professionalPhone}`} className="text-primary hover:underline font-medium">
                  {job.professionalPhone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 bg-muted/10">
              <CardTitle className="text-base">Munka részletei</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4"/> Sürgősség</span>
                <UrgencyBadge urgency={job.urgency} />
              </div>
              
              {job.address && (
                <>
                  <Separator />
                  <div className="flex gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-muted-foreground mb-0.5">Helyszín</span>
                      <span className="font-medium text-foreground">
                        {job.address.postcode} {job.address.city}, {job.address.street} {job.address.houseNumber}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card className="shadow-sm border-primary/20">
            <CardContent className="p-0">
              <div className="bg-primary/5 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Munkadíj:</span>
                  <span className="font-medium">{job.price.toLocaleString("hu-HU")} Ft</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kiszállás:</span>
                  <span className="font-medium">{job.travelFee.toLocaleString("hu-HU")} Ft</span>
                </div>
                <Separator className="bg-primary/10" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Összesen:</span>
                  <span className="font-bold text-primary text-lg">
                    {(job.price + job.travelFee).toLocaleString("hu-HU")} Ft
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}