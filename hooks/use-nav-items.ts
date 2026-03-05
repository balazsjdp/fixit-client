import { useAuth } from "@/components/auth/KeycloakProvider";
import { useMyProfessionalProfile } from "@/app/api/client/professionals";
import { IconName } from "lucide-react/dynamic";

export interface NavItem {
  title: string;
  url: string;
  icon: IconName;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

const CLIENT_ITEMS: NavItem[] = [
  { title: "Főoldal", url: "/", icon: "house" },
  { title: "Új bejelentés", url: "/client/new", icon: "octagon-alert" },
  { title: "Bejelentéseim", url: "/client/my-reports", icon: "list" },
  { title: "Legyen szakember", url: "/pro/register", icon: "hard-hat" },
];

const PRO_ITEMS: NavItem[] = [
  { title: "Főoldal", url: "/", icon: "house" },
  { title: "Pro dashboard", url: "/pro", icon: "briefcase" },
  { title: "Ajánlataim", url: "/pro/offers", icon: "file-text" },
];

const ADMIN_CLIENT_ITEMS: NavItem[] = [
  { title: "Főoldal", url: "/", icon: "house" },
  { title: "Új bejelentés", url: "/client/new", icon: "octagon-alert" },
  { title: "Bejelentéseim", url: "/client/my-reports", icon: "list" },
];

const ADMIN_PRO_ITEMS: NavItem[] = [
  { title: "Pro dashboard", url: "/pro", icon: "briefcase" },
  { title: "Ajánlataim", url: "/pro/offers", icon: "file-text" },
];

const ADMIN_ITEMS: NavItem[] = [
  { title: "Admin panel", url: "/admin", icon: "shield-check" },
];

export function useNavItems(): { groups: NavGroup[]; isLoading: boolean } {
  const { keycloak, isReady } = useAuth();
  const { data: pro, isLoading: proLoading } = useMyProfessionalProfile();

  if (!isReady || proLoading) {
    return { groups: [], isLoading: true };
  }

  const isAdmin = keycloak?.hasRealmRole("admin") ?? false;
  const isPro = !!pro;

  if (isAdmin) {
    return {
      groups: [
        { label: "Ügyfél", items: ADMIN_CLIENT_ITEMS },
        { label: "Szakember", items: ADMIN_PRO_ITEMS },
        { label: "Adminisztráció", items: ADMIN_ITEMS },
      ],
      isLoading: false,
    };
  }

  if (isPro) {
    return {
      groups: [{ items: PRO_ITEMS }],
      isLoading: false,
    };
  }

  return {
    groups: [{ items: CLIENT_ITEMS }],
    isLoading: false,
  };
}
