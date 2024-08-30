import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  filterGenre: string;
  handleFilterGenre: (key: string) => void;
};

export default function FilterGenre({ filterGenre, handleFilterGenre }: Props) {
  const [isFilterGenreOpen, setIsFilterGenreOpen] = useState(false);

  const genreFilters = [
    { key: "Action", label: "Action" },
    { key: "Adventure", label: "Adventure" },
    { key: "Comedy", label: "Comedy" },
    { key: "Drama", label: "Drama" },
    { key: "Fantasy", label: "Fantasy" },
    { key: "Psychological", label: "Psychological" },
    { key: "Sci-Fi", label: "Sci-Fi" },
    { key: "Thriller", label: "Thriller" }
  ];
  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterGenreOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Filter by: {filterGenre || "Genre"}
          {isFilterGenreOpen ? (
            <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterGenre("")}>
          All Genres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {genreFilters.map((filter) => {
          return (
            <DropdownMenuItem
              key={filter.key}
              onClick={() => handleFilterGenre(filter.key)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  filterGenre === filter.key ? "opacity-100" : "opacity-0"
                )}
              />
              {filter.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
