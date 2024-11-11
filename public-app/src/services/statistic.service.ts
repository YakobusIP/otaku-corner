import { ApiResponse } from "@/types/api.type";
import { TopMediaAndYearlyCount } from "@/types/statistic.type";

import { axiosClient } from "@/lib/axios";

import { AxiosError } from "axios";

const BASE_STATISTIC_URL = "/api/statistic";

const fetchTopMediaAndYearlyCountService = async (): Promise<
  ApiResponse<TopMediaAndYearlyCount>
> => {
  try {
    const response = await axiosClient.get(
      `${BASE_STATISTIC_URL}/top-media-and-yearly-count`
    );
    return { success: true, data: response.data.data };
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

export { fetchTopMediaAndYearlyCountService };
