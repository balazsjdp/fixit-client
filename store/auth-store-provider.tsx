"use client";

import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useState,
} from "react";
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

export const useAuthContext = <T,>(selector: (store: AuthStore) => T): T => {
  const storeContext = useContext(AuthStoreContext);

  if (!storeContext) {
    throw new Error(`useAuthContext must be use within AuthStoreProvider`);
  }

  return useStore(storeContext, selector);
};

export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const authStoreContext = useContext(AuthStoreContext);
  if (!authStoreContext) {
    throw new Error(`useAuthStore must be used within AuthStoreProvider`);
  }

  return useStore(authStoreContext, selector);
};
