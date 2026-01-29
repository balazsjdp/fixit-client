"use client";
import { AddressForm } from "@/components/features/address-form";
import { CategorySelector } from "@/components/features/category-selector";
import { ImageUpload } from "@/components/features/image-upload";
import { SliderSelector } from "@/components/features/slider-selector";
import logger from "@/lib/logger";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";

export default function New() {
  const form = useReportForm();
  const { setDescription } = useReportActions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug(form);
  };

  return (
    <>
      <main>
        <div className="mb-10">
          <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
            Hiba bejelentése
          </h1>
          <p className="text-lg text-muted-foreground">
            Írja le a problémát, és mi keresünk Önnek egy közeli szakembert.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div className="space-y-10">
            <section>
              <CategorySelector />
              {form.category && (
                <p className="mt-4">
                  Kiválasztott kategória: {form.category.label}
                </p>
              )}
            </section>
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
                2. Fotók a hibáról
              </h3>
              <ImageUpload />
            </section>
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
                3. Hiba részletei
              </h3>
              <textarea
                className="w-full min-h-[150px] p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Kérjük, fejtse ki a hibát részletesen (pl. A konyhai mosogató alatti cső szivárog, amikor folyik a víz...)"
                value={form.description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </section>
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
                4. Sürgősségi szint
              </h3>
              <SliderSelector
                max={100}
                step={50}
                labels={["Ma", "48 Óra", "Rugalmas"]}
                title="Sürgősségi szint"
                outputLabel={(value) => {
                  if (value === 0) return "Ma";
                  if (value === 50) return "48 Óra";
                  return "Rugalmas";
                }}
              />
            </section>
            <section>
              <h3 className="dark:text-white text-sm font-bold uppercase tracking-wider mb-5">
                4. HELYSZÍN MEGADÁSA
              </h3>
              <AddressForm />
            </section>
            <section>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-xl font-bold text-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined">send</span>
                Probléma beküldése
              </button>
              <p className="text-center text-xs text-gray-400 mt-8 max-w-lg mx-auto">
                Az gombra kattintva elfogadja az általános szerződési
                feltételeket, és lehetővé teszi a helyi szakemberek számára a
                kérés részleteinek megtekintését.
              </p>
            </section>
          </div>
        </form>
      </main>
    </>
  );
}
