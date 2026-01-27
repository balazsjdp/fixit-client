"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";

import { type AuthStore, createAuthStore, AuthState } from "./auth-store";

export const AuthStoreContext = createContext<StoreApi<AuthStore> | null>(
  null
);

export interface AuthStoreProviderProps {
  children: ReactNode;
  initState?: Partial<AuthState>;
}

export const AuthStoreProvider = ({
  children,
  initState,
}: AuthStoreProviderProps) => {
  const storeRef = useRef<StoreApi<AuthStore>>();
  if (!storeRef.current) {
    storeRef.current = createAuthStore({
        ...initState,
    });
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
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
