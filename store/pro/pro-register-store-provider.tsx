"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { proRegisterStore } from "./pro-register-store";

export const ProRegisterStoreContext = createContext<
  typeof proRegisterStore | undefined
>(undefined);

export const ProRegisterStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ProRegisterStoreContext.Provider value={proRegisterStore}>
      {children}
    </ProRegisterStoreContext.Provider>
  );
};

export const useProRegisterForm = () => {
  const store = useContext(ProRegisterStoreContext);
  if (!store) throw new Error("Missing ProRegisterStoreProvider");
  return useStore(store, (state) => state.form);
};

export const useProRegisterActions = () => {
  const store = useContext(ProRegisterStoreContext);
  if (!store) throw new Error("Missing ProRegisterStoreProvider");
  return useStore(store, (state) => state.actions);
};
