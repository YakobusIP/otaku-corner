import { Fragment, useCallback, useMemo } from "react";

import DataTable from "@/components/data-table/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import {
  useAuditLogDetailSelection,
  useAuditLogInfinite
} from "@/features/notification-center/hooks/useAuditLogInfinite";
import {
  formatAuditChangeSummary,
  listAuditFieldChanges
} from "@/features/notification-center/lib/audit-change-summary";

import type { AuditLogItem } from "@/types/audit-log.type";

import { ColumnDef } from "@tanstack/react-table";

export default function AuditLogTable() {
  const {
    items,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useAuditLogInfinite();
  const detail = useAuditLogDetailSelection();

  const handleFetchNextPage = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const columns = useMemo<ColumnDef<AuditLogItem>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Time",
        size: 180,
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })
      },
      {
        accessorKey: "entityType",
        header: "Entity",
        size: 120
      },
      {
        accessorKey: "entityId",
        header: "ID",
        size: 90
      },
      {
        accessorKey: "action",
        header: "Action",
        size: 100
      },
      {
        accessorKey: "source",
        header: "Source",
        size: 100
      },
      {
        id: "summary",
        header: "Changes",
        size: 360,
        cell: ({ row }) => (
          <span className="line-clamp-2 text-left">
            {formatAuditChangeSummary(row.original)}
          </span>
        )
      }
    ],
    []
  );

  const detailChanges = detail.selected
    ? listAuditFieldChanges(detail.selected)
    : [];

  if (isError) {
    return (
      <p className="text-sm text-rose-400">
        {error instanceof Error ? error.message : "Failed to load audit log"}
      </p>
    );
  }

  return (
    <Fragment>
      <DataTable
        columns={columns}
        data={items}
        rowSelection={{}}
        setRowSelection={() => undefined}
        deleteData={async () => undefined}
        isLoadingData={isLoading}
        isLoadingDeleteData={false}
        page={1}
        setPage={() => undefined}
        hideBulkDelete
        paginationMode="infinite"
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={handleFetchNextPage}
        onRowClick={(row) => detail.select(row)}
        metadata={{
          page: 1,
          limit: items.length || 25,
          itemCount: items.length,
          pageCount: 1
        }}
      />

      <Dialog open={detail.open} onOpenChange={(open) => !open && detail.close()}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit log detail</DialogTitle>
          </DialogHeader>
          {detail.selected ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Entity</span>
                  <p>
                    {detail.selected.entityType} #{detail.selected.entityId}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Action</span>
                  <p>{detail.selected.action}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-muted-foreground">What changed</p>
                {detailChanges.length > 0 ? (
                  <ul className="space-y-2">
                    {detailChanges.map((change) => (
                      <li
                        key={change.field}
                        className="rounded-md border border-border/40 bg-muted/20 px-3 py-2"
                      >
                        {change.sentence}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No field changes recorded.</p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
