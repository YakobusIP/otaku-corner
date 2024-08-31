import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { GenreEntity } from "@/types/entity.type";

type Props = {
  genreList: GenreEntity[];
  isLoadingGenre: boolean;
  filterGenre?: number;
  handleFilterGenre: (key?: number) => void;
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
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching genres...
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            Filter by:{" "}
            {genreList.find((genre) => genre.id === filterGenre)?.name ||
              "Genre"}
            {isFilterGenreOpen ? (
              <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterGenre(undefined)}>
          All Genres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {genreList.map((genre) => {
          return (
            <DropdownMenuItem
              key={genre.id}
              onClick={() => handleFilterGenre(genre.id)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  filterGenre === genre.id ? "opacity-100" : "opacity-0"
                )}
              />
              {genre.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
