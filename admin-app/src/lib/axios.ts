import { ApiResponseError } from "@/types/api.type";

import { queryClient } from "@/lib/query-client";

import { AUTH_SESSION_QUERY_KEY } from "@/auth/auth-query-key";
import axios, { AxiosError, AxiosInstance } from "axios";

let accessToken: string | null = null;
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

let refreshPromise: Promise<string | null> | null = null;

let ensureSessionPromise: Promise<boolean> | null = null;

const REFRESH_BUFFER_SECONDS = 60;
const AUTH_REFRESH_PATH = "/api/auth/refresh";

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
  try {
    const response = await axios.post<{ accessToken: string }>(
      `${import.meta.env.VITE_AXIOS_BASE_URL}/api/auth/refresh`,
      {},
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
      setAccessToken(newToken);
    } else {
      clearAuthAndLogoutServer();
    }
  }, delayMs);
}

export const setAccessToken = (token: string | null) => {
  clearRefreshTimer();
  if (token) {
    accessToken = token;
    interceptedAxios.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
    scheduleProactiveRefresh(token);
  } else {
    accessToken = null;
    delete interceptedAxios.defaults.headers.common["Authorization"];
  }
};

export const setAuthTokens = (newAccessToken: string) => {
  setAccessToken(newAccessToken);
};

export function ensureValidAccessToken(): Promise<boolean> {
  if (!ensureSessionPromise) {
    ensureSessionPromise = ensureValidAccessTokenImpl().finally(() => {
      ensureSessionPromise = null;
    });
  }
  return ensureSessionPromise;
}

async function ensureValidAccessTokenImpl(): Promise<boolean> {
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const exp = payload?.exp;
    if (typeof exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      const refreshAt = exp - REFRESH_BUFFER_SECONDS;
      if (now < refreshAt) {
        scheduleProactiveRefresh(accessToken);
        return true;
      }
    }
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    clearAuthAndLogoutServer();
    return false;
  }
  setAccessToken(newToken);
  return true;
}

export const clearClientAuth = () => {
  clearRefreshTimer();
  refreshPromise = null;
  accessToken = null;
  delete interceptedAxios.defaults.headers.common["Authorization"];
};

export const clearAuthAndLogoutServer = () => {
  clearClientAuth();
  void axios
    .post(
      `${import.meta.env.VITE_AXIOS_BASE_URL}/api/auth/logout`,
      {},
      { withCredentials: true }
    )
    .catch(() => {})
    .finally(() => {
      void queryClient.invalidateQueries({
        queryKey: AUTH_SESSION_QUERY_KEY
      });
    });
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
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    if (originalRequest._retry) {
      clearAuthAndLogoutServer();
      return Promise.reject(error);
    }

    const url =
      typeof originalRequest.url === "string"
        ? originalRequest.url
        : originalRequest.baseURL
          ? `${originalRequest.baseURL}${originalRequest.url ?? ""}`
          : "";
    const isRefreshRequest = url.includes(AUTH_REFRESH_PATH);

    if (isRefreshRequest) {
      clearAuthAndLogoutServer();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    let token: string | null;
    try {
      token = await refreshPromise;
      if (!token) {
        clearAuthAndLogoutServer();
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      setAccessToken(token);
      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
      }
      return interceptedAxios(originalRequest);
    } catch {
      clearAuthAndLogoutServer();
      return Promise.reject(error);
    }
  }
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
