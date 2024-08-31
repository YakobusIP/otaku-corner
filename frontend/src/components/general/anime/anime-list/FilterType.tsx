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
  filterType?: string;
  handleFilterType: (key?: string) => void;
};

export default function FilterType({ filterType, handleFilterType }: Props) {
  const [isFilterTypeOpen, setIsFilterTypeOpen] = useState(false);

  const typeFilters = [
    { key: "TV", label: "TV" },
    { key: "Movie", label: "Movie" }
  ];

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterTypeOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full lg:w-fit">
          Filter by: {filterType || "Type"}
          {isFilterTypeOpen ? (
            <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterType(undefined)}>
          All Types
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {typeFilters.map((filter) => {
          return (
            <DropdownMenuItem
              key={filter.key}
              onClick={() => handleFilterType(filter.key)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  filterType === filter.key ? "opacity-100" : "opacity-0"
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
