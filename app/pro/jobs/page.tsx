"use client";

import { useProJobs } from "@/app/api/client/jobs";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/features/badges/urgency-badge";
import { Briefcase } from "lucide-react";
import { JobStatus } from "@/types/job";
import { DataCard } from "@/components/ui/data-card";
import { Skeleton } from "@/components/ui/skeleton";

const statusMap: Record<
  JobStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [JobStatus.InProgress]: { label: "Folyamatban", variant: "secondary" },
  [JobStatus.PendingCompletion]: { label: "Visszaigazolásra vár", variant: "default" },
  [JobStatus.Completed]: { label: "Elvégezve", variant: "outline" },
  [JobStatus.Cancelled]: { label: "Visszavonva", variant: "destructive" },
  [JobStatus.NoShow]: { label: "Nem jelent meg", variant: "destructive" },
  [JobStatus.Disputed]: { label: "Vitás", variant: "destructive" },
};

export default function ProJobsPage() {
  const { data: jobs, isLoading, error } = useProJobs();

  return (
    <main>
      <div className="mb-10 flex flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
            Vállalt munkáim
          </h1>
          <p className="text-lg text-muted-foreground">
            Kövesse nyomon folyamatban lévő és elvégzett munkáit.
          </p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
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
            Hiba történt a munkák betöltésekor.
          </p>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const status = statusMap[job.status] ?? {
              label: job.status,
              variant: "outline" as const,
            };
            return (
              <DataCard
                key={job.id}
                id={job.id}
                title={job.shortDescription}
                statusBadge={<Badge variant={status.variant}>{status.label}</Badge>}
                urgencyBadge={<UrgencyBadge urgency={job.urgency} />}
                date={job.createdAt}
                price={job.price}
                travelFee={job.travelFee}
                personName={`Ügyfél: ${job.clientUserId.slice(0, 8)}…`}
                role="pro"
                detailsUrl={`/pro/jobs/${job.id}`}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
          <p className="text-muted-foreground text-lg font-medium">
            Még nincsenek vállalt munkáid.
          </p>
        </div>
      )}
    </main>
  );
}
