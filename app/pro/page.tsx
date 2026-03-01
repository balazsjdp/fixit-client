"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadiusSlider } from "@/components/features/radius-slider";
import { ProReportCard } from "@/components/features/pro-report-card";
import { ProLocationSection } from "@/components/features/pro-location-section";
import {
  useMyProfessionalProfile,
  updateProRadius,
} from "@/app/api/client/professionals";
import { useNearbyReports } from "@/app/api/client/use-nearby-reports";
import { useCategories } from "@/app/api/client/categories";

const ProDashboardMap = dynamic(
  () =>
    import("@/components/features/pro-dashboard-map").then(
      (m) => m.ProDashboardMap
    ),
  { ssr: false }
);

export default function ProDashboard() {
  const router = useRouter();
  const {
    data: pro,
    isLoading: proLoading,
    error: proError,
    mutate: mutatePro,
  } = useMyProfessionalProfile();
  const {
    data: reports,
    isLoading: reportsLoading,
    mutate: mutateReports,
  } = useNearbyReports();
  const { data: categories } = useCategories();

  const [radius, setRadius] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state with fetched profile (once)
  useEffect(() => {
    if (pro) {
      if (radius === null) setRadius(pro.radiusKm);
      if (center === null) setCenter([pro.lat, pro.lng]);
    }
  }, [pro, radius, center]);

  // Redirect to register if no profile found
  useEffect(() => {
    if (proError) {
      router.replace("/pro/register");
    }
  }, [proError, router]);

  const handleRadiusChange = useCallback(
    (value: number) => {
      setRadius(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await updateProRadius(value);
          await mutatePro();
          await mutateReports();
        } finally {
          setSaving(false);
        }
      }, 800);
    },
    [mutatePro, mutateReports]
  );

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setCenter([lat, lng]);
    mutatePro();
  }, [mutatePro]);

  if (proLoading || (!proError && (radius === null || center === null))) {
    return (
      <div className="flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (pro?.status === "pending") {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2">Regisztráció folyamatban</h1>
          <p className="text-muted-foreground">
            A profilod jóváhagyásra vár. Értesítünk, amint aktiválják a
            fiókodat.
          </p>
        </div>
      </div>
    );
  }

  // proError triggers redirect via useEffect — render nothing while it fires
  if (!pro) return null;

  const reportList = reports ?? [];
  // radius and center are guaranteed non-null here (loading guard catches the null cases above)
  const radiusValue = radius as number;
  const centerValue = center as [number, number];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-background">
        <h1 className="text-xl font-black tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Coins className="w-4 h-4" />
          <span data-testid="credit-balance">{pro.creditBalance} kredit</span>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 max-w-4xl mx-auto w-full">
        {/* Controls row: location + radius */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProLocationSection
            initialLat={pro.lat}
            initialLng={pro.lng}
            onLocationChange={handleLocationChange}
          />
          <RadiusSlider
            value={radiusValue}
            onChange={handleRadiusChange}
            saving={saving}
          />
        </div>

        {/* Map */}
        <div className="h-72 md:h-96 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <ProDashboardMap
            center={centerValue}
            radiusKm={radiusValue}
            reports={reportList}
            categories={categories ?? []}
            highlightedId={highlightedId}
            onPinClick={setHighlightedId}
          />
        </div>

        {/* Report list */}
        <div>
          <p
            className="text-sm text-muted-foreground font-medium mb-3"
            data-testid="report-count"
          >
            {reportsLoading
              ? "Bejelentések betöltése..."
              : `${reportList.length} bejelentés a közeledben`}
          </p>

          {reportsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : reportList.length === 0 ? (
            <p
              className="text-center text-muted-foreground py-8 text-sm"
              data-testid="no-reports"
            >
              Nincs bejelentés a közelben.
            </p>
          ) : (
            <div className="space-y-3">
              {reportList.map((report) => (
                <ProReportCard
                  key={report.id}
                  report={report}
                  category={categories?.find(
                    (c) => String(c.id) === String(report.categoryId)
                  )}
                  highlighted={highlightedId === report.id}
                  onMouseEnter={() => setHighlightedId(report.id)}
                  onMouseLeave={() => setHighlightedId(null)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
