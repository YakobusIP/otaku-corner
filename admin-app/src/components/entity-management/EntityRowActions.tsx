import EditEntityDialog from "@/components/entity-management/EditEntityDialog";

type Props = {
  entityType: string;
  entityId: number;
  name: string;
  editHandler: (id: number, name: string) => void;
  isLoadingEditEntity: boolean;
  editDialogOpen: boolean;
  onEditDialogOpenChange: (open: boolean) => void;
};

export default function EntityRowActions({
  entityType,
  entityId,
  name,
  editHandler,
  isLoadingEditEntity,
  editDialogOpen,
  onEditDialogOpenChange
}: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <EditEntityDialog
        open={editDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        entityType={entityType}
        entityId={entityId}
        entity={name}
        editHandler={editHandler}
        isLoadingEditEntity={isLoadingEditEntity}
        triggerVariant="icon"
      />
    </div>
  );
}
