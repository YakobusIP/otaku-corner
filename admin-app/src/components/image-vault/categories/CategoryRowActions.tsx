import EditCategoryDialog from "@/components/image-vault/categories/EditCategoryDialog";

import type { EditCategoryPayload } from "@/hooks/useImageVaultCategoryManagement";

import type { ImageVaultCategory } from "@/types/image-vault.type";

type Props = {
  category: ImageVaultCategory;
  editHandler: (payload: EditCategoryPayload) => void;
  isLoadingEdit: boolean;
  editDialogOpen: boolean;
  onEditDialogOpenChange: (open: boolean) => void;
};

export default function CategoryRowActions({
  category,
  editHandler,
  isLoadingEdit,
  editDialogOpen,
  onEditDialogOpenChange
}: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <EditCategoryDialog
        open={editDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        category={category}
        editHandler={editHandler}
        isLoadingEdit={isLoadingEdit}
        triggerVariant="icon"
      />
    </div>
  );
}
