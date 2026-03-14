"use client";

import { useConfigFromStore } from "@/store/config/config-store-provider";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";
import { Input } from "../ui/input";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useAddressDetection } from "@/hooks/use-address-detection";

export function AddressForm() {
  const address = useReportForm().address;
  const { setAddress, setCoordinates } = useReportActions();
  const config = useConfigFromStore();

  const { gpsLoading, geocoding, detected, handleDetect } = useAddressDetection({
    address,
    onAddressChange: setAddress,
    onCoordsChange: setCoordinates,
    zipResolverEnabled: config?.featureFlags?.zipCodeResolver ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleDetect}
        disabled={gpsLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all text-sm font-semibold text-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {gpsLoading || geocoding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : detected ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        {gpsLoading
          ? "Helymeghatározás..."
          : geocoding
          ? "Cím alapján helyzet meghatározása..."
          : detected
          ? "Helyzet rögzítve"
          : "Helyzet automatikus meghatározása"}
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="postcode"
            className="text-sm font-semibold text-muted-foreground"
          >
            Irányítószám
          </label>
          <Input
            id="postcode"
            name="postcode"
            value={address.postcode}
            onChange={handleChange}
            className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            placeholder="2085"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="city"
            className="text-sm font-semibold text-muted-foreground"
          >
            Város
          </label>
          <Input
            id="city"
            name="city"
            value={address.city}
            onChange={handleChange}
            className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            placeholder="Pilisvörösvár"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="street"
          className="text-sm font-semibold text-muted-foreground"
        >
          Közterület neve
        </label>
        <Input
          id="street"
          name="street"
          value={address.street}
          onChange={handleChange}
          className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          placeholder="Fő út"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="houseNumber"
          className="text-sm font-semibold text-muted-foreground"
        >
          Házszám
        </label>
        <Input
          id="houseNumber"
          name="houseNumber"
          value={address.houseNumber}
          onChange={handleChange}
          className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          placeholder="12."
        />
      </div>
    </div>
  );
}
