"use client";

import { useParams, useRouter } from "next/navigation";
import { useCategories } from "@/app/api/client/categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  Clock,
  Send,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import useSWR from "swr";
import api from "@/lib/api";
import { config } from "@/app.config";
import { useState } from "react";
import { OfferModal } from "@/components/features/offer-modal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function ProReportDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const { data: report, error, isLoading, mutate } = useSWR(
    id ? `/api/reports/${id}` : null,
    fetcher
  );
  const { data: categories } = useCategories();

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-destructive">
          Hiba a bejelentés betöltésekor
        </h2>
        <p className="text-muted-foreground mb-8">
          Lehet, hogy a bejelentés már nem elérhető vagy nincs jogosultsága megtekinteni.
        </p>
        <Button asChild>
          <Link href="/pro">Vissza a dashboardra</Link>
        </Button>
      </main>
    );
  }

  const category = categories?.find((c) => Number(c.id) === report.categoryId);

  const getUrgencyInfo = (u: number) => {
    if (u >= 100) return { label: "Azonnali", color: "bg-red-500 text-white" };
    if (u >= 50) return { label: "Sürgős", color: "bg-orange-500 text-white" };
    return { label: "Normál", color: "bg-blue-500 text-white" };
  };

  const urgency = getUrgencyInfo(report.urgency);

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 w-fit -ml-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Vissza
        </Button>
        <div className="flex gap-3">
             <Button 
                onClick={() => setOfferModalOpen(true)}
                className="shadow-lg shadow-primary/20 flex items-center gap-2"
             >
                <Send className="w-4 h-4" />
                Ajánlat küldése
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card border-2 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={`rounded-full px-3 ${urgency.color}`}>
                {urgency.label}
              </Badge>
              {category && (
                <Badge variant="outline" className="rounded-full px-3 flex items-center gap-1">
                  <span>{category.label}</span>
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
              {report.shortDescription}
            </h1>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 mt-1 text-primary shrink-0" />
                <p className="text-foreground whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            </div>
          </section>

          {report.filePath && (
            <section className="bg-card border-2 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Csatolt kép</h3>
              <div className="aspect-video relative rounded-xl overflow-hidden border">
                <img
                  src={`${config.apiBaseUrl}${report.filePath}`}
                  alt="Bejelentés képe"
                  className="object-cover w-full h-full"
                />
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
              <Clock className="w-5 h-5" />
              Időzítés
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                Beküldve: {format(new Date(report.createdAt), "yyyy. MMMM d. HH:mm", { locale: hu })}
              </span>
            </div>
          </section>

          <section className="bg-card border-2 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Helyszín
            </h3>
            <p className="text-sm">
              {report.address ? (
                 <>
                    {JSON.parse(report.address).city}, {JSON.parse(report.address).street}
                 </>
              ) : "Helyszín nem megadott"}
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">
               A pontos címet csak az ajánlat elfogadása után láthatod.
            </p>
          </section>
        </div>
      </div>

      {offerModalOpen && (
        <OfferModal
          reportId={Number(id)}
          open={offerModalOpen}
          onOpenChange={setOfferModalOpen}
          onSuccess={() => {
              mutate();
              router.push("/pro/offers");
          }}
        />
      )}
    </main>
  );
}
