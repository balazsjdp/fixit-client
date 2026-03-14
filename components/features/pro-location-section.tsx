"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { MapPin, Loader2, CheckCircle2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { reverseGeocode, geocodeAddress } from "@/lib/geocoding";
import { updateProLocation } from "@/app/api/client/professionals";
import { useConfigFromStore } from "@/store/config/config-store-provider";
import logger from "@/lib/logger";
import { useAddressDetection, AddressFields } from "@/hooks/use-address-detection";

interface ProLocationSectionProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

export function ProLocationSection({ initialLat, initialLng, onLocationChange, className }: ProLocationSectionProps) {
  const config = useConfigFromStore();
  const [address, setAddress] = useState<AddressFields>({
    postcode: "",
    city: "",
    street: "",
    houseNumber: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const { gpsLoading, geocoding, detected, handleDetect, skipNextGeocode, markDetected } = useAddressDetection({
    address,
    onAddressChange: (fields) => setAddress((prev) => ({ ...prev, ...fields })),
    onCoordsChange: async (coords) => {
      await updateProLocation(coords.lat, coords.lng);
      onLocationChange(coords.lat, coords.lng);
    },
    zipResolverEnabled: config?.featureFlags?.zipCodeResolver ?? false,
  });

  // Reverse-geocode the initial position on mount
  useEffect(() => {
    reverseGeocode({ lat: initialLat, lng: initialLng }).then((addr) => {
      if (addr) {
        skipNextGeocode.current = true;
        setAddress({
          postcode: addr.postcode ?? "",
          city: addr.city ?? "",
          street: addr.street ?? "",
          houseNumber: addr.houseNumber ?? "",
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLat, initialLng]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    setSaveLoading(true);
    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        await updateProLocation(coords.lat, coords.lng);
        onLocationChange(coords.lat, coords.lng);
        markDetected();
      }
    } catch (err) {
      logger.error({ err }, "Failed to geocode/save address");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className={className ?? "bg-primary/5 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4"}>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold uppercase tracking-wider">
          Az én helyzetem
        </span>
      </div>

      {/* GPS detect button */}
      <button
        type="button"
        onClick={handleDetect}
        disabled={gpsLoading || geocoding}
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

      {/* Manual address fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pro-postcode" className="text-xs font-semibold text-muted-foreground">
            Irányítószám
          </label>
          <Input
            id="pro-postcode"
            name="postcode"
            value={address.postcode}
            onChange={handleChange}
            placeholder="2085"
            className="rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pro-city" className="text-xs font-semibold text-muted-foreground">
            Város
          </label>
          <Input
            id="pro-city"
            name="city"
            value={address.city}
            onChange={handleChange}
            placeholder="Pilisvörösvár"
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pro-street" className="text-xs font-semibold text-muted-foreground">
          Közterület neve
        </label>
        <Input
          id="pro-street"
          name="street"
          value={address.street}
          onChange={handleChange}
          placeholder="Fő út"
          className="rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pro-houseNumber" className="text-xs font-semibold text-muted-foreground">
          Házszám
        </label>
        <Input
          id="pro-houseNumber"
          name="houseNumber"
          value={address.houseNumber}
          onChange={handleChange}
          placeholder="12."
          className="rounded-lg"
        />
      </div>

      {/* Save address button */}
      <Button
        type="button"
        onClick={handleSaveAddress}
        disabled={saveLoading || (!address.city && !address.postcode)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold"
      >
        {saveLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saveLoading ? "Mentés..." : "Cím mentése"}
      </Button>
    </div>
  );
}
