import { mangaService } from "@/services/manga.service";

import { detailKeys } from "@/lib/query-keys";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMangaDetail = (id: number | undefined) => {
  const hasValidId = typeof id === "number" && Number.isFinite(id);

  const query = useQuery({
    queryKey: hasValidId
      ? detailKeys.manga(id as number)
      : [...detailKeys.manga(-1)],
    enabled: hasValidId,
    queryFn: async () => {
      const response = await mangaService.get(id as number);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }
  });

  const syncMetadataMutation = useMutation({
    mutationFn: async () => {
      if (!hasValidId) {
        throw new Error("No manga selected");
      }
      const res = await mangaService.enqueueMetadataSync(id as number);
      if (!res.success) {
        throw new Error(res.error);
      }
    },
    onSuccess: () => {
      toast.success("Sync queued", {
        description:
          "External metadata will refresh when the background job runs."
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
