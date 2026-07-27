import type { AppSetting, UpsertAppSettingPayload } from "@/types/settings.type";
import type { ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { err, ok } from "@/lib/service-result";

const BASE_SETTINGS_URL = "/api/settings";

const createSettingsService = () => {
  const list = async (): Promise<ServiceResult<AppSetting[]>> => {
    try {
      const response = await interceptedAxios.get<AppSetting[]>(
        BASE_SETTINGS_URL
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const getByKey = async (key: string): Promise<ServiceResult<AppSetting>> => {
    try {
      const response = await interceptedAxios.get<AppSetting>(
        `${BASE_SETTINGS_URL}/${encodeURIComponent(key)}`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const upsert = async (
    key: string,
    payload: UpsertAppSettingPayload
  ): Promise<ServiceResult<AppSetting>> => {
    try {
      const response = await interceptedAxios.put<AppSetting>(
        `${BASE_SETTINGS_URL}/${encodeURIComponent(key)}`,
        payload
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  return {
    list,
    getByKey,
    upsert
  };
};

export const settingsService = createSettingsService();
