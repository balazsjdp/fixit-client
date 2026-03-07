"use client";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarMenuSkeleton } from "@/components/skeletons/sidebar-menu-skeleton";
import { Button } from "./ui/button";
import { useConfigFromStore } from "@/store/config/config-store-provider";
import { DynamicIcon } from "lucide-react/dynamic";
import { useNavItems, NavGroup } from "@/hooks/use-nav-items";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  User as UserIcon,
  Shield,
  HardHat,
  Wrench,
} from "lucide-react";
import { useAuth } from "./auth/KeycloakProvider";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";

function NavGroupSection({ group }: { group: NavGroup }) {
  return (
    <SidebarGroup>
      {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
      <SidebarMenu>
        {group.items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <DynamicIcon
                  name={item.icon}
                  className="text-primary"
                  size={24}
                />
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const config = useConfigFromStore();
  const { groups, isLoading } = useNavItems();
  const { keycloak, isReady } = useAuth();
  const { data: pro, isLoading: proLoading } = useMyProfessionalProfile();

  const isGrouped = groups.length > 1;

  const user = keycloak?.idTokenParsed;
  const firstName = user?.given_name || "";
  const lastName = user?.family_name || "";
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    user?.preferred_username ||
    "Felhasználó";
  const initials = (lastName[0] || "") + (firstName[0] || "");

  const isAdmin = keycloak?.hasRealmRole("admin");
  const isPro = !!pro;

  let roleLabel = "Ügyfél";
  let RoleIcon = UserIcon;

  if (isAdmin) {
    roleLabel = "Adminisztrátor";
    RoleIcon = Shield;
  } else if (isPro) {
    roleLabel = "Szakember";
    RoleIcon = HardHat;
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex-row items-center py-4 px-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-[#101418] dark:text-white text-xl font-black leading-tight tracking-tight flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Wrench className="w-5 h-5" />
          </div>
          FixIt
        </h2>
      </SidebarHeader>
      <SidebarContent>
        {isLoading || proLoading ? (
          <SidebarGroup>
            <SidebarGroupLabel>Menü</SidebarGroupLabel>
            <React.Suspense fallback={<SidebarMenuSkeleton />}>
              <SidebarMenuSkeleton />
            </React.Suspense>
          </SidebarGroup>
        ) : isGrouped ? (
          groups.map((group) => (
            <NavGroupSection key={group.label} group={group} />
          ))
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Menü</SidebarGroupLabel>
            <SidebarMenu>
              {groups[0]?.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <DynamicIcon
                        name={item.icon}
                        className="text-primary"
                        size={24}
                      />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail></SidebarRail>
      <SidebarFooter className="p-4 border-t border-slate-100 dark:border-slate-800">
        {isReady && keycloak?.authenticated && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-1">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {initials || <UserIcon size={16} />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {fullName}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <RoleIcon size={10} className="text-primary" />
                  {roleLabel}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => keycloak.logout()}
              className="w-full justify-start gap-2 h-9 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Kijelentkezés
            </Button>

            {config && (
              <div className="text-[10px] text-center text-slate-400 font-medium">
                Verzió: {config.version}
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
