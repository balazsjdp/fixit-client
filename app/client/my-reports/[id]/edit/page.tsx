"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CategorySelector } from "@/components/features/category-selector";
import { AddressForm } from "@/components/features/address-form";
import { SliderSelector } from "@/components/features/slider-selector";
import { Textarea } from "@/components/ui/textarea";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";
import { useMyReports } from "@/app/api/client/use-my-reports";
import { useCategories } from "@/app/api/client/categories";
import { updateReport } from "@/app/api/client/reports";
import { geocodeAddress } from "@/lib/geocoding";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function EditReport({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reportId = Number(id);
  const router = useRouter();

  const { data: reports, isLoading } = useMyReports();
  const { data: categories } = useCategories();
  const form = useReportForm();
  const { setDescription, initForm, resetForm } = useReportActions();

  const report = reports?.find((r) => r.id === reportId);

  useEffect(() => {
    if (report && categories) {
      const category =
        categories.find((c) => c.id === String(report.categoryId)) ?? null;
      initForm({ category, description: report.description, urgency: report.urgency });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id, !!categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      toast.error("Kérjük, válasszon kategóriát!");
      return;
    }
    try {
      let coords = form.coordinates;
      if (!coords) {
        coords = await geocodeAddress(form.address);
      }
      await updateReport(reportId, {
        description: form.description,
        urgency: form.urgency,
        categoryId: Number(form.category.id),
        address: form.address,
        lat: coords?.lat ?? 0,
        lng: coords?.lng ?? 0,
      });
      toast.success("Bejelentés sikeresen módosítva!");
      resetForm();
      router.push("/client/my-reports");
    } catch {
      toast.error("Hiba a módosítás során!");
    }
  };

  if (isLoading) {
    return (
      <main>
        <p className="text-muted-foreground">Betöltés...</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main>
        <p className="text-muted-foreground">Bejelentés nem található.</p>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
          Bejelentés szerkesztése
        </h1>
        <p className="text-lg text-muted-foreground">
          Módosítsa a bejelentés adatait. A cím megadása kötelező.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12"
      >
        <div className="space-y-10">
          <section>
            <CategorySelector />
          </section>
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
              2. Hiba részletei
            </h3>
            <Textarea
              className="w-full min-h-[150px] p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Kérjük, fejtse ki a hibát részletesen..."
              value={form.description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>
        </div>

        <div className="space-y-10">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
              3. Sürgősségi szint
            </h3>
            <SliderSelector
              max={100}
              step={50}
              labels={["Ráér", "Pár napon belül", "Sürgős"]}
              title="Sürgősségi szint"
              outputLabel={(value) => {
                if (value === 0) return "Ráér";
                if (value === 50) return "Pár napon belül";
                return "Sürgős";
              }}
              labelColor={(value) => {
                if (value < 50) return "bg-green-600";
                if (value >= 50 && value < 100) return "bg-orange-600";
                return "bg-red-600";
              }}
            />
          </section>
          <section>
            <h3 className="dark:text-white text-sm font-bold uppercase tracking-wider mb-5">
              4. Helyszín megadása
            </h3>
            <AddressForm />
          </section>
          <section>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-background rounded-xl font-bold text-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Send className="text-xl" />
              Módosítás mentése
            </button>
          </section>
        </div>
      </form>
    </main>
  );
}
