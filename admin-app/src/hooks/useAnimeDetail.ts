import { animeService } from "@/services/anime.service";

import { detailKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

export const useAnimeDetail = (id: number | undefined) => {
  const hasValidId = typeof id === "number" && Number.isFinite(id);

  return useQuery({
    queryKey: hasValidId
      ? detailKeys.anime(id as number)
      : [...detailKeys.anime(-1)],
    enabled: hasValidId,
    queryFn: () => animeService.get(id as number)
  });
};
