import { ProRegisterStoreProvider } from "@/store/pro/pro-register-store-provider";
import React from "react";

export default function ProRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProRegisterStoreProvider>{children}</ProRegisterStoreProvider>;
}
