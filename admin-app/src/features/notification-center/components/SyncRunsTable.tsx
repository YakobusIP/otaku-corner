import DataTable from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import SyncConflictItem from "@/features/notification-center/components/SyncConflictItem";
import {
  useMediaSyncConflictResolve,
  useMediaSyncRunIssues,
  useMediaSyncRunSelection,
  useMediaSyncRuns
} from "@/features/notification-center/hooks/useMediaSyncRuns";

import type { MediaSyncItem, MediaSyncRunListItem } from "@/types/media-sync.type";
import type { MediaSyncFieldResolutionChoice } from "@/types/media-sync-resolve.type";

import { ColumnDef } from "@tanstack/react-table";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function SyncRunsTable() {
  const [page, setPage] = useState(1);
  const [conflictPage, setConflictPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);
  const selection = useMediaSyncRunSelection();
  const runsQuery = useMediaSyncRuns(page);
  const issuesQuery = useMediaSyncRunIssues(
    selection.selected,
    conflictPage,
    failedPage
  );
  const {
    resolveFieldsMutation,
    acceptUpstreamMutation,
    keepExistingMutation,
    isResolving
  } = useMediaSyncConflictResolve(selection.selected);

  const columns = useMemo<ColumnDef<MediaSyncRunListItem>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Started",
        size: 180,
        cell: ({ row }) =>
          new Date(
            row.original.startedAt ?? row.original.createdAt
          ).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 110
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.status}</Badge>
        )
      },
      {
        accessorKey: "touchedCount",
        header: "Touched",
        size: 90
      },
      {
        accessorKey: "updatedCount",
        header: "Updated",
        size: 90
      },
      {
        accessorKey: "conflictedCount",
        header: "Conflicts",
        size: 100
      },
      {
        accessorKey: "failedCount",
        header: "Failed",
        size: 90
      }
    ],
    []
  );

  const runs = runsQuery.data;

  useEffect(() => {
    if (!selection.open) {
      setConflictPage(1);
      setFailedPage(1);
    }
  }, [selection.open]);

  useEffect(() => {
    const totalPages = issuesQuery.conflictTotalPages;
    if (totalPages > 0 && conflictPage > totalPages) {
      setConflictPage(totalPages);
    }
  }, [conflictPage, issuesQuery.conflictTotalPages]);

  useEffect(() => {
    const totalPages = issuesQuery.failedTotalPages;
    if (totalPages > 0 && failedPage > totalPages) {
      setFailedPage(totalPages);
    }
  }, [failedPage, issuesQuery.failedTotalPages]);

  const relatedOpenConflicts = issuesQuery.run?.relatedOpenConflicts ?? [];

  const handleResolveFields = (
    item: MediaSyncItem,
    resolutions: { field: string; choice: MediaSyncFieldResolutionChoice }[]
  ) => {
    resolveFieldsMutation.mutate({ item, resolutions });
  };

  return (
    <Fragment>
      <DataTable
        columns={columns}
        data={runs?.data ?? []}
        rowSelection={{}}
        setRowSelection={() => undefined}
        deleteData={async () => undefined}
        isLoadingData={runsQuery.isLoading}
        isLoadingDeleteData={false}
        page={page}
        setPage={setPage}
        hideBulkDelete
        onRowClick={(row) => selection.select(row.id)}
        metadata={
          runs
            ? {
                page: runs.page,
                limit: runs.limit,
                itemCount: runs.total,
                pageCount: runs.totalPages
              }
            : undefined
        }
      />

      <Dialog
        open={selection.open}
        onOpenChange={(open) => !open && selection.close()}
      >
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sync run details</DialogTitle>
          </DialogHeader>

          {issuesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading run details...
            </p>
          ) : issuesQuery.isError ? (
            <p className="text-sm text-destructive">
              Could not load run details. Try closing and reopening this run.
            </p>
          ) : issuesQuery.run ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Updated</p>
                  <p>{issuesQuery.run.updatedCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Conflicts</p>
                  <p>{issuesQuery.run.conflictedCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Failed</p>
                  <p>{issuesQuery.run.failedCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unchanged</p>
                  <p>{issuesQuery.run.unchangedCount}</p>
                </div>
              </div>

              {issuesQuery.issueTotal > 0 ? (
                <div className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
                  <p className="text-muted-foreground">
                    Showing {issuesQuery.visibleCount} of {issuesQuery.issueTotal}{" "}
                    failed/conflict items for this run.
                  </p>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">Conflicts</span>
                      <span className="text-muted-foreground">
                        {issuesQuery.conflictItems.length} of{" "}
                        {issuesQuery.conflictTotal}
                      </span>
                      {issuesQuery.conflictTotalPages > 1 ? (
                        <Fragment>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={conflictPage <= 1}
                            onClick={() =>
                              setConflictPage((current) => current - 1)
                            }
                          >
                            Previous
                          </Button>
                          <span className="text-muted-foreground">
                            Page {conflictPage} of {issuesQuery.conflictTotalPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              conflictPage >= issuesQuery.conflictTotalPages
                            }
                            onClick={() =>
                              setConflictPage((current) => current + 1)
                            }
                          >
                            Next
                          </Button>
                        </Fragment>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">Failures</span>
                      <span className="text-muted-foreground">
                        {issuesQuery.failedItems.length} of {issuesQuery.failedTotal}
                      </span>
                      {issuesQuery.failedTotalPages > 1 ? (
                        <Fragment>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={failedPage <= 1}
                            onClick={() => setFailedPage((current) => current - 1)}
                          >
                            Previous
                          </Button>
                          <span className="text-muted-foreground">
                            Page {failedPage} of {issuesQuery.failedTotalPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={failedPage >= issuesQuery.failedTotalPages}
                            onClick={() => setFailedPage((current) => current + 1)}
                          >
                            Next
                          </Button>
                        </Fragment>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {relatedOpenConflicts.length > 0 ? (
                <div className="space-y-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Open conflicts carried from earlier runs
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      This run touched media that still has unresolved conflicts
                      owned by another run. Resolve them from the{" "}
                      <Link
                        to="/notifications"
                        className="underline underline-offset-4"
                      >
                        Open Conflicts inbox
                      </Link>
                      .
                    </p>
                  </div>
                  {relatedOpenConflicts.map((item) => (
                    <SyncConflictItem
                      key={`related-${item.id}`}
                      item={item}
                      isResolving={isResolving}
                      showRunOrigin
                      onResolveFields={handleResolveFields}
                      onAcceptAll={(conflictItem) =>
                        acceptUpstreamMutation.mutate(conflictItem)
                      }
                      onKeepAll={(conflictItem) =>
                        keepExistingMutation.mutate(conflictItem)
                      }
                    />
                  ))}
                </div>
              ) : null}

              <div className="space-y-3">
                {issuesQuery.items.map((item) => (
                  <SyncConflictItem
                    key={item.id}
                    item={item}
                    isResolving={isResolving}
                    onResolveFields={handleResolveFields}
                    onAcceptAll={(conflictItem) =>
                      acceptUpstreamMutation.mutate(conflictItem)
                    }
                    onKeepAll={(conflictItem) =>
                      keepExistingMutation.mutate(conflictItem)
                    }
                  />
                ))}
                {issuesQuery.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No failed or conflicted items in this run.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
