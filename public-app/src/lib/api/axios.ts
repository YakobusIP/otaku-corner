import { ApiResponseError } from "@/types/api.type";

import axios, { AxiosError } from "axios";

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message ?? "Not found");
    this.name = "NotFoundError";
  }
}

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AXIOS_BASE_URL
});

export const handleAxiosError = (error: unknown): never | string => {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
  if (error instanceof AxiosError && error.response?.data) {
    if (error.response.status === 404) {
      throw new NotFoundError();
    }

    const data = error.response.data as
      | ApiResponseError
      | { message?: string | string[] };
    if (typeof (data as ApiResponseError).error === "string") {
      return (data as ApiResponseError).error;
    }
    const msg = (data as { message?: string | string[] }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg) && msg.length) return msg[0];
  }
  return "There was a problem with your request.";
};
