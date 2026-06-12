import type { ServiceResult } from "@/types/general.type";

import { handleAxiosError } from "@/lib/axios";

export const ok = <T>(data: T): ServiceResult<T> => ({ success: true, data });

export const err = (error: unknown): ServiceResult<never> => ({
  success: false,
  error: handleAxiosError(error)
});
