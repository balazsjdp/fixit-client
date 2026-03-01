import { ReportStoreProvider } from "@/store/report/report-store-provider";

export default function EditReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReportStoreProvider>{children}</ReportStoreProvider>;
}
