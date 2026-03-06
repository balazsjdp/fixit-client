"use client";

import { ReportCard } from "@/components/features/report-card";
import { ReportStatusBadge } from "@/components/features/badges/report-status-badge";
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
  Plus,
  Trash2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { config } from "@/app.config";
import { useState } from "react";
import { useMyReports } from "@/app/api/client/use-my-reports";
import { useCategories } from "@/app/api/client/categories";
import { deleteReport } from "@/app/api/client/reports";
import { MyReport } from "@/types/report";
import { toast } from "sonner";

export default function MyReports() {
  const { data: reports, isLoading, error, mutate } = useMyReports();
  const { data: categories } = useCategories();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpenId, setDialogOpenId] = useState<number | null>(null);

  const getCategoryLabel = (categoryId: number) =>
    categories?.find((c) => Number(c.id) === categoryId)?.label ?? "Ismeretlen";

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
        <Button asChild className="shadow-lg shadow-primary/20">
          <Link href="/client/new" className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Új hiba bejelentése
          </Link>
        </Button>
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
              id={report.id}
              shortDescription={report.shortDescription}
              description={report.description}
              urgency={report.urgency}
              filePath={report.filePath}
              createdAt={report.createdAt}
              categoryLabel={getCategoryLabel(report.categoryId)}
              statusBadges={
                <ReportStatusBadge hasAccepted={report.hasAccepted} />
              }
              stats={
                report.offerCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {report.offerCount} ajánlat
                  </span>
                )
              }
              actions={
                <div className="flex items-center gap-2">
                  {!report.hasAccepted && (
                    <AlertDialog 
                      open={dialogOpenId === report.id} 
                      onOpenChange={(open) => setDialogOpenId(open ? report.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Törlés"
                          disabled={deletingId === report.id}
                          className="h-9 w-9 border-slate-200 dark:border-slate-800 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
                              setDialogOpenId(null);
                              handleDelete(report.id);
                            }}
                            disabled={deletingId === report.id}
                          >
                            Törlés
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <Button variant="outline" asChild className="group/btn h-10 px-6">
                    <Link href={`/client/my-reports/${report.id}`} className="flex items-center gap-2">
                      Részletek
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
