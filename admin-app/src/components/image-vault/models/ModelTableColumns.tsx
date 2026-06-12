import ModelRowActions from "@/components/image-vault/models/ModelRowActions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { EditModelPayload } from "@/hooks/useImageVaultModelManagement";

import type {
  ImageVaultCatalogEditDialogControl,
  ImageVaultModel
} from "@/types/image-vault.type";

import type { ColumnDef } from "@tanstack/react-table";

export function getModelTableColumns(
  editModel: (payload: EditModelPayload) => void,
  toggleActive: (id: string, isActive: boolean) => void,
  isLoadingEdit: boolean,
  editDialogControl: ImageVaultCatalogEditDialogControl
): ColumnDef<ImageVaultModel, unknown>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: "auto" as unknown as number,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "name",
      header: "Model Name",
      size: "auto" as unknown as number
    },
    {
      accessorKey: "provider",
      header: "Provider",
      size: "auto" as unknown as number
    },
    {
      id: "active",
      header: () => <span className="block w-full text-center">Active</span>,
      cell: ({ row }) => {
        const model = row.original;

        return (
          <div className="flex items-center justify-center gap-2">
            <Checkbox
              id={`model-active-${model.id}`}
              checked={model.isActive}
              disabled={isLoadingEdit}
              onCheckedChange={(checked) =>
                toggleActive(model.id, checked === true)
              }
            />
            <Label
              htmlFor={`model-active-${model.id}`}
              className="sr-only"
            >
              Active
            </Label>
          </div>
        );
      },
      size: "auto" as unknown as number
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const model = row.original;

        return (
          <ModelRowActions
            model={model}
            editHandler={editModel}
            isLoadingEdit={isLoadingEdit}
            editDialogOpen={editDialogControl.isOpenFor(model.id)}
            onEditDialogOpenChange={(open) =>
              editDialogControl.onOpenChange(model.id, open)
            }
          />
        );
      },
      size: "auto" as unknown as number
    }
  ];
}
