import { MessageResponse } from "@/types/api.type";
import type { ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { ok, err } from "@/lib/service-result";

const BASE_AUTH_URL = "/api/auth";

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

const createAuthService = () => {
  const login = async (
    pin1: string,
    pin2: string
  ): Promise<ServiceResult<LoginResponse>> => {
    try {
      const response = await interceptedAxios.post<LoginResponse>(
        `${BASE_AUTH_URL}/login`,
        {
          pin1,
          pin2
        }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const logout = async (): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.post<MessageResponse>(
        `${BASE_AUTH_URL}/logout`
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  const validateToken = async (): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.get(`${BASE_AUTH_URL}/me`);
      return ok(undefined);
    } catch (error) {
      return err(error);
    }
  };

  return { login, logout, validateToken };
};

export const authService = createAuthService();
