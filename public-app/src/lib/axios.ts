import { ApiResponseError } from "@/types/api.type";

import axios, { AxiosError } from "axios";
import { notFound } from "next/navigation";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AXIOS_BASE_URL
});

export const handleAxiosError = (error: unknown) => {
  console.error(error);
  if (error instanceof AxiosError && error.response?.data) {
    if (error.response.status === 404) {
      notFound();
    }

    const responseData = error.response.data as ApiResponseError;
    return responseData.error;
  }
  return "There was a problem with your request.";
};
