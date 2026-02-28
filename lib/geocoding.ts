import { Address, Coordinates } from "@/store/report/report-store";
import logger from "@/lib/logger";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

export async function geocodeAddress(
  address: Address
): Promise<Coordinates | null> {
  const { postcode, city, street, houseNumber } = address;

  if (!postcode && !city && !street) {
    return null;
  }

  const query = [houseNumber, street, city, postcode, "Hungary"]
    .filter(Boolean)
    .join(", ");

  try {
    const response = await fetch(
      `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=hu`,
      { headers: { "Accept-Language": "hu" } }
    );
    const data = await response.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    logger.error({ err }, "Nominatim geocoding error");
  }

  return null;
}

export async function reverseGeocode(
  coords: Coordinates
): Promise<Partial<Address> | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_REVERSE_URL}?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "hu" } }
    );
    const data = await response.json();

    if (!data.address) return null;

    const a = data.address;
    return {
      postcode: a.postcode ?? "",
      city: a.city ?? a.town ?? a.village ?? a.suburb ?? "",
      street: [a.road, a.pedestrian, a.footway].find(Boolean) ?? "",
      houseNumber: a.house_number ?? "",
    };
  } catch (err) {
    logger.error({ err }, "Nominatim reverse geocoding error");
    return null;
  }
}
