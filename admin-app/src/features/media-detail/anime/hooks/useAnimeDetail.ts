import { animeService } from "@/services/anime.service";

import { detailKeys } from "@/lib/query-keys";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAnimeDetail = (id?: number) => {
  const hasValidId = id !== undefined && Number.isFinite(id);

  const query = useQuery({
    queryKey: hasValidId ? detailKeys.anime(id) : [...detailKeys.anime(-1)],
    enabled: hasValidId,
    queryFn: async () => {
      const result = await animeService.get(id as number);
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const syncMetadataMutation = useMutation({
    mutationFn: async () => {
      if (!hasValidId) {
        throw new Error("No anime selected");
      }
      const res = await animeService.enqueueMetadataSync(id as number);
      if (!res.success) {
        throw new Error(res.error);
      }
    },
    onSuccess: () => {
      toast.success("Sync queued", {
        description:
          "Catalog metadata will refresh when the background job runs."
      });
    },
    onError: (syncError: Error) => {
      toast.error("Could not queue sync", {
        description: syncError.message
      });
    }
  });

  return { ...query, syncMetadataMutation };
};
