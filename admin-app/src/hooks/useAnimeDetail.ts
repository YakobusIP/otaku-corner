import { useQuery } from "@tanstack/react-query";

import { detailKeys } from "@/lib/query-keys";
import { animeService } from "@/services/anime.service";

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
