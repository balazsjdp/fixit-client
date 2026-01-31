import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/user";

export enum UserRole {
  CLIENT,
  PRO,
  ADMIN,
}

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

// 2. Action Típusok - Itt definiálod, mit tud csinálni a store
export type AuthActions = {
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
};

// 3. A teljes Store típus
export type AuthStore = AuthState & { actions: AuthActions };

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
        actions: {
          login: (user: User, token: string) => {
            set({
              user: user,
              token: token,
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
        },
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

export const authStore = createAuthStore();
