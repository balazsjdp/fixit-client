// components/KeycloakProvider.tsx
"use client";

import { useEffect, useState, createContext, useContext } from "react";
import Keycloak from "keycloak-js";
import { setupInterceptors } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KeycloakContext = createContext<any>(null);

export const KeycloakProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const kc = new Keycloak({
      url: "http://localhost:8081/",
      realm: "FixIt",
      clientId: "fixit-nextjs-client",
    });

    kc.init({
      onLoad: "login-required",
      checkLoginIframe: true, // Thi
      pkceMethod: "S256",
      silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
      enableLogging: true,
      token: localStorage.getItem("kc_token") || undefined,
      refreshToken: localStorage.getItem("kc_refreshToken") || undefined,
    })
      .then((auth) => {
        if (auth) {
          // Store them for the next reload
          localStorage.setItem("kc_token", kc.token!);
          localStorage.setItem("kc_refreshToken", kc.refreshToken!);
        }

        setupInterceptors(kc);
        setKeycloak(kc);
        setAuthenticated(auth);
        setIsReady(true);
      })
      .catch((error) => {
        console.error("Failed to initialize Keycloak", error);
        setIsReady(true); // Still set ready to true to unblock UI, even if auth failed
      });
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, isReady }}>
      {
        isReady ? (
          children
        ) : (
          <p>Loading secure session...</p>
        ) /* TODO: Make it look better */
      }
    </KeycloakContext.Provider>
  );
};

export const useAuth = () => useContext(KeycloakContext);
