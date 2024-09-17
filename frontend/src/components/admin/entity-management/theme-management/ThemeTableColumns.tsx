import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ThemeEntity } from "@/types/entity.type";
import EditEntityDialog from "../EditEntityDialog";

export const themeColumns = (
  editEntity: (id: number, entity: string) => void,
  isLoadingEditEntity: boolean
): ColumnDef<ThemeEntity>[] => [
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
    header: "Theme Name",
    size: "auto" as unknown as number
  },
  {
    accessorKey: "connectedMediaCount",
    header: "Media Count",
    size: "auto" as unknown as number
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const theme = row.original;

      return (
        <EditEntityDialog
          entityType="Theme"
          entityId={theme.id}
          entity={theme.name}
          editHandler={editEntity}
          isLoadingEditEntity={isLoadingEditEntity}
        />
      );
    },
    size: "auto" as unknown as number
  }
];
