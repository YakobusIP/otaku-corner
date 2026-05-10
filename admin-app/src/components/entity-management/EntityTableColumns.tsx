import EntityRowActions from "@/components/entity-management/EntityRowActions";
import { Checkbox } from "@/components/ui/checkbox";

import type { EntityEditDialogControl } from "@/hooks/useEntityTabManagement";

import { ColumnDef } from "@tanstack/react-table";

export type MediaCountableEntityRow = {
  id: number;
  name: string;
  connectedMediaCount?: number;
};

export function getMediaEntityTableColumns<T extends MediaCountableEntityRow>(
  entityTypeLabel: string,
  editEntity: (id: number, name: string) => void,
  isLoadingEditEntity: boolean,
  editDialogControl: EntityEditDialogControl
): ColumnDef<T, unknown>[] {
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
    header: `${entityTypeLabel} Name`,
    size: "auto" as unknown as number
  },
  {
    accessorKey: "connectedMediaCount",
    header: () => (
      <span className="block w-full text-right">Media Count</span>
    ),
    cell: ({ row }) => (
      <span className="block w-full text-right tabular-nums">
        {row.original.connectedMediaCount ?? 0}
      </span>
    ),
    size: "auto" as unknown as number
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const entity = row.original;

      return (
        <EntityRowActions
          entityType={entityTypeLabel}
          entityId={entity.id}
          name={entity.name}
          editHandler={editEntity}
          isLoadingEditEntity={isLoadingEditEntity}
          editDialogOpen={editDialogControl.isOpenFor(entity.id)}
          onEditDialogOpenChange={(open) =>
            editDialogControl.onOpenChange(entity.id, open)
          }
        />
      );
    },
    size: "auto" as unknown as number
  }
  ];
}
