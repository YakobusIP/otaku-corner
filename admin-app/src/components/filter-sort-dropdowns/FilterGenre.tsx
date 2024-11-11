import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

import { GenreEntity } from "@/types/entity.type";

import { cn } from "@/lib/utils";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon
} from "lucide-react";

type Props = {
  genreList: GenreEntity[];
  isLoadingGenre: boolean;
  filterGenre?: string;
  handleFilterGenre: (key?: string) => void;
};

export default function FilterGenre({
  genreList,
  isLoadingGenre,
  filterGenre,
  handleFilterGenre
}: Props) {
  const [isFilterGenreOpen, setIsFilterGenreOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterGenreOpen(value)}>
      <DropdownMenuTrigger asChild>
        {isLoadingGenre ? (
          <Button variant="outline" size="sm" className="w-full" disabled>
            <div className="flex items-center justify-center gap-2">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              Fetching genres...
            </div>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            Filter by:{" "}
            {genreList.find((genre) => genre.id === filterGenre)?.name ||
              "Genre"}
            {isFilterGenreOpen ? (
              <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterGenre(undefined)}>
          All Genres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[200px]">
          {genreList.map((genre) => {
            return (
              <DropdownMenuItem
                key={genre.id}
                onClick={() => handleFilterGenre(genre.id)}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    filterGenre === genre.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {genre.name}
              </DropdownMenuItem>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
