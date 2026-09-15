import axios from "axios";
import { API_URL } from "@/config/env";

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "access_token",
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error),
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    // Avoid infinite loops for refresh token route
    if (
      originalRequest.url ===
      "/auth/refresh-token"
    ) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem(
          "refresh_token",
        );

      if (refreshToken) {
        try {
          const res =
            await axios.post(
              `${API_URL}/auth/refresh-token`,
              {
                refreshToken,
              },
            );

          const newAccessToken =
            res.data.accessToken;

          localStorage.setItem(
            "access_token",
            newAccessToken,
          );

          if (
            res.data.refreshToken
          ) {
            localStorage.setItem(
              "refresh_token",
              res.data.refreshToken,
            );
          }

          api.defaults.headers.common.Authorization =
            `Bearer ${newAccessToken}`;

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          return api(
            originalRequest,
          );
        } catch (
        refreshError
        ) {
          localStorage.removeItem(
            "access_token",
          );

          localStorage.removeItem(
            "refresh_token",
          );

          localStorage.removeItem(
            "auth_user",
          );

          return Promise.reject(
            refreshError,
          );
        }
      }

      localStorage.removeItem(
        "access_token",
      );

      localStorage.removeItem(
        "auth_user",
      );
    }

    return Promise.reject(error);
  },
);

export default api;