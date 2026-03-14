"use client";

import { useEffect, useState } from "react";
import { reverseGeocode } from "@/lib/geocoding";
import { useDebouncedGeocoding } from "@/hooks/use-debounced-geocoding";
import logger from "@/lib/logger";

export interface AddressFields {
  postcode: string;
  city: string;
  street: string;
  houseNumber: string;
}

interface UseAddressDetectionOptions {
  address: AddressFields;
  onAddressChange: (fields: Partial<AddressFields>) => void;
  onCoordsChange: (coords: { lat: number; lng: number }) => Promise<void> | void;
  zipResolverEnabled: boolean;
}

export function useAddressDetection({
  address,
  onAddressChange,
  onCoordsChange,
  zipResolverEnabled,
}: UseAddressDetectionOptions): {
  gpsLoading: boolean;
  geocoding: boolean;
  detected: boolean;
  handleDetect: () => void;
  skipNextGeocode: React.MutableRefObject<boolean>;
  markDetected: () => void;
} {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [detected, setDetected] = useState(false);

  const { geocoding, skipNextGeocode } = useDebouncedGeocoding(
    address,
    async (coords) => {
      await onCoordsChange(coords);
      setDetected(true);
    }
  );

  useEffect(() => {
    if (address.postcode.length === 4 && zipResolverEnabled) {
      fetch(`https://hur.webmania.cc/zips/${address.postcode}.json`)
        .then((r) => r.json())
        .then((data) => {
          if (data.zips?.length > 0) {
            onAddressChange({ city: data.zips[0].name });
          }
        })
        .catch((err) => logger.error({ err }, "Zip lookup error"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.postcode, zipResolverEnabled]);

  const handleDetect = () => {
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
        try {
          await onCoordsChange(coords);
          setDetected(true);
        } catch (err) {
          logger.error({ err }, "Failed to apply GPS coordinates");
        }

        const resolved = await reverseGeocode(coords);
        if (resolved) {
          skipNextGeocode.current = true;
          onAddressChange(resolved);
        }

        setGpsLoading(false);
      },
      (err) => {
        logger.error({ err }, "GPS error");
        setGpsLoading(false);
      }
    );
  };

  return { gpsLoading, geocoding, detected, handleDetect, skipNextGeocode, markDetected: () => setDetected(true) };
}
