import { mediaSyncService } from "@/services/media-sync.service";

import type { MediaSyncItem } from "@/types/media-sync.type";
import type { MediaSyncItemOutcome } from "@/types/media-sync.type";
import type { MediaSyncFieldResolutionChoice } from "@/types/media-sync-resolve.type";

import { useDialogSelection } from "@/hooks/useDialogSelection";
import { auditLogKeys, detailKeys, mediaKeys, mediaSyncKeys } from "@/lib/query-keys";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const isConflictVersionError = (error: Error): boolean =>
  /version mismatch|stale conflict|changed since the conflict snapshot|review refreshed values/i.test(
    error.message
  );

const detailKeyForItem = (item: MediaSyncItem) => {
  switch (item.mediaType) {
    case "ANIME":
      return detailKeys.anime(item.mediaId);
    case "MANGA":
      return detailKeys.manga(item.mediaId);
    case "LIGHT_NOVEL":
      return detailKeys.lightNovel(item.mediaId);
  }
};

export const useMediaSyncRuns = (page: number, limit = 20) =>
  useQuery({
    queryKey: mediaSyncKeys.runList(page, limit),
    queryFn: async () => {
      const result = await mediaSyncService.listRuns({ page, limit });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  });

export const useMediaSyncRunDetail = (
  runId: string | null,
  page: number,
  limit = 20,
  outcome?: MediaSyncItemOutcome
) =>
  useQuery({
    queryKey: mediaSyncKeys.runDetail(runId ?? "", page, limit, outcome),
    enabled: runId !== null,
    queryFn: async () => {
      const result = await mediaSyncService.getRunDetail(runId as string, {
        page,
        limit,
        outcome
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  });

export const useOpenMediaSyncConflicts = (page: number, limit = 20) =>
  useQuery({
    queryKey: mediaSyncKeys.openConflictList(page, limit),
    queryFn: async () => {
      const result = await mediaSyncService.listOpenConflicts({ page, limit });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  });

export const useMediaSyncRunIssues = (
  runId: string | null,
  conflictPage = 1,
  failedPage = 1,
  limit = 25
) => {
  const failedQuery = useMediaSyncRunDetail(runId, failedPage, limit, "FAILED");
  const conflictQuery = useMediaSyncRunDetail(
    runId,
    conflictPage,
    limit,
    "CONFLICT"
  );

  const failedItems = failedQuery.data?.items ?? [];
  const conflictItems = conflictQuery.data?.items ?? [];
  const failedTotal = failedQuery.data?.itemsTotal ?? 0;
  const conflictTotal = conflictQuery.data?.itemsTotal ?? 0;

  return {
    isLoading: failedQuery.isLoading || conflictQuery.isLoading,
    isError: failedQuery.isError || conflictQuery.isError,
    run: failedQuery.data ?? conflictQuery.data ?? null,
    failedItems,
    conflictItems,
    items: [...failedItems, ...conflictItems],
    failedTotal,
    conflictTotal,
    issueTotal: failedTotal + conflictTotal,
    visibleCount: failedItems.length + conflictItems.length,
    conflictPage,
    failedPage,
    issueLimit: limit,
    conflictTotalPages: conflictQuery.data?.itemsTotalPages ?? 0,
    failedTotalPages: failedQuery.data?.itemsTotalPages ?? 0,
    hasHiddenIssues:
      failedTotal + conflictTotal > failedItems.length + conflictItems.length
  };
};

export const useMediaSyncConflictResolve = (runId: string | null) => {
  const queryClient = useQueryClient();

  const invalidate = async (item?: MediaSyncItem) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: mediaSyncKeys.runs() }),
      queryClient.invalidateQueries({
        queryKey: mediaSyncKeys.openConflicts()
      }),
      queryClient.invalidateQueries({
        queryKey: [...mediaSyncKeys.all, "detail"]
      }),
      queryClient.invalidateQueries({ queryKey: auditLogKeys.all }),
      queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
      item
        ? queryClient.invalidateQueries({ queryKey: detailKeyForItem(item) })
        : Promise.resolve(),
      runId
        ? queryClient.invalidateQueries({
            queryKey: [...mediaSyncKeys.all, "detail", runId]
          })
        : Promise.resolve()
    ]);
  };

  const handleConflictError = async (error: Error) => {
    if (isConflictVersionError(error)) {
      await invalidate();
      toast.error("Conflict changed while you were reviewing", {
        description:
          "Fresh values were loaded. Review the updated fields and try again."
      });
      return;
    }

    toast.error("Could not apply conflict resolution", {
      description: error.message
    });
  };

  const acceptUpstreamMutation = useMutation({
    mutationFn: async (item: MediaSyncItem) => {
      const result = await mediaSyncService.acceptUpstream(item.id, {
        expectedVersion: item.version
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async (_data, item) => {
      await invalidate(item);
      toast.success("Accepted upstream values for all open fields");
    },
    onError: handleConflictError
  });

  const keepExistingMutation = useMutation({
    mutationFn: async (item: MediaSyncItem) => {
      const result = await mediaSyncService.keepExisting(item.id, {
        expectedVersion: item.version
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async (_data, item) => {
      await invalidate(item);
      toast.success("Kept local values for all open fields");
    },
    onError: handleConflictError
  });

  const resolveFieldsMutation = useMutation({
    mutationFn: async (input: {
      item: MediaSyncItem;
      resolutions: { field: string; choice: MediaSyncFieldResolutionChoice }[];
    }) => {
      const result = await mediaSyncService.resolveFields(input.item.id, {
        expectedVersion: input.item.version,
        resolutions: input.resolutions
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async (data, input) => {
      await invalidate(input.item);
      if (data.outcome === "CONFLICT") {
        toast.success("Applied selected field resolutions");
      } else {
        toast.success("Resolved all open conflict fields");
      }
    },
    onError: handleConflictError
  });

  return {
    acceptUpstreamMutation,
    keepExistingMutation,
    resolveFieldsMutation,
    isResolving:
      acceptUpstreamMutation.isPending ||
      keepExistingMutation.isPending ||
      resolveFieldsMutation.isPending
  };
};

export const useMediaSyncRunSelection = () => useDialogSelection<string>();
