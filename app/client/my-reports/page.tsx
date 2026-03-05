"use client";

import { CategoryBadge } from "@/components/features/badges/category-badge";
import { ReportStatusBadge } from "@/components/features/badges/report-status-badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
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
  Calendar,
  Plus,
  Trash2,
  ArrowRight,
  MessageSquare,
  ImageOff,
} from "lucide-react";
import Link from "next/link";
import { config } from "@/app.config";
import { useState } from "react";
import { useMyReports } from "@/app/api/client/use-my-reports";
import { useCategories } from "@/app/api/client/categories";
import { deleteReport } from "@/app/api/client/reports";
import { MyReport } from "@/types/report";
import { toast } from "sonner";
import { urgencyColor, urgencyLabel } from "@/lib/urgency";
import { cn } from "@/lib/utils";

export default function MyReports() {
  const { data: reports, isLoading, error, mutate } = useMyReports();
  const { data: categories } = useCategories();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getCategoryLabel = (categoryId: number) =>
    categories?.find((c) => Number(c.id) === categoryId)?.label ?? "Ismeretlen";

  console.log(categories);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteReport(id);
      toast.success("Bejelentés sikeresen törölve!");
      mutate();
    } catch {
      toast.error("Hiba a törlés során!");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main>
      <div className="mb-10 flex flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
            Bejelentett hibáim
          </h1>
          <p className="text-lg text-muted-foreground">
            Kövesse nyomon folyamatban lévő és lezárt szerviz igényeit.
          </p>
        </div>
        <Link
          className="bg-primary hover:bg-primary/90 text-background px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
          href="/client/new"
        >
          <Plus className="text-xl" />
          Új hiba bejelentése
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-muted-foreground py-12 text-center">
          Hiba a bejelentések betöltése során.
        </p>
      ) : !reports?.length ? (
        <p className="text-muted-foreground py-12 text-center">
          Még nincs bejelentett hibája.
        </p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              categoryLabel={getCategoryLabel(report.categoryId)}
              isDeleting={deletingId === report.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ReportCard({
  report,
  categoryLabel,
  isDeleting,
  onDelete,
}: {
  report: MyReport;
  categoryLabel: string;
  isDeleting: boolean;
  onDelete: (id: number) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const imageUrl = report.filePath
    ? `${config.apiBaseUrl}/${report.filePath}`
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
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
          <CategoryBadge label={categoryLabel} />
          <ReportStatusBadge hasAccepted={report.hasAccepted} />
          <UrgencyBadge urgency={report.urgency} />
          {report.offerCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-1">
              <MessageSquare className="w-3 h-3" />
              {report.offerCount} ajánlat
            </span>
          )}
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
          {report.description}
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar size={15} />
          Bejelentve:{" "}
          {new Date(report.createdAt).toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!report.hasAccepted && (
          <>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Törlés"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Biztosan törli a bejelentést?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Ez a művelet nem vonható vissza. A bejelentés véglegesen
                    törlésre kerül.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mégsem</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDialogOpen(false);
                      onDelete(report.id);
                    }}
                    disabled={isDeleting}
                  >
                    Törlés
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        <Link href={`/client/my-reports/${report.id}`}>
          <Button variant="outline" size="icon" aria-label="Részletek">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
