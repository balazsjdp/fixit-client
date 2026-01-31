"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { type StoreApi, useStore } from "zustand";

import { type AuthStore, createAuthStore, AuthState } from "./auth-store";

export const AuthStoreContext = createContext<StoreApi<AuthStore> | null>(null);

export interface AuthStoreProviderProps {
  children: ReactNode;
  initState?: Partial<AuthState>;
}

export const AuthStoreProvider = ({ children }: AuthStoreProviderProps) => {
  const [store] = useState(() => createAuthStore());

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
};

export const useAuthStore = () => {
  const authStoreContext = useContext(AuthStoreContext);
  if (!authStoreContext) {
    throw new Error(`useAuthStore must be used within AuthStoreProvider`);
  }

  return useStore(authStoreContext, (state) => state);
};

export const useAuthActions = () => {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("Missing AuthStoreProvider");
  }
  return useStore(store, (state) => state.actions);
};
