import { updateAnimeProgressStatusService } from "@/services/anime.service";

import ProgressStatus from "@/components/ProgressStatus";
import DataTableStatuses from "@/components/data-table/DataTableStatuses";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { AnimeList } from "@/types/anime.type";

import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDaysIcon,
  ListIcon,
  MoreHorizontalIcon,
  NotebookPenIcon
} from "lucide-react";
import { Link } from "react-router-dom";

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
      const {
        images,
        title,
        titleJapanese,
        type,
        review,
        consumedAt,
        fetchedEpisode
      } = data;

      const episodesFetched =
        !["Movie", "OVA"].includes(type) && fetchedEpisode > 0;

      const statusChecks = [
        {
          key: `${title}-anime-episode-status`,
          Trigger: ListIcon,
          condition: ["Movie", "OVA"].includes(type) || episodesFetched,
          triggerColor: {
            success: "text-green-700",
            failed: "text-destructive"
          },
          message: {
            success: "Episodes fetched",
            failed: "Episodes missing"
          }
        },
        {
          key: `${title}-anime-review-status`,
          Trigger: NotebookPenIcon,
          condition: !!review,
          triggerColor: {
            success: "text-green-700",
            failed: "text-destructive"
          },
          message: {
            success: "Review added",
            failed: "Review missing"
          }
        },
        {
          key: `${title}-anime-date-status`,
          Trigger: CalendarDaysIcon,
          condition: !!consumedAt,
          triggerColor: {
            success: "text-green-700",
            failed: "text-destructive"
          },
          message: {
            success: "Consumed date set",
            failed: "Consumed date missing"
          }
        }
      ];

      return (
        <div className="flex gap-2 items-center">
          <img
            src={images.image_url || undefined}
            className="w-[50px] h-[75px] object-cover"
          />
          <div className="flex flex-col w-full">
            <p className="font-bold line-clamp-2">{title}</p>
            <p className="text-muted-foreground line-clamp-1">
              {titleJapanese}
            </p>
            <DataTableStatuses checks={statusChecks} />
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
            <Link to={"/anime/" + anime.id}>
              <DropdownMenuItem>View details</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: "auto" as unknown as number
  }
];
