import { fetchMangaByIdService } from "@/services/manga.service";

import { detailKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

export const useMangaDetail = (id: number | undefined) => {
  const hasValidId = typeof id === "number" && Number.isFinite(id);

  return useQuery({
    queryKey: hasValidId
      ? detailKeys.manga(id as number)
      : [...detailKeys.manga(-1)],
    enabled: hasValidId,
    queryFn: async () => {
      const response = await fetchMangaByIdService(id as number);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }
  });
};
