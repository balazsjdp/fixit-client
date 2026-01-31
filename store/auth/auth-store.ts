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
  login: (email: string) => void; // Egyszerűsítettem: csak emailt vár a szimulációhoz
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
};

// 3. A teljes Store típus
export type AuthStore = AuthState & { actions: AuthActions };

// 4. Kezdőállapot
const elekUser = {
  id: "tesztelek",
  name: "Teszt Elek",
  email: "elek@teszt.hu",
  role: UserRole.CLIENT,
};
export const defaultInitState: AuthState = {
  user: elekUser,
  token: "teszt-token",
  isAuthenticated: true,
  isLoading: false,
};

// 5. Store Factory
export const createAuthStore = (initState: AuthState = defaultInitState) => {
  return createStore<AuthStore>()(
    persist(
      (set) => ({
        ...initState,
        actions: {
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
