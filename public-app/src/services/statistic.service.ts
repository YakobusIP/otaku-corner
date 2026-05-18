import { AllTimeCount, TopMediaAndYearlyCount } from "@/types/statistic.type";

import { axiosClient, handleAxiosError } from "@/lib/axios";

const BASE_STATISTIC_URL = "/api/statistic";

const createStatisticService = () => {
  const fetchAllTime = async () => {
    try {
      const response = await axiosClient.get<AllTimeCount>(
        `${BASE_STATISTIC_URL}/all-time`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const fetchTopMediaAndYearlyCount = async () => {
    try {
      const response = await axiosClient.get<TopMediaAndYearlyCount>(
        `${BASE_STATISTIC_URL}/top-media-and-yearly-count`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  return {
    fetchAllTime,
    fetchTopMediaAndYearlyCount
  };
};

export const statisticService = createStatisticService();
