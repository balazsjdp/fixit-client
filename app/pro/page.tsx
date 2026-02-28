"use client";

import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Briefcase, CreditCard } from "lucide-react";

export default function Pro() {
  const { data: profile, error, isLoading } = useMyProfessionalProfile();

  const isNotRegistered = (error as { response?: { status?: number } })?.response?.status === 404;

  if (isLoading) {
    return (
      <main>
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-10" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </main>
    );
  }

  if (isNotRegistered || !profile) {
    return (
      <main>
        <div className="mb-10">
          <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
            Szakember portál
          </h1>
          <p className="text-lg text-muted-foreground">
            Még nem vagy regisztrálva szakemberként.
          </p>
        </div>

        <div className="max-w-lg rounded-2xl border border-dashed border-primary/40 p-10 flex flex-col items-center gap-6 text-center">
          <Briefcase className="w-12 h-12 text-primary/60" />
          <div>
            <h2 className="text-xl font-bold mb-2">Csatlakozz szakemberként</h2>
            <p className="text-sm text-muted-foreground">
              Regisztrálj, és kezdj el közeli munkákat találni a saját
              szakterületeden.
            </p>
          </div>
          <Link
            href="/pro/register"
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-background rounded-xl font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
          >
            Regisztrálás szakemberként
          </Link>
        </div>
      </main>
    );
  }

  const isPending = profile.status === "pending";

  return (
    <main>
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
          Üdvözöllek, {profile.name}!
        </h1>
        <p className="text-lg text-muted-foreground">Szakember profil áttekintése</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4">
          {isPending ? (
            <Clock className="w-8 h-8 text-orange-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Státusz
            </p>
            <p className={`text-lg font-bold ${isPending ? "text-orange-500" : "text-green-600"}`}>
              {isPending ? "Jóváhagyásra vár" : "Jóváhagyott"}
            </p>
            {isPending && (
              <p className="text-xs text-muted-foreground mt-1">
                Az admin hamarosan elbírálja a profilodat.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Kredit egyenleg
            </p>
            <p className="text-lg font-bold">{profile.creditBalance} kredit</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Profil adatok
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Telefon: </span>
              <span className="font-medium">{profile.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sugár: </span>
              <span className="font-medium">{profile.radiusKm} km</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
