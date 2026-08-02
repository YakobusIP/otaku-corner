import { animeService } from "@/services/anime.service";

import { detailKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

export const useAnimeDetail = (id?: number) => {
  const hasValidId = id !== undefined && Number.isFinite(id);

  return useQuery({
    queryKey: hasValidId ? detailKeys.anime(id) : [...detailKeys.anime(-1)],
    enabled: hasValidId,
    queryFn: async () => {
      const result = await animeService.get(id as number);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });
};
