"use client";

import { ProCategorySelector } from "@/components/features/pro-category-selector";
import { Input } from "@/components/ui/input";
import logger from "@/lib/logger";
import {
  useProRegisterForm,
  useProRegisterActions,
} from "@/store/pro/pro-register-store-provider";
import { registerProfessional } from "@/app/api/client/professionals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, Send } from "lucide-react";

const RADIUS_OPTIONS = [5, 10, 20, 50] as const;

export default function ProRegister() {
  const form = useProRegisterForm();
  const { setName, setPhone, setRadiusKm, setCoordinates, resetForm } =
    useProRegisterActions();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGpsClick = () => {
    if (!navigator.geolocation) {
      toast.error("A böngésző nem támogatja a helymeghatározást.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsLoading(false);
      },
      (err) => {
        logger.error({ err }, "GPS error");
        toast.error("Nem sikerült a helymeghatározás.");
        setGpsLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.categoryIds.length === 0) {
      toast.error("Legalább egy kategóriát válassz ki!");
      return;
    }

    setSubmitting(true);
    try {
      await registerProfessional({
        name: form.name,
        phone: form.phone,
        categoryIds: form.categoryIds,
        radiusKm: form.radiusKm,
        lat: form.coordinates?.lat,
        lng: form.coordinates?.lng,
      });
      toast.success("Regisztráció elküldve! Az admin hamarosan jóváhagyja.");
      resetForm();
      router.push("/pro");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) {
        toast.error("Már regisztrált szakemberként.");
        router.push("/pro");
      } else {
        logger.error({ err }, "Professional registration failed");
        toast.error("Hiba történt a regisztráció során!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
          Szakember regisztráció
        </h1>
        <p className="text-lg text-muted-foreground">
          Regisztrálj szakemberként, és kezdj el közeli munkákat találni.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12"
      >
        <div className="space-y-10">
          <section>
            <ProCategorySelector />
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
              2. Személyes adatok
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Teljes név
                </label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Kiss Péter"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Telefonszám
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+36201234567"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
              3. Munkavállalási sugár
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mekkora körzetben vállalsz munkát?
            </p>
            <div className="grid grid-cols-4 gap-3">
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadiusKm(km)}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                    form.radiusKm === km
                      ? "border-primary bg-foreground text-background"
                      : "border-gray-200 dark:border-gray-700 bg-primary/5 hover:border-primary"
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
              4. Saját helyszín
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              A GPS-koordináta alapján számítjuk ki, hogy melyik bejelentések
              közel vannak hozzád.
            </p>
            <button
              type="button"
              onClick={handleGpsClick}
              disabled={gpsLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all text-sm font-semibold text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gpsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : form.coordinates ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {gpsLoading
                ? "Helymeghatározás..."
                : form.coordinates
                ? `Helyzet rögzítve (${form.coordinates.lat.toFixed(4)}, ${form.coordinates.lng.toFixed(4)})`
                : "Helyzet automatikus meghatározása"}
            </button>
          </section>

          <section>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-background rounded-xl font-bold text-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className="text-xl" />
              )}
              {submitting ? "Küldés..." : "Regisztráció beküldése"}
            </button>
            <p className="text-center text-xs text-foreground mt-8 max-w-lg mx-auto">
              A regisztrációd jóváhagyásra kerül egy admin által. Addig nem
              jelensz meg a keresési eredményekben.
            </p>
          </section>
        </div>
      </form>
    </main>
  );
}
