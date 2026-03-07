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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
      <main>
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </main>
    );
  }

  if (error || !job) {
    return (
      <main>
        <Link
          href="/client/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Vissza a munkákhoz
        </Link>
        <p className="text-center text-muted-foreground py-20">
          A munka nem található.
        </p>
      </main>
    );
  }

  const canAct =
    job.status === JobStatus.InProgress ||
    job.status === JobStatus.PendingCompletion;
  const alreadyConfirmed = job.clientConfirmed;
  const canReview = job.status === JobStatus.Completed && !reviewDone;

  return (
    <main>
      <Link
        href="/client/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Vissza a munkákhoz
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold">{job.shortDescription}</h1>
          <Badge variant={statusVariant(job.status)}>
            {statusLabels[job.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(job.createdAt), "yyyy. MMMM d.", { locale: hu })}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            {job.professionalName}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            {job.professionalPhone}
          </div>
          {job.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {job.address.city}, {job.address.street} {job.address.houseNumber}
            </div>
          )}
          <div className="flex items-center gap-2 font-semibold sm:col-span-2">
            Díj: {job.price.toLocaleString("hu-HU")} Ft
            {job.travelFee > 0 &&
              ` + ${job.travelFee.toLocaleString("hu-HU")} Ft kiszállás`}
          </div>
        </div>
      </div>

      {/* Confirmation status */}
      {(job.status === JobStatus.InProgress ||
        job.status === JobStatus.PendingCompletion) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6">
          <h2 className="font-bold mb-3">Visszaigazolás állapota</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${job.clientConfirmed ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
            >
              {job.clientConfirmed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Te: {job.clientConfirmed ? "Visszaigazolva" : "Vár"}
            </div>
            <div
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${job.proConfirmed ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
            >
              {job.proConfirmed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Szakember: {job.proConfirmed ? "Visszaigazolva" : "Vár"}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {canAct && (
        <div className="flex flex-wrap gap-3 mb-6">
          {!alreadyConfirmed && (
            <Button
              data-testid="confirm-btn"
              onClick={handleConfirm}
              disabled={confirming}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {confirming ? "Visszaigazolás..." : "Készre jelent"}
            </Button>
          )}

          <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <AlertDialogTrigger asChild>
              <Button data-testid="cancel-btn" variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Visszavon
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
                  {cancelling ? "Visszavonás..." : "Visszavon"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Completed */}
      {job.status === JobStatus.Completed && (
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-6">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Ez a munka sikeresen elvégezve.</span>
        </div>
      )}

      {/* Cancelled */}
      {job.status === JobStatus.Cancelled && job.cancellationReason && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 mb-6">
          <p className="font-bold text-destructive mb-1">Visszavonás oka:</p>
          <p className="text-sm">{job.cancellationReason}</p>
        </div>
      )}

      {/* Review form */}
      {canReview && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold mb-4">Értékelje a szakembert</h2>
          <div className="flex gap-1 mb-4" data-testid="star-rating">
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
            placeholder="Vélemény (opcionális)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4 min-h-24"
          />

          <div className="flex items-center gap-2 mb-4">
            <input
              id="anonymous"
              data-testid="anonymous-checkbox"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="anonymous" className="text-sm">
              Névtelenül értékelek
            </label>
          </div>

          <Button
            data-testid="submit-review-btn"
            onClick={handleReviewSubmit}
            disabled={rating === 0 || submittingReview}
          >
            <Star className="w-4 h-4 mr-2" />
            {submittingReview ? "Küldés..." : "Értékelés elküldése"}
          </Button>
        </div>
      )}

      {reviewDone && job.status === JobStatus.Completed && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
          <p className="text-green-700 dark:text-green-400 font-semibold">
            Köszönjük az értékelést!
          </p>
        </div>
      )}
    </main>
  );
}
