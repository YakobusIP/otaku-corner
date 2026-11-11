import { Button } from "@/components/ui/button";

import SyncConflictItem from "@/features/notification-center/components/SyncConflictItem";
import {
  useMediaSyncConflictResolve,
  useOpenMediaSyncConflicts
} from "@/features/notification-center/hooks/useMediaSyncRuns";

import type { MediaSyncItem } from "@/types/media-sync.type";
import type { MediaSyncFieldResolutionChoice } from "@/types/media-sync-resolve.type";

import { Fragment, useEffect, useState } from "react";

export default function OpenConflictsTable() {
  const [page, setPage] = useState(1);
  const conflictsQuery = useOpenMediaSyncConflicts(page);
  const { resolveFieldsMutation, acceptUpstreamMutation, keepExistingMutation, isResolving } =
    useMediaSyncConflictResolve(null);

  useEffect(() => {
    const totalPages = conflictsQuery.data?.totalPages ?? 1;
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [conflictsQuery.data?.totalPages, page]);

  const handleResolveFields = (
    item: MediaSyncItem,
    resolutions: { field: string; choice: MediaSyncFieldResolutionChoice }[]
  ) => {
    resolveFieldsMutation.mutate({ item, resolutions });
  };

  return (
    <Fragment>
      <div className="mb-4 flex flex-col gap-2 rounded-md border border-border/60 bg-muted/20 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Open catalog sync conflicts</p>
          <p className="text-muted-foreground">
            {conflictsQuery.isLoading
              ? "Loading open conflicts..."
              : `Showing ${conflictsQuery.data?.data.length ?? 0} of ${conflictsQuery.data?.total ?? 0} unresolved conflicts`}
          </p>
        </div>
        {conflictsQuery.data && conflictsQuery.data.totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {page} of {conflictsQuery.data.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= conflictsQuery.data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      {conflictsQuery.isError ? (
        <p className="text-sm text-destructive">
          Could not load open conflicts. Try refreshing this page.
        </p>
      ) : null}

      <div className="space-y-3">
        {(conflictsQuery.data?.data ?? []).map((item) => (
          <SyncConflictItem
            key={item.id}
            item={item}
            isResolving={isResolving}
            onResolveFields={handleResolveFields}
            onAcceptAll={(conflictItem) =>
              acceptUpstreamMutation.mutate(conflictItem)
            }
            onKeepAll={(conflictItem) => keepExistingMutation.mutate(conflictItem)}
          />
        ))}
        {!conflictsQuery.isLoading &&
        (conflictsQuery.data?.data.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open catalog sync conflicts right now.
          </p>
        ) : null}
      </div>
    </Fragment>
  );
}
