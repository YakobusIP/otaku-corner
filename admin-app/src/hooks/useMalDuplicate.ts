import { animeService } from "@/services/anime.service";

import { mediaKeys } from "@/lib/query-keys";

import { useQuery } from "@tanstack/react-query";

export const useMalDuplicate = (malId: number) => {
  const { data, error, isPending } = useQuery({
    queryKey: mediaKeys.malDuplicate("anime", malId),
    queryFn: async (): Promise<boolean> => {
      const r = await animeService.getDuplicates(malId);
      if (!r.success) throw new Error(r.error ?? "Duplicate check failed");
      return r.data.exists;
    },
    staleTime: 60_000,
    enabled: malId > 0
  });

  if (error) return null;
  if (isPending) return null;
  return data ?? null;
};
