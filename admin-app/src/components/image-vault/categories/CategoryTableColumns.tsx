import CategoryRowActions from "@/components/image-vault/categories/CategoryRowActions";
import { Checkbox } from "@/components/ui/checkbox";

import type { EditCategoryPayload } from "@/hooks/useImageVaultCategoryManagement";

import type {
  ImageVaultCatalogEditDialogControl,
  ImageVaultCategory
} from "@/types/image-vault.type";

import type { ColumnDef } from "@tanstack/react-table";

export function getCategoryTableColumns(
  editCategory: (payload: EditCategoryPayload) => void,
  isLoadingEdit: boolean,
  editDialogControl: ImageVaultCatalogEditDialogControl
): ColumnDef<ImageVaultCategory, unknown>[] {
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
      header: "Category Name",
      size: "auto" as unknown as number
    },
    {
      accessorKey: "slug",
      header: "Slug",
      size: "auto" as unknown as number
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;

        return (
          <CategoryRowActions
            category={category}
            editHandler={editCategory}
            isLoadingEdit={isLoadingEdit}
            editDialogOpen={editDialogControl.isOpenFor(category.id)}
            onEditDialogOpenChange={(open) =>
              editDialogControl.onOpenChange(category.id, open)
            }
          />
        );
      },
      size: "auto" as unknown as number
    }
  ];
}
