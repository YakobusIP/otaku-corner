import { ApiResponseError } from "@/types/api.type";

import axios, { AxiosError, AxiosInstance } from "axios";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

const REFRESH_BUFFER_SECONDS = 60;

const interceptedAxios: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true
});

type JwtPayload = {
  exp?: number;
  iat?: number;
  sub?: number;
  type?: string;
  createdAt?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const response = await axios.post<{ accessToken: string }>(
      `${import.meta.env.VITE_AXIOS_BASE_URL}/api/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );
    return response.data.accessToken;
  } catch {
    return null;
  }
}

function clearRefreshTimer() {
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
}

function scheduleProactiveRefresh(token: string) {
  clearRefreshTimer();
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") return;

  const now = Math.floor(Date.now() / 1000);
  const refreshAt = exp - REFRESH_BUFFER_SECONDS;
  const delayMs = Math.max(0, (refreshAt - now) * 1000);

  refreshTimeoutId = setTimeout(async () => {
    refreshTimeoutId = null;
    const newToken = await refreshAccessToken();
    if (newToken) {
      accessToken = newToken;
      interceptedAxios.defaults.headers.common["Authorization"] =
        `Bearer ${newToken}`;
      scheduleProactiveRefresh(newToken);
    } else {
      clearAuth();
    }
  }, delayMs);
}

export const setAccessToken = (token: string | null) => {
  clearRefreshTimer();
  if (token) {
    accessToken = token;
    interceptedAxios.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  } else {
    accessToken = null;
    delete interceptedAxios.defaults.headers.common["Authorization"];
  }
};

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
};

/**
 * Sets both access and refresh tokens and schedules proactive refresh.
 * Call this after login with the full auth response.
 */
export const setAuthTokens = (
  newAccessToken: string,
  newRefreshToken?: string | null
) => {
  setAccessToken(newAccessToken);
  if (newRefreshToken) {
    refreshToken = newRefreshToken;
  }
  scheduleProactiveRefresh(newAccessToken);
};

/**
 * Clears all auth state and cancels any pending refresh.
 */
export const clearAuth = () => {
  clearRefreshTimer();
  accessToken = null;
  refreshToken = null;
  delete interceptedAxios.defaults.headers.common["Authorization"];
};

interceptedAxios.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interceptedAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);

export default interceptedAxios;

export const handleAxiosError = (error: unknown) => {
  console.error(error);
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as
      | ApiResponseError
      | { message?: string | string[] };
    if (typeof (data as ApiResponseError).error === "string")
      return (data as ApiResponseError).error;
    const msg = (data as { message?: string | string[] }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg) && msg.length) return msg[0];
  }
  return "There was a problem with your request.";
};
