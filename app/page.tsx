"use client";

import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import { useAuth } from "@/components/auth/KeycloakProvider";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Wrench,
  ClipboardList,
  Plus,
} from "lucide-react";

export default function Home() {
  const { keycloak, isReady } = useAuth();
  const isPro = isReady && !!keycloak?.hasRealmRole("pro");
  const { data: profile, error, isLoading } = useMyProfessionalProfile(isPro);

  const isNotRegistered =
    (error as { response?: { status?: number } })?.response?.status === 404;

  if (isLoading) {
    return (
      <main>
        <Skeleton className="h-10 w-72 mb-3" />
        <Skeleton className="h-6 w-96 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </main>
    );
  }

  // User is NOT a professional yet → show role-choice CTAs
  if (isNotRegistered || !profile) {
    return (
      <main>
        <div className="mb-12">
          <h1 className="text-4xl font-black leading-tight tracking-tight mb-2">
            Üdvözöllek a FixIt-ben!
          </h1>
          <p className="text-lg text-muted-foreground">
            Hogyan szeretnéd használni a platformot?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {/* Client CTA */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col gap-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Kliens vagyok</h2>
              <p className="text-sm text-muted-foreground">
                Meghibásodott valami otthon? Adj be egy bejelentést, és
                kapcsolunk össze egy közeli szakemberrel.
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-auto">
              <Link
                href="/client/new"
                className="flex items-center justify-center gap-2 py-3 bg-primary text-background rounded-xl font-semibold hover:bg-primary/90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Új bejelentés
              </Link>
              <Link
                href="/client/my-reports"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:border-primary transition-all text-sm"
              >
                Bejelentéseim megtekintése
              </Link>
            </div>
          </div>

          {/* Professional CTA */}
          <div className="rounded-2xl border border-dashed border-primary/40 p-8 flex flex-col gap-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Szakember vagyok</h2>
              <p className="text-sm text-muted-foreground">
                Regisztrálj szakemberként, és kezdj el közeli munkákat találni a
                saját szakterületeden.
              </p>
            </div>
            <div className="mt-auto">
              <Link
                href="/pro/register"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-primary text-primary hover:bg-primary hover:text-background transition-all"
              >
                Regisztrálás szakemberként
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // User IS a professional → show pro status overview
  const isPending = profile.status === "pending";

  return (
    <main>
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-2">
          Üdvözöllek, {profile.name}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Szakember fiók áttekintése
        </p>
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
            <p
              className={`text-lg font-bold ${
                isPending ? "text-orange-500" : "text-green-600"
              }`}
            >
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
