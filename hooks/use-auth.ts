import { useStore } from "zustand";
import { createAuthStore, AuthStore } from "../store/auth-store";

// 1. Létrehozzuk a store egyetlen példányát (singleton)
const authStore = createAuthStore();

// 2. Létrehozzuk a React hook-ot
// Ez lehetővé teszi, hogy a komponensek feliratkozzanak a store változásaira
export const useAuth = () => useStore<AuthStore>(authStore);

// 3. Exportáljuk a store példányt is, ha React kontextuson kívül is szükség lenne rá
export { authStore };
