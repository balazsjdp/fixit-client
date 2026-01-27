"use client";

import { useEffect, createContext, useContext } from "react";
import { useStore } from "zustand";
import { configStore, ConfigState, createConfigStore } from "./config-store";
import { useConfig } from "@/app/api/client/config";

export const ConfigStoreContext = createContext<typeof configStore | undefined>(
  undefined
);

export const ConfigStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: config, error } = useConfig();
  const { setConfig } = configStore.getState().actions;

  useEffect(() => {
    if (config) {
      setConfig(config);
    }
  }, [config, setConfig]);

  if (error) {
    console.error("Failed to fetch config", error);
  }

  return (
    <ConfigStoreContext.Provider value={configStore}>
      {children}
    </ConfigStoreContext.Provider>
  );
};

export const useConfigFromStore = () => {
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
