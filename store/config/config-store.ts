import { IconName } from "lucide-react/dynamic";
import { createStore } from "zustand";

export interface Config {
  version: string;
  menuItems: MenuItem[];
}

export interface MenuItem {
  title: string;
  url: string;
  icon: IconName;
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
