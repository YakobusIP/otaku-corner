import axios, { AxiosError, AxiosInstance } from "axios";
import type { AxiosRequestConfig } from "axios";

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry: boolean;
}

const interceptedAxios: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true
});

export const setAccessToken = (token: string | null) => {
  if (token) {
    accessToken = token;
    interceptedAxios.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  } else {
    console.debug("in here");
    delete interceptedAxios.defaults.headers.common["Authorization"];
  }
};

/**
 * Processes the queue of failed requests after token refresh.
 * @param error Any error that occurred during the refresh.
 * @param token The new access token.
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
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
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("auth/login") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (error.response.status === 401) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
              }
              return interceptedAxios(originalRequest);
            })
            .catch((err) => {
              Promise.reject(err);
            });
        }
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios
          .get(
            `${import.meta.env.VITE_AXIOS_BASE_URL}/api/auth/refresh-token`,
            {
              withCredentials: true
            }
          )
          .then((response) => {
            const newAccessToken = response.data.accessToken;
            setAccessToken(newAccessToken);
            processQueue(null, newAccessToken);
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] =
                `Bearer ${newAccessToken}`;
            }
            resolve(interceptedAxios(originalRequest));
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default interceptedAxios;
