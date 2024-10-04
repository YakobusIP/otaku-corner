import interceptedAxios from "@/lib/axios";
import { ApiResponse, MessageResponse } from "@/types/api.type";
import { AxiosError } from "axios";

const BASE_AUTH_URL = "/api/auth";

type LoginResponse = {
  accessToken: string;
};

const login = async (
  pin1: string,
  pin2: string
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await interceptedAxios.post(`${BASE_AUTH_URL}/login`, {
      pin1,
      pin2
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const logout = async (): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.post(`${BASE_AUTH_URL}/logout`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

export { login, logout };
