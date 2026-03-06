"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <main className="container mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-2">
          Admin – Szakemberek
        </h1>
        <p className="text-lg text-muted-foreground">
          Szakemberek jóváhagyása és kredit kezelése.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
            className="rounded-xl font-bold"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : !professionals?.length ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <p className="text-muted-foreground font-medium">
            Nincs találat ebben a kategóriában.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {professionals.map((pro) => {
            const isPending = pro.status === "pending";
            const isExpanded = expandedCreditId === pro.id;
            const isWorking = loadingId === pro.id;

            return (
              <Card
                key={pro.id}
                className="rounded-2xl border-border shadow-sm overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-xl tracking-tight">{pro.name}</h3>
                        <Badge
                          className={`flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border-none ${
                            isPending 
                              ? "bg-orange-500 hover:bg-orange-600" 
                              : "bg-primary hover:bg-primary/90"
                          }`}
                        >
                          {isPending ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {isPending ? "Várólistás" : "Aktív"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium flex flex-wrap gap-x-6 gap-y-1">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">phone</span>
                          {pro.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">map</span>
                          {pro.radiusKm} km sugár
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground font-bold">
                          <span className="material-symbols-outlined text-base">payments</span>
                          {pro.creditBalance} kredit
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isPending && (
                        <Button
                          onClick={() => handleApprove(pro)}
                          disabled={isWorking}
                          className="font-bold bg-green-600 hover:bg-green-600/90 text-white rounded-xl shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {isWorking ? "..." : "Jóváhagyás"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setExpandedCreditId(isExpanded ? null : pro.id);
                          setCreditAmount("");
                          setCreditNote("");
                        }}
                        className="font-bold rounded-xl border-2"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Kredit
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t flex flex-col md:flex-row items-end gap-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="w-full md:w-32 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Összeg
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(e.target.value)}
                          placeholder="pl. 50"
                          className="rounded-xl border-2 font-bold focus-visible:ring-primary h-10"
                        />
                      </div>
                      <div className="w-full md:flex-1 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Megjegyzés
                        </label>
                        <Input
                          type="text"
                          value={creditNote}
                          onChange={(e) => setCreditNote(e.target.value)}
                          placeholder="pl. Bónusz kredit az induláshoz"
                          className="rounded-xl border-2 font-medium focus-visible:ring-primary h-10"
                        />
                      </div>
                      <Button
                        onClick={() => handleAddCredits(pro)}
                        disabled={isWorking || !creditAmount}
                        className="w-full md:w-auto font-black px-8 rounded-xl h-10"
                      >
                        {isWorking ? "..." : "Hozzáadás"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
