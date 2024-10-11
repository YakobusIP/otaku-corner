import { Checkbox } from "@/components/ui/checkbox";
import { AnimeList } from "@/types/anime.type";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import ProgressStatus from "@/components/admin/ProgressStatus";
import { updateAnimeProgressStatusService } from "@/services/anime.service";

export const animeColumns: ColumnDef<AnimeList>[] = [
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const data = row.original;
      const image_url = data.images.image_url;
      const title = data.title;
      const title_japanese = data.titleJapanese;

      return (
        <div className="flex gap-2 items-center">
          <img src={image_url ?? undefined} width="50" height="74" />
          <div className="flex flex-col">
            <p className="font-bold">{title}</p>
            <p className="text-muted-foreground">{title_japanese}</p>
          </div>
        </div>
      );
    },
    size: 300
  },
  {
    accessorKey: "type",
    header: "Type",
    size: "auto" as unknown as number
  },
  {
    accessorKey: "status",
    header: "Status",
    size: "auto" as unknown as number
  },
  {
    accessorKey: "progressStatus",
    header: "Progress Status",
    cell: ({ row }) => {
      const anime = row.original;
      return (
        <ProgressStatus
          id={anime.id}
          progressStatus={anime.progressStatus}
          serviceFn={updateAnimeProgressStatusService}
        />
      );
    },
    size: "auto" as unknown as number
  },
  {
    accessorKey: "score",
    header: "MAL Score",
    cell: ({ getValue }) => {
      const score = getValue<number>();
      return score.toFixed(2);
    },
    size: "auto" as unknown as number
  },
  {
    accessorKey: "personalScore",
    header: "Personal Score",
    cell: ({ getValue }) => {
      const score = getValue<number | null>();
      if (score) {
        return score.toFixed(2);
      } else {
        return "N/A";
      }
    },
    size: "auto" as unknown as number
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const anime = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link to={"anime/" + anime.id}>
              <DropdownMenuItem>View details</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: "auto" as unknown as number
  }
];
