import { ReportStoreProvider } from "@/store/report/report-store-provider";
import React from "react";

export default function NewReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReportStoreProvider>{children}</ReportStoreProvider>;
}
