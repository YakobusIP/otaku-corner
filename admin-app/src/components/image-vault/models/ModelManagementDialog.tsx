import DataTable from "@/components/data-table/DataTable";
import AddModelDialog from "@/components/image-vault/models/AddModelDialog";
import { getModelTableColumns } from "@/components/image-vault/models/ModelTableColumns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useImageVaultModelManagement } from "@/hooks/useImageVaultModelManagement";

import { cn } from "@/lib/utils";

import { SearchIcon } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ModelManagementDialog({ open, onOpenChange }: Props) {
  const {
    list,
    metadata,
    isLoadingList,
    rowSelection,
    setRowSelection,
    page,
    setPage,
    search,
    setSearch,
    isOpenAdd,
    setIsOpenAdd,
    addModel,
    editModel,
    toggleActive,
    deleteSelected,
    isPendingAdd,
    isPendingEdit,
    isPendingDelete,
    editDialogControl
  } = useImageVaultModelManagement(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden border-border/60 bg-background p-0 shadow-xl sm:rounded-xl",
          "h-[min(44rem,90vh)] max-h-[90vh]"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">
            Generation Models
          </DialogTitle>
          <DialogDescription>
            Manage AI image generation models used by the vault.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-6 pb-5 pt-4">
          <DataTable
            columns={getModelTableColumns(
              editModel,
              toggleActive,
              isPendingEdit,
              editDialogControl
            )}
            data={list}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            deleteData={deleteSelected}
            isLoadingData={isLoadingList}
            isLoadingDeleteData={isPendingDelete}
            page={page}
            setPage={setPage}
            metadata={metadata}
            searchComponent={
              <Input
                type="text"
                placeholder="Search model"
                startIcon={SearchIcon}
                parentClassName="w-full min-w-0"
                className="bg-background/50"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            }
            addNewDataComponent={
              <AddModelDialog
                isOpenDialog={isOpenAdd}
                setIsOpenDialog={setIsOpenAdd}
                addHandler={addModel}
                isLoadingAdd={isPendingAdd}
              />
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
