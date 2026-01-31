import { UserRole } from "@/store/auth/auth-store";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
