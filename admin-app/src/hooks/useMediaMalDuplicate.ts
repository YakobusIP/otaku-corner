import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/light-novel.service";
import { mangaService } from "@/services/manga.service";

import type { MediaType } from "@/types/general.type";

import { mediaKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

export function useMediaMalDuplicate(
  mediaType: MediaType,
  malId: number
): boolean | null {
  const { data, error, isPending } = useQuery({
    queryKey: mediaKeys.malDuplicate(mediaType, malId),
    queryFn: async (): Promise<boolean> => {
      if (mediaType === "anime") {
        const result = await animeService.getDuplicates(malId);
        if (!result.success)
          throw new Error(result.error ?? "Duplicate check failed");
        return result.data.exists;
      }
      if (mediaType === "manga") {
        const result = await mangaService.getDuplicates(malId);
        if (!result.success)
          throw new Error(result.error ?? "Duplicate check failed");
        return result.data.exists;
      }
      const result = await lightNovelService.getDuplicates(malId);
      if (!result.success)
        throw new Error(result.error ?? "Duplicate check failed");
      return result.data.exists;
    },
    staleTime: 60_000,
    enabled: malId > 0
  });

  if (error) return null;
  if (isPending) return null;
  return data ?? null;
}
