import { createStore } from "zustand";

export interface Config {
  version: string;
  featureFlags: Record<string, boolean>;
}

export interface ConfigState {
  config: Config | null;
  actions: {
    setConfig: (config: Config) => void;
  };
}

export const createConfigStore = () =>
  createStore<ConfigState>((set) => ({
    config: null,
    actions: {
      setConfig: (config) => set({ config }),
    },
  }));

export const configStore = createConfigStore();
