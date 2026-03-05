"use client";

import logger from "@/lib/logger";
import { useConfigFromStore } from "@/store/config/config-store-provider";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { reverseGeocode } from "@/lib/geocoding";
import { useDebouncedGeocoding } from "@/hooks/use-debounced-geocoding";

export function AddressForm() {
  const address = useReportForm().address;
  const coordinates = useReportForm().coordinates;
  const { setAddress, setCoordinates } = useReportActions();
  const config = useConfigFromStore();
  const [gpsLoading, setGpsLoading] = useState(false);
  const { geocoding, skipNextGeocode } = useDebouncedGeocoding(address, (coords) => {
    setCoordinates(coords);
  });

  const handleGpsClick = () => {
    if (!navigator.geolocation) {
      logger.error("Geolocation is not supported by this browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoordinates(coords);

        const resolved = await reverseGeocode(coords);
        if (resolved) {
          skipNextGeocode.current = true;
          setAddress(resolved);
        }

        setGpsLoading(false);
      },
      (err) => {
        logger.error({ err }, "GPS error");
        setGpsLoading(false);
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value,
    });
  };

  useEffect(() => {
    if (
      address.postcode.length === 4 &&
      config?.featureFlags?.zipCodeResolver
    ) {
      fetch(`https://hur.webmania.cc/zips/${address.postcode}.json`)
        .then((response) => response.json())
        .then((data) => {
          if (data.zips && data.zips.length > 0) {
            setAddress({
              ...address,
              city: data.zips[0].name,
            });
          }
        })
        .catch((err) => logger.error({ err }, "Error fetching city"));
    }
  }, [address.postcode, setAddress]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGpsClick}
        disabled={gpsLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all text-sm font-semibold text-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {gpsLoading || geocoding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : coordinates ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        {gpsLoading
          ? "Helymeghatározás..."
          : geocoding
          ? "Cím alapján helyzet meghatározása..."
          : coordinates
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
