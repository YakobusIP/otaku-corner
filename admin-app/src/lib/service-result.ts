import { handleAxiosError } from "@/lib/axios";

import type { ServiceResult } from "@/types/general.type";

export const ok = <T,>(data: T): ServiceResult<T> => ({ success: true, data });

export const err = (error: unknown): ServiceResult<never> => ({
  success: false,
  error: handleAxiosError(error)
});
