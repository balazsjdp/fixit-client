"use client";

import { ReportStatusBadge } from "@/components/features/badges/report-status-badge";
import { CategoryBadge } from "@/components/features/badges/category-badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
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
import { Plus, Trash2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMyReports } from "@/app/api/client/use-my-reports";
import { useCategories } from "@/app/api/client/categories";
import { deleteReport } from "@/app/api/client/reports";
import { toast } from "sonner";
import { DataCard } from "@/components/ui/data-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyReports() {
  const { data: reports, isLoading, error, mutate } = useMyReports();
  const { data: categories } = useCategories();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpenId, setDialogOpenId] = useState<number | null>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-destructive/5 rounded-2xl border-2 border-dashed border-destructive/20">
          <p className="text-destructive font-medium">
            Hiba a bejelentések betöltése során.
          </p>
        </div>
      ) : !reports?.length ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
          <p className="text-muted-foreground text-lg font-medium">
            Még nincs bejelentett hibája.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report) => {
            const category = categories?.find((c) => Number(c.id) === report.categoryId);
            return (
              <DataCard
                key={report.id}
                id={report.id}
                title={report.shortDescription}
                statusBadge={<ReportStatusBadge status={report.statusSlug} />}
                categoryBadge={<CategoryBadge label={category?.label ?? "Ismeretlen"} />}
                urgencyBadge={<UrgencyBadge urgency={report.urgency} />}
                date={report.createdAt}
                detailsUrl={`/reports/${report.id}`}
                actions={
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {report.offerCount} ajánlat
                    </div>
                    {!report.hasAccepted && (
                      <AlertDialog
                        open={dialogOpenId === report.id}
                        onOpenChange={(open) =>
                          setDialogOpenId(open ? report.id : null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === report.id}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
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
                              Ez a művelet nem vonható vissza.
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
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
