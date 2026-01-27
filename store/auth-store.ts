import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";

export enum UserRole {
  CLIENT,
  PRO,
  ADMIN,
}

// 1. Típusok (User & State)
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

// 2. Action Típusok - Itt definiálod, mit tud csinálni a store
export type AuthActions = {
  login: (email: string) => void; // Egyszerűsítettem: csak emailt vár a szimulációhoz
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
};

// 3. A teljes Store típus
export type AuthStore = AuthState & AuthActions;

// 4. Kezdőállapot
export const defaultInitState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

// 5. Store Factory
export const createAuthStore = (initState: AuthState = defaultInitState) => {
  return createStore<AuthStore>()(
    persist(
      (set) => ({
        ...initState,

        // --- SZIMULÁCIÓS ACTIONÖK ---
        login: (email: string) => {
          // Call backend to login here
          // Set fake user now
          const fakeUser: User = {
            id: "123",
            name: "Teszt Elek",
            email: email,
            role: UserRole.ADMIN,
          };

          set({
            user: fakeUser,
            token: "fake-jwt-token-xyz",
            isAuthenticated: true,
          });
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        },

        setLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  );
};
