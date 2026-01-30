"use client";

import logger from "@/lib/logger";
import { useConfigFromStore } from "@/store/config/config-store-provider";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";
import { useEffect } from "react";

export function AddressForm() {
  const address = useReportForm().address;
  const { setAddress } = useReportActions();
  const config = useConfigFromStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value,
    });
  };

  useEffect(() => {
    if (address.postcode.length === 4 && config?.featureFlags.zipCodeResolver) {
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
        .catch((error) => logger.error("Error fetching city:", error));
    }
  }, [address.postcode, setAddress]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="postcode"
            className="text-sm font-semibold text-muted-foreground"
          >
            Irányítószám
          </label>
          <input
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
          <input
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
        <input
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
        <input
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
