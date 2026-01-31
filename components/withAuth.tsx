"use client";

import { useAuthStore } from "@/store/auth/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();
    const { token, refreshToken, setAuth } = useAuthStore();

    useEffect(() => {
      const tokenFromCookie = Cookies.get("token");
      const refreshTokenFromCookie = Cookies.get("refresh_token");

      if (!tokenFromCookie || !refreshTokenFromCookie) {
        router.replace("/login");
      } else if (!token || !refreshToken) {
        // If the store is not populated, but cookies are present, repopulate the store
        // This can happen if the user refreshes the page
        // You might want to decode the token here to get user info
        // For simplicity, we are not doing it here
        // setAuth(tokenFromCookie, refreshTokenFromCookie, { id: "", email: "" });
      }
    }, [token, refreshToken, router, setAuth]);

    if (!token || !refreshToken) {
      // You can show a loading spinner here
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
