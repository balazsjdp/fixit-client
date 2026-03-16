"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Clock, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadiusSlider } from "@/components/features/radius-slider";
import { ProReportCard } from "@/components/features/pro-report-card";
import { ProLocationSection } from "@/components/features/pro-location-section";
import { NotificationToggle } from "@/components/features/notification-toggle";
import { OfferModal } from "@/components/features/offer-modal";
import { ProfessionalCard } from "@/components/features/professional-card";
import {
  useMyProfessionalProfile,
  updateProRadius,
  updateProNotificationPreference,
} from "@/app/api/client/professionals";
import { useAuth } from "@/components/auth/KeycloakProvider";
import { Button } from "@/components/ui/button";
import { useNearbyReports } from "@/app/api/client/use-nearby-reports";
import { useProJobs } from "@/app/api/client/use-pro-jobs";
import { useMyOffers } from "@/app/api/client/use-my-offers";
import { useCategories } from "@/app/api/client/categories";
import { OfferStatusBadge } from "@/components/features/badges/offer-status-badge";
import { ReportStatusBadge } from "@/components/features/badges/report-status-badge";
import { CategoryBadge } from "@/components/features/badges/category-badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
import { DataCard } from "@/components/ui/data-card";

const ProDashboardMap = dynamic(
  () =>
    import("@/components/features/pro-dashboard-map").then(
      (m) => m.ProDashboardMap
    ),
  { ssr: false }
);

export default function ProDashboard() {
  const router = useRouter();
  const { keycloak } = useAuth();
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
  const { data: jobs, isLoading: jobsLoading } = useProJobs();
  const { data: offers, isLoading: offersLoading } = useMyOffers();
  const { data: categories } = useCategories();

  const [radius, setRadius] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifyToggling, setNotifyToggling] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [offerModalReportId, setOfferModalReportId] = useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"discovery" | "offers" | "jobs">("discovery");
  const [jobsFilter, setJobsFilter] = useState<"active" | "completed">("active");

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

  const handleToggleNotification = useCallback(async (value: boolean) => {
    setNotifyToggling(true);
    try {
      await updateProNotificationPreference(value);
      await mutatePro();
    } finally {
      setNotifyToggling(false);
    }
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
          <p className="text-muted-foreground mb-6">
            A profilod jóváhagyásra vár. Értesítünk, amint aktiválják a
            fiókodat.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Vissza a főoldalra
            </Button>
            <Button
              variant="ghost"
              onClick={() => keycloak?.logout()}
              className="w-full text-muted-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Kijelentkezés
            </Button>
          </div>
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
    <main>
      {/* Page header */}
      <div className="mb-8 flex flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Kezeld a közelben lévő bejelentéseket és ajánlataidat.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Coins className="w-4 h-4" />
            <span data-testid="credit-balance">{pro.creditBalance} kredit</span>
          </div>
          <ProfessionalCard
            name={pro.name}
            avgRating={pro.avgRating}
            ratingCount={pro.ratingCount}
            badges={pro.badges}
          />
        </div>
      </div>

      {/* Two-column layout: left = controls + map, right = report list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column */}
        <div className="space-y-4">
          <div className="bg-primary/5 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            <ProLocationSection
              initialLat={pro.lat}
              initialLng={pro.lng}
              onLocationChange={handleLocationChange}
              className="p-5 space-y-4"
            />
            <RadiusSlider
              value={radiusValue}
              onChange={handleRadiusChange}
              saving={saving}
              className="p-5"
            />
            <div className="p-5">
              <NotificationToggle
                enabled={pro.notifyEmail}
                onToggle={handleToggleNotification}
                isLoading={notifyToggling}
              />
            </div>
          </div>

          <div className="isolate h-72 lg:h-96 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
            <ProDashboardMap
              center={centerValue}
              radiusKm={radiusValue}
              reports={reportList}
              categories={categories ?? []}
              highlightedId={highlightedId}
              onPinClick={setHighlightedId}
            />
          </div>
        </div>

        {/* Right column: tabs */}
        <div>
          {/* Tab selector */}
          <div
            className="flex gap-1 bg-muted/40 rounded-xl p-1 mb-4"
            data-testid="dashboard-tabs"
          >
            <button
              data-testid="tab-discovery"
              onClick={() => setActiveTab("discovery")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "discovery"
                  ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Felfedezés
              {!reportsLoading && (
                <span
                  data-testid="report-count-badge"
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "discovery"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {reportList.length}
                </span>
              )}
            </button>
            <button
              data-testid="tab-offers"
              onClick={() => setActiveTab("offers")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "offers"
                  ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ajánlataim
              {!offersLoading && (
                <span
                  data-testid="offers-count-badge"
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "offers"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {(offers ?? []).filter((o) => o.status === "pending").length}
                </span>
              )}
            </button>
            <button
              data-testid="tab-jobs"
              onClick={() => setActiveTab("jobs")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "jobs"
                  ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Munkáim
              {!jobsLoading && (
                <span
                  data-testid="jobs-count-badge"
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "jobs"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {(jobs ?? []).filter((j) =>
                    ["assigned", "pending_completion"].includes(j.reportStatusSlug)
                  ).length}
                </span>
              )}
            </button>
          </div>

          {/* Felfedezés tab */}
          {activeTab === "discovery" && (
            <>
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
                      onOffer={setOfferModalReportId}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Ajánlataim tab */}
          {activeTab === "offers" && (
            <>
              {offersLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                  ))}
                </div>
              ) : (() => {
                const pendingAndRejected = (offers ?? []).filter(
                  (o) => o.status === "pending" || o.status === "rejected"
                );
                return pendingAndRejected.length === 0 ? (
                  <p
                    className="text-center text-muted-foreground py-8 text-sm"
                    data-testid="no-offers"
                  >
                    Nincs várakozó ajánlatod.
                  </p>
                ) : (
                  <div className="space-y-4" data-testid="offers-list">
                    {pendingAndRejected.map((offer) => {
                      const category = categories?.find(
                        (c) => String(c.id) === String(offer.categoryId)
                      );
                      return (
                        <DataCard
                          key={offer.id}
                          id={offer.id}
                          title={offer.shortDescription}
                          statusBadge={<OfferStatusBadge status={offer.status} />}
                          categoryBadge={<CategoryBadge label={category?.label ?? "Ismeretlen"} />}
                          urgencyBadge={<UrgencyBadge urgency={offer.urgency} />}
                          date={offer.createdAt}
                          price={offer.estimatedPrice}
                          travelFee={offer.travelFee}
                          detailsUrl={`/reports/${offer.reportId}`}
                        />
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}

          {/* Munkáim tab */}
          {activeTab === "jobs" && (
            <>
              {/* Active / Completed sub-selector */}
              <div
                className="inline-flex gap-1 bg-muted/30 border border-border rounded-lg p-0.5 mb-4"
                data-testid="jobs-filter"
              >
                <button
                  data-testid="filter-active"
                  onClick={() => setJobsFilter("active")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    jobsFilter === "active"
                      ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Aktuális
                </button>
                <button
                  data-testid="filter-completed"
                  onClick={() => setJobsFilter("completed")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    jobsFilter === "completed"
                      ? "bg-white dark:bg-slate-900 shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Elvégzett
                </button>
              </div>

              {jobsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                  ))}
                </div>
              ) : (() => {
                const filtered = (jobs ?? []).filter((j) =>
                  jobsFilter === "active"
                    ? ["assigned", "pending_completion"].includes(j.reportStatusSlug)
                    : j.reportStatusSlug === "completed"
                );
                return filtered.length === 0 ? (
                  <p
                    className="text-center text-muted-foreground py-8 text-sm"
                    data-testid="no-jobs"
                  >
                    {jobsFilter === "active"
                      ? "Nincs aktív munkád."
                      : "Még nincs elvégzett munkád."}
                  </p>
                ) : (
                  <div className="space-y-4" data-testid="jobs-list">
                    {filtered.map((job) => {
                      const category = categories?.find(
                        (c) => String(c.id) === String(job.categoryId)
                      );
                      return (
                        <DataCard
                          key={job.id}
                          id={job.id}
                          title={job.shortDescription}
                          statusBadge={<ReportStatusBadge status={job.reportStatusSlug} />}
                          categoryBadge={<CategoryBadge label={category?.label ?? "Ismeretlen"} />}
                          urgencyBadge={<UrgencyBadge urgency={job.urgency} />}
                          date={job.createdAt}
                          price={job.estimatedPrice}
                          travelFee={job.travelFee}
                          personName={job.clientName}
                          role="client"
                          location={
                            job.address
                              ? `${job.address.city}, ${job.address.street}`
                              : undefined
                          }
                          detailsUrl={`/reports/${job.reportId}`}
                        />
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Offer modal – rendered once at dashboard level, shared across all report cards */}
      {offerModalReportId !== null && (
        <OfferModal
          reportId={offerModalReportId}
          open={offerModalReportId !== null}
          onOpenChange={(open) => {
            if (!open) setOfferModalReportId(null);
          }}
          onSuccess={mutateReports}
        />
      )}
    </main>
  );
}
