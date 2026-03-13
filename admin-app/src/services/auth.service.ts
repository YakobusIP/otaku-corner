import { MessageResponse } from "@/types/api.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";

const BASE_AUTH_URL = "/api/auth";

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const createAuthService = () => {
  const loginRaw = async (pin1: string, pin2: string) => {
    const response = await interceptedAxios.post<LoginResponse>(
      `${BASE_AUTH_URL}/login`,
      {
        pin1,
        pin2
      }
    );
    return response.data;
  };

  const logout = async () => {
    const response = await interceptedAxios.post<MessageResponse>(
      `${BASE_AUTH_URL}/logout`
    );
    return response.data;
  };

  const validateTokenRaw = async () => {
    await interceptedAxios.get(`${BASE_AUTH_URL}/me`);
  };

  return { loginRaw, logout, validateTokenRaw };
};

const authService = createAuthService();

const login = async (
  pin1: string,
  pin2: string
): Promise<ServiceResult<LoginResponse>> => {
  try {
    return { success: true, data: await authService.loginRaw(pin1, pin2) };
  } catch (error) {
    return { success: false, error: handleAxiosError(error) };
  }
};

const validateToken = async (): Promise<ServiceResult<undefined>> => {
  try {
    await authService.validateTokenRaw();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: handleAxiosError(error) };
  }
};

export { authService, login, validateToken };
