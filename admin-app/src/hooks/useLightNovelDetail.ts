import { useQuery } from "@tanstack/react-query";

import { detailKeys } from "@/lib/query-keys";
import { fetchLightNovelByIdService } from "@/services/lightnovel.service";

export const useLightNovelDetail = (id: number | undefined) => {
  const hasValidId = typeof id === "number" && Number.isFinite(id);

  return useQuery({
    queryKey: hasValidId
      ? detailKeys.lightNovel(id as number)
      : [...detailKeys.lightNovel(-1)],
    enabled: hasValidId,
    queryFn: async () => {
      const response = await fetchLightNovelByIdService(id as number);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }
  });
};
