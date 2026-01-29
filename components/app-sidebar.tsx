"use client";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { useConfigFromStore } from "@/store/config/config-store-provider";
import { DynamicIcon } from "lucide-react/dynamic";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthContext((s) => s.user);
  const logout = useAuthContext((s) => s.logout);
  const config = useConfigFromStore();

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
          <React.Suspense fallback={<SidebarMenuSkeleton />}>
            {config?.menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <DynamicIcon
                      name={item.icon}
                      color="var(--color-primary)"
                      size={48}
                    />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </React.Suspense>
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail></SidebarRail>
      <SidebarFooter>
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
      </SidebarFooter>
    </Sidebar>
  );
}
