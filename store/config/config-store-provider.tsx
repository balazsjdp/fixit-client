"use client";

import { useEffect, createContext, useContext } from "react";
import { useStore } from "zustand";
import { configStore, ConfigState, createConfigStore } from "./config-store";
import { getConfig } from "@/app/api/client/config";

export const ConfigStoreContext = createContext<typeof configStore | undefined>(
  undefined
);

export const ConfigStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getConfig();
        configStore.getState().actions.setConfig(config);
      } catch (error) {
        console.error("Failed to fetch config", error);
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigStoreContext.Provider value={configStore}>
      {children}
    </ConfigStoreContext.Provider>
  );
};

export const useConfig = () => {
  const store = useContext(ConfigStoreContext);
  if (!store) {
    throw new Error("Missing ConfigStoreProvider");
  }
  return useStore(store, (state) => state.config);
};

export const useConfigActions = () => {
  const store = useContext(ConfigStoreContext);
  if (!store) {
    throw new Error("Missing ConfigStoreProvider");
  }
  return useStore(store, (state) => state.actions);
};
