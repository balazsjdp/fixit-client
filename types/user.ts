import { UserRole } from "@/store/auth/auth-store";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
