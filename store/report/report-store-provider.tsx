"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { reportStore } from "./report-store";

export const ReportStoreContext = createContext<typeof reportStore | undefined>(
  undefined
);

export const ReportStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  return (
    <ReportStoreContext.Provider value={reportStore}>
      {children}
    </ReportStoreContext.Provider>
  );
};

export const useReportForm = () => {
  const store = useContext(ReportStoreContext);
  if (!store) {
    throw new Error("Missing ReportStoreProvider");
  }
  return useStore(store, (state) => state.form);
};

export const useReportActions = () => {
  const store = useContext(ReportStoreContext);
  if (!store) {
    throw new Error("Missing ReportStoreProvider");
  }
  return useStore(store, (state) => state.actions);
};