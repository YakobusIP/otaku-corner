import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { GenreEntity } from "@/types/entity.type";
import EditEntityDialog from "../EditEntityDialog";

export const genreColumns = (
  editEntity: (id: number, entity: string) => void,
  isLoadingEditEntity: boolean
): ColumnDef<GenreEntity>[] => [
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
    header: "Genre Name",
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
      const genre = row.original;

      return (
        <EditEntityDialog
          entityType="Genre"
          entityId={genre.id}
          entity={genre.name}
          editHandler={editEntity}
          isLoadingEditEntity={isLoadingEditEntity}
        />
      );
    },
    size: "auto" as unknown as number
  }
];
