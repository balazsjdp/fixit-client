import { config } from "@/app.config";
import { UserRole } from "@/store/auth/auth-store";
import { useAuthActions } from "@/store/auth/auth-store-provider";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: config.apiBaseUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type TokenClaims = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get("refresh_token");
        const res = await axios.post("http://localhost:8080/refresh", {
          refresh_token: refreshToken,
        });
        if (res.status === 200) {
          const { token, refresh_token } = res.data;
          Cookies.set("token", token, { expires: 1 / 24 });
          Cookies.set("refresh_token", refresh_token, { expires: 7 });
          const decodedToken = jwtDecode<TokenClaims>(token);
          useAuthActions().login(
            {
              id: decodedToken.id,
              email: decodedToken.email,
              firstName: decodedToken.firstName,
              lastName: decodedToken.lastName,
              role: UserRole.CLIENT, // TODO: Add role to token claims
            },
            token
          );
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (e) {
        useAuthActions().logout();
        Cookies.remove("token");
        Cookies.remove("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
