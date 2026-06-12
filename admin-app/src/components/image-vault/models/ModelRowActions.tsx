import EditModelDialog from "@/components/image-vault/models/EditModelDialog";

import type { EditModelPayload } from "@/hooks/useImageVaultModelManagement";

import type { ImageVaultModel } from "@/types/image-vault.type";

type Props = {
  model: ImageVaultModel;
  editHandler: (payload: EditModelPayload) => void;
  isLoadingEdit: boolean;
  editDialogOpen: boolean;
  onEditDialogOpenChange: (open: boolean) => void;
};

export default function ModelRowActions({
  model,
  editHandler,
  isLoadingEdit,
  editDialogOpen,
  onEditDialogOpenChange
}: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <EditModelDialog
        open={editDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        model={model}
        editHandler={editHandler}
        isLoadingEdit={isLoadingEdit}
        triggerVariant="icon"
      />
    </div>
  );
}
