import { ApiResponse, MessageResponse } from "@/types/api.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";

const BASE_AUTH_URL = "/api/auth";

type LoginResponse = {
  accessToken: string;
};

const createAuthService = () => {
  const login = async (pin1: string, pin2: string) => {
    try {
      const response = await interceptedAxios.post<ApiResponse<LoginResponse>>(
        `${BASE_AUTH_URL}/login`,
        {
          pin1,
          pin2
        }
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };
  const logout = async () => {
    try {
      const response = await interceptedAxios.post<
        ApiResponse<MessageResponse>
      >(`${BASE_AUTH_URL}/logout`);
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const validateToken = async () => {
    try {
      await interceptedAxios.get<ApiResponse<undefined>>(
        `${BASE_AUTH_URL}/validate-token`
      );
      return undefined;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return { login, logout, validateToken };
};

const authService = createAuthService();

export { authService };
