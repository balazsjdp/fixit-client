"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@/store/auth/auth-store-provider";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { User } from "@/types/user";
import logger from "@/lib/logger";
import { config } from "@/app.config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(config.apiBaseUrl + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      logger.debug(`Login response status: ${res.ok}`);

      if (res.ok) {
        const { access_token, refresh_token } = await res.json();
        logger.debug(`Received token: ${access_token}`);
        const decodedToken = jwtDecode<User>(access_token);
        logger.debug(`Decoded token: ${JSON.stringify(decodedToken)}`);
        login(decodedToken, access_token);
        logger.debug("User logged in successfully");
        Cookies.set("token", access_token, { expires: 1 / 24 }); // Expires in 1 hour
        Cookies.set("refresh_token", refresh_token, { expires: 7 }); // Expires in 7 days
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError(JSON.stringify(error));
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
