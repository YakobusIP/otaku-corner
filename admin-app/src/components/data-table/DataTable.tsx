import { Dispatch, ReactNode, SetStateAction } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { MetadataResponse } from "@/types/api.type";

import { buildPaginationPageSlots, cn } from "@/lib/utils";

import {
  ColumnDef,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  Trash2Icon
} from "lucide-react";

interface Identifiable {
  id: number;
}

interface DataTableProps<TData extends Identifiable, TValue> {
  searchComponent?: ReactNode;
  addNewDataComponent?: ReactNode;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  deleteData: () => Promise<void>;
  isLoadingData: boolean;
  isLoadingDeleteData: boolean;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  metadata?: MetadataResponse;
}

export default function DataTable<TData extends Identifiable, TValue>({
  searchComponent,
  addNewDataComponent,
  columns,
  data,
  rowSelection,
  setRowSelection,
  deleteData,
  isLoadingData,
  isLoadingDeleteData,
  page,
  setPage,
  metadata
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: metadata?.limit || 10
      }
    },
    manualPagination: true,
    pageCount: metadata?.pageCount || 0,
    rowCount: metadata?.itemCount || 0
  });

  const limit = metadata?.limit ?? 10;
  const totalItems = metadata?.itemCount ?? 0;
  const pageCount = metadata?.pageCount ?? 0;
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalItems);

  const pageItems = buildPaginationPageSlots(page, pageCount);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex shrink-0 flex-col">
        <div className="flex flex-row items-center gap-2 sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-row items-center gap-2 sm:flex-initial sm:gap-2">
            <div className="min-w-0 flex-1 sm:w-56 md:w-64 lg:w-72">
              {searchComponent}
            </div>
            {addNewDataComponent}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                aria-label="Delete selected"
                className={cn(
                  "flex shrink-0 items-center gap-2 border-destructive/70 text-destructive hover:bg-destructive/10 hover:text-destructive",
                  "h-10 min-h-10 w-10 justify-center p-0 sm:h-8 sm:w-auto sm:justify-start sm:gap-2 sm:px-3 sm:py-1.5"
                )}
                disabled={selectedCount === 0 || isLoadingDeleteData}
              >
                {!isLoadingDeleteData && (
                  <Trash2Icon className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {isLoadingDeleteData && (
                  <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" />
                )}
                <span className="hidden sm:inline">Delete Selected</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected entities?</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedCount === 1
                    ? "This will permanently delete 1 selected entity. This action cannot be undone."
                    : `This will permanently delete ${selectedCount} selected entities. This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: "destructive" })}
                  disabled={isLoadingDeleteData}
                  onClick={() => void deleteData()}
                >
                  {isLoadingDeleteData ? (
                    <>
                      <Loader2Icon className="mr-2 inline h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border/50 bg-background/30">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border/40 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground"
                      style={{
                        minWidth: header.column.columnDef.size,
                        maxWidth: header.column.columnDef.size
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoadingData ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="inline-flex items-center justify-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    idx % 2 === 1 && "bg-muted/20 hover:bg-muted/25",
                    "border-border/30"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: cell.column.columnDef.size,
                        maxWidth: cell.column.columnDef.size
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex shrink-0 flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="text-center text-sm text-muted-foreground sm:flex-1 sm:text-left">
          <span>
            Showing {rangeStart} to {rangeEnd} of {totalItems} results
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous page"
            className="h-8 border-border/60"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          {pageItems.map((item, i) =>
            item === "ellipsis" ? (
              <span
                key={`e-${i}`}
                className="px-1 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={item}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 min-w-8 px-2 border-border/60",
                  page === item &&
                    "border-transparent bg-linear-to-r from-[#4F8CFF] via-[#7C6CF6] to-[#A855F7] text-white shadow-xs hover:brightness-110 hover:bg-linear-to-r hover:from-[#4F8CFF] hover:via-[#7C6CF6] hover:to-[#A855F7] hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                onClick={() => setPage(item)}
              >
                {item}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            aria-label="Next page"
            className="h-8 border-border/60"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="h-4 w-4 sm:hidden" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
