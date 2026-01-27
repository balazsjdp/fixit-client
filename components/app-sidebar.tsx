"use client";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarMenuSkeleton } from "@/components/skeletons/sidebar-menu-skeleton";
import { useAuthContext } from "@/store/auth/auth-store-provider";
import { Button } from "./ui/button";
import { useConfig } from "@/store/config/config-store-provider";

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthContext((s) => s.user);
  const logout = useAuthContext((s) => s.logout);
  const config = useConfig();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex-row items-center py-4">
        <div className="size-8 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl! text-primary">
            build_circle
          </span>
        </div>
        <h2 className="text-[#101418] dark:text-white text-xl font-black leading-tight tracking-tight">
          FixIt
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>Menü</SidebarGroupLabel>
        <SidebarMenu>
          {config ? (
            config.menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuSkeleton />
          )}
        </SidebarMenu>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Fiók</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-2 p-2">
                <p className="text-sm font-semibold">{user.name}</p>
                <Button variant="outline" size="sm" onClick={logout}>
                  Kijelentkezés
                </Button>
              </div>
              {config && (
                <div className="p-2 text-xs text-center text-gray-500">
                  Version: {config.version}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail></SidebarRail>
    </Sidebar>
  );
}
