import { config } from "@/app.config";
import axios from "axios";
import Keycloak from "keycloak-js";

const api = axios.create({
  baseURL: config.apiBaseUrl,
});

let interceptorsAttached = false;
// Inject the Keycloak instance (passed from your Auth Provider)
export const setupInterceptors = (keycloak: Keycloak) => {
  if (interceptorsAttached) return;
  api.interceptors.request.use(
    async (config) => {
      if (keycloak && keycloak.token) {
        try {
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        } catch (error) {
          console.error("Failed to refresh token", error);
          keycloak.login();
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 2. Response Interceptor: Handle 401 Unauthorized
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("Token might be expired, attempting to refresh...");
        try {
          await keycloak.updateToken(5);
          originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
          return api(originalRequest); // Retry the original request
        } catch (err) {
          keycloak.login();
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );
  interceptorsAttached = true;
};

export default api;
