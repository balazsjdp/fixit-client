"use client";

import { useAuth } from "@/components/auth/KeycloakProvider";
import {
  useAdminProfessionals,
  approveProfessional,
  addCredits,
} from "@/app/api/client/admin";
import { Professional } from "@/types/professional";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { useState } from "react";
import { CheckCircle2, Clock, ShieldX, CreditCard, ChevronDown, ChevronUp } from "lucide-react";

type FilterType = "" | "pending" | "approved";

export default function AdminPage() {
  const { keycloak, isReady } = useAuth();
  const [filter, setFilter] = useState<FilterType>("pending");
  const [expandedCreditId, setExpandedCreditId] = useState<number | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data: professionals, isLoading, mutate } = useAdminProfessionals(filter);

  if (!isReady) {
    return <p>Loading secure session...</p>;
  }

  if (!keycloak?.hasRealmRole("admin")) {
    return (
      <main>
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <ShieldX className="w-16 h-16 text-destructive/60" />
          <h1 className="text-2xl font-bold">Hozzáférés megtagadva</h1>
          <p className="text-muted-foreground">
            Ez az oldal csak adminisztrátorok számára érhető el.
          </p>
        </div>
      </main>
    );
  }

  const handleApprove = async (pro: Professional) => {
    setLoadingId(pro.id);
    try {
      await approveProfessional(pro.id);
      toast.success(`${pro.name} jóváhagyva!`);
      mutate();
    } catch (err) {
      logger.error({ err }, "Failed to approve professional");
      toast.error("Hiba a jóváhagyás során!");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddCredits = async (pro: Professional) => {
    const amount = parseInt(creditAmount, 10);
    if (!amount || amount <= 0) {
      toast.error("Adj meg érvényes összeget!");
      return;
    }
    setLoadingId(pro.id);
    try {
      await addCredits(pro.id, amount, creditNote || undefined);
      toast.success(`${amount} kredit hozzáadva – ${pro.name}`);
      setCreditAmount("");
      setCreditNote("");
      setExpandedCreditId(null);
      mutate();
    } catch (err) {
      logger.error({ err }, "Failed to add credits");
      toast.error("Hiba a kredit hozzáadása során!");
    } finally {
      setLoadingId(null);
    }
  };

  const FILTERS: { label: string; value: FilterType }[] = [
    { label: "Jóváhagyásra vár", value: "pending" },
    { label: "Jóváhagyottak", value: "approved" },
    { label: "Összes", value: "" },
  ];

  return (
    <main>
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
          Admin – Szakemberek
        </h1>
        <p className="text-lg text-muted-foreground">
          Szakemberek jóváhagyása és kredit kezelése.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              filter === f.value
                ? "bg-foreground text-background border-foreground"
                : "bg-primary/5 border-gray-200 dark:border-gray-700 hover:border-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !professionals?.length ? (
        <p className="text-muted-foreground py-12 text-center">
          Nincs találat ebben a kategóriában.
        </p>
      ) : (
        <div className="space-y-4">
          {professionals.map((pro) => {
            const isPending = pro.status === "pending";
            const isExpanded = expandedCreditId === pro.id;
            const isWorking = loadingId === pro.id;

            return (
              <div
                key={pro.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{pro.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isPending
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {isPending ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {isPending ? "Jóváhagyásra vár" : "Jóváhagyott"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pro.phone} · {pro.radiusKm} km sugár ·{" "}
                      <span className="font-medium text-foreground">
                        {pro.creditBalance} kredit
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <button
                        onClick={() => handleApprove(pro)}
                        disabled={isWorking}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isWorking ? "..." : "Jóváhagyás"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setExpandedCreditId(isExpanded ? null : pro.id);
                        setCreditAmount("");
                        setCreditNote("");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-primary transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      Kredit
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="flex items-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Összeg (kredit)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        placeholder="pl. 10"
                        className="w-28 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Megjegyzés (opcionális)
                      </label>
                      <input
                        type="text"
                        value={creditNote}
                        onChange={(e) => setCreditNote(e.target.value)}
                        placeholder="pl. Induló kredit"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => handleAddCredits(pro)}
                      disabled={isWorking || !creditAmount}
                      className="px-4 py-2 bg-primary text-background rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {isWorking ? "..." : "Hozzáad"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
