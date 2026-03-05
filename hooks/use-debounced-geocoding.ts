import { useEffect, useRef, useState } from "react";
import { geocodeAddress } from "@/lib/geocoding";
import logger from "@/lib/logger";

interface AddressInput {
  postcode: string;
  city: string;
  street: string;
  houseNumber: string;
}

export function useDebouncedGeocoding(
  address: AddressInput,
  onSuccess: (coords: { lat: number; lng: number }) => Promise<void> | void
): { geocoding: boolean; skipNextGeocode: React.MutableRefObject<boolean> } {
  const [geocoding, setGeocoding] = useState(false);
  const skipNextGeocode = useRef(false);

  useEffect(() => {
    if (skipNextGeocode.current) {
      skipNextGeocode.current = false;
      return;
    }
    if (!address.postcode && !address.city && !address.street) return;

    setGeocoding(true);
    const timer = setTimeout(async () => {
      try {
        const coords = await geocodeAddress(address);
        if (coords) {
          await onSuccess(coords);
        }
      } catch (err) {
        logger.error({ err }, "Failed to auto-geocode address");
      } finally {
        setGeocoding(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      setGeocoding(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.postcode, address.city, address.street, address.houseNumber]);

  return { geocoding, skipNextGeocode };
}
