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
import { createReport } from "@/app/api/client/reports";
import { geocodeAddress } from "@/lib/geocoding";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export default function New() {
  const form = useReportForm();
  const { setDescription, resetForm } = useReportActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let coords = form.coordinates;

      if (!coords) {
        coords = await geocodeAddress(form.address);
      }

      const formData = new FormData();
      for (const key of Object.keys(form) as (keyof typeof form)[]) {
        if (key === "files" || key === "coordinates") {
          continue;
        }

        if (typeof form[key] === "object" && form[key] !== null) {
          formData.append(key, JSON.stringify(form[key]));
        } else if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, (form[key] as string).toString());
        }
      }

      if (coords) {
        formData.append("lat", coords.lat.toString());
        formData.append("lng", coords.lng.toString());
      } else {
        toast.warning(
          "Helyszín nem sikerült meghatározni – a bejelentés koordináták nélkül kerül beküldésre. Szakemberek nem fogják látni a térképen."
        );
      }

      form.files.forEach((file) => {
        formData.append(`files`, file);
      });

      const response = await createReport(formData);
      logger.info(`Report created successfully: ${response}`);
      toast.success("Hiba sikeresen bejelentve!");
      resetForm();
    } catch (error) {
      logger.error(`Error creating report:" ${error}`);
      toast.error("Hiba lépett fel a bejelentés során!");
    }
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
              <Textarea
                className="w-full min-h-[150px] p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Kérjük, fejtse ki a hibát részletesen (pl. A konyhai mosogató alatti cső szivárog, amikor folyik a víz...)"
                value={form.description}
                onChange={(e) => setDescription(e.target.value)}
              ></Textarea>
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
                labels={["Ráér", "Pár napon belül", "Sürgős"]}
                title="Sürgősségi szint"
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
                className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-background rounded-xl font-bold text-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Send className="text-xl" />
                Probléma beküldése
              </button>
              <p className="text-center text-xs text-foreground mt-8 max-w-lg mx-auto">
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
