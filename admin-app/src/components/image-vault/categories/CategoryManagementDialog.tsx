import DataTable from "@/components/data-table/DataTable";
import AddCategoryDialog from "@/components/image-vault/categories/AddCategoryDialog";
import { getCategoryTableColumns } from "@/components/image-vault/categories/CategoryTableColumns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useImageVaultCategoryManagement } from "@/hooks/useImageVaultCategoryManagement";

import { cn } from "@/lib/utils";

import { SearchIcon } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CategoryManagementDialog({
  open,
  onOpenChange
}: Props) {
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
    addCategory,
    editCategory,
    deleteSelected,
    isPendingAdd,
    isPendingEdit,
    isPendingDelete,
    editDialogControl
  } = useImageVaultCategoryManagement(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden border-border/60 bg-background p-0 shadow-xl sm:rounded-xl",
          "h-[min(44rem,90vh)] max-h-[90vh]"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">Categories</DialogTitle>
          <DialogDescription>
            Organize vault images with reusable categories.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-6 pb-5 pt-4">
          <DataTable
            columns={getCategoryTableColumns(
              editCategory,
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
                placeholder="Search category"
                startIcon={SearchIcon}
                parentClassName="w-full min-w-0"
                className="bg-background/50"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            }
            addNewDataComponent={
              <AddCategoryDialog
                isOpenDialog={isOpenAdd}
                setIsOpenDialog={setIsOpenAdd}
                addHandler={addCategory}
                isLoadingAdd={isPendingAdd}
              />
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
