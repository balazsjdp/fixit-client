import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { ModeToggle } from "@/components/ui/modeToggle";

import { AuthStoreProvider } from "@/store/auth/auth-store-provider";
import { ConfigStoreProvider } from "@/store/config/config-store-provider";
import { Toaster } from "@/components/ui/sonner";
import { KeycloakProvider } from "@/components/auth/KeycloakProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixIt",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head></head>

      <body>
        <KeycloakProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthStoreProvider>
              <ConfigStoreProvider>
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 place-content-between">
                      <SidebarTrigger className="-ml-1" />
                      <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                      />
                      <ModeToggle />
                    </header>
                    <div className="flex flex p-6 justify-center flex-col">
                      {children}
                    </div>
                  </SidebarInset>
                </SidebarProvider>
              </ConfigStoreProvider>
            </AuthStoreProvider>
          </ThemeProvider>
        </KeycloakProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
