import { Dispatch, Fragment, ReactNode, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { MetadataResponse } from "@/types/api.type";

import {
  ColumnDef,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Loader2Icon, Trash2Icon } from "lucide-react";

interface Identifiable {
  id: string;
}

interface DataTableProps<TData extends Identifiable, TValue> {
  title?: string;
  searchComponent?: ReactNode;
  addNewDataComponent?: ReactNode;
  filterSortComponent?: ReactNode;
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
  title,
  searchComponent,
  addNewDataComponent,
  filterSortComponent,
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
        pageSize: metadata?.limitPerPage || 10
      }
    },
    manualPagination: true,
    pageCount: metadata?.pageCount || 0,
    rowCount: metadata?.itemCount || 0
  });

  return (
    <div>
      <div className="flex flex-col mb-2">
        {searchComponent ? (
          <Fragment>
            <h2>{title}</h2>
            <div className="flex flex-col xl:flex-row justify-between items-center gap-2">
              <div className="flex flex-col xl:flex-row items-center gap-2 w-full xl:w-fit">
                {searchComponent}
                {addNewDataComponent}
              </div>
              <Button
                variant="destructive"
                className="flex items-center gap-2 place-self-end w-full xl:w-fit"
                onClick={() => deleteData()}
                disabled={Object.keys(rowSelection).length === 0}
              >
                {!isLoadingDeleteData && <Trash2Icon className="w-4 h-4" />}
                {isLoadingDeleteData && (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </div>
          </Fragment>
        ) : (
          <div className="flex flex-col xl:flex-row justify-between items-center gap-2">
            <h2>{title}</h2>
            <Button
              variant="destructive"
              className="flex items-center gap-2 place-self-end w-full xl:w-fit"
              onClick={() => deleteData()}
              disabled={Object.keys(rowSelection).length === 0}
            >
              {!isLoadingDeleteData && <Trash2Icon className="w-4 h-4" />}
              {isLoadingDeleteData && (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        )}
        {filterSortComponent}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
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
                    <Loader2Icon className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} of {metadata?.itemCount} row(s)
          selected.
        </div>
        <div className="flex items-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
