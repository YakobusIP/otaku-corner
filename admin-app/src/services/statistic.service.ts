import {
  AllTimeStatistic,
  AuthorConsumption,
  GenreConsumption,
  MediaConsumption,
  MediaProgress,
  StudioConsumption,
  ThemeConsumption
} from "@/types/statistic.type";
import type { ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { ok, err } from "@/lib/service-result";
import { STATISTICS_VIEW } from "@/lib/enums";

const BASE_STATISTIC_URL = "/api/statistic";

const createStatisticService = () => {
  const fetchYearRange = async (): Promise<ServiceResult<number[]>> => {
    try {
      const response = await interceptedAxios.get<number[]>(
        `${BASE_STATISTIC_URL}/year-range`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchMediaConsumption = async (
    view: STATISTICS_VIEW,
    year?: string
  ): Promise<ServiceResult<MediaConsumption[]>> => {
    try {
      let yearParams: string | undefined;
      if (view === STATISTICS_VIEW.MONTHLY) {
        yearParams = year;
      }
      const response = await interceptedAxios.get<MediaConsumption[]>(
        `${BASE_STATISTIC_URL}/media-consumption`,
        {
          params: { view: view.toLowerCase(), year: yearParams }
        }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchMediaProgress = async (
    media: "anime" | "manga" | "lightNovel"
  ): Promise<ServiceResult<MediaProgress[]>> => {
    try {
      const response = await interceptedAxios.get<MediaProgress[]>(
        `${BASE_STATISTIC_URL}/media-progress`,
        { params: { media } }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchGenreConsumption = async (): Promise<
    ServiceResult<GenreConsumption[]>
  > => {
    try {
      const response = await interceptedAxios.get<GenreConsumption[]>(
        `${BASE_STATISTIC_URL}/genre-consumption`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchStudioConsumption = async (): Promise<
    ServiceResult<StudioConsumption[]>
  > => {
    try {
      const response = await interceptedAxios.get<StudioConsumption[]>(
        `${BASE_STATISTIC_URL}/studio-consumption`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchThemeConsumption = async (): Promise<
    ServiceResult<ThemeConsumption[]>
  > => {
    try {
      const response = await interceptedAxios.get<ThemeConsumption[]>(
        `${BASE_STATISTIC_URL}/theme-consumption`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchAuthorConsumption = async (): Promise<
    ServiceResult<AuthorConsumption[]>
  > => {
    try {
      const response = await interceptedAxios.get<AuthorConsumption[]>(
        `${BASE_STATISTIC_URL}/author-consumption`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const fetchAllTimeStatistic = async (): Promise<
    ServiceResult<AllTimeStatistic>
  > => {
    try {
      const response = await interceptedAxios.get<AllTimeStatistic>(
        `${BASE_STATISTIC_URL}/all-time`
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  return {
    fetchYearRange,
    fetchMediaConsumption,
    fetchMediaProgress,
    fetchGenreConsumption,
    fetchStudioConsumption,
    fetchThemeConsumption,
    fetchAuthorConsumption,
    fetchAllTimeStatistic
  };
};

export const statisticService = createStatisticService();
