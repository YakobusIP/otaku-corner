import { lightNovelService } from "@/services/light-novel.service";

import { detailKeys } from "@/lib/query-keys";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLightNovelDetail = (id: number | undefined) => {
  const hasValidId = typeof id === "number" && Number.isFinite(id);

  const query = useQuery({
    queryKey: hasValidId
      ? detailKeys.lightNovel(id as number)
      : [...detailKeys.lightNovel(-1)],
    enabled: hasValidId,
    queryFn: async () => {
      const response = await lightNovelService.get(id as number);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }
  });

  const syncMetadataMutation = useMutation({
    mutationFn: async () => {
      if (!hasValidId) {
        throw new Error("No light novel selected");
      }
      const res = await lightNovelService.enqueueMetadataSync(id as number);
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
