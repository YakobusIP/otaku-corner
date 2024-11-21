import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type Props = {
  filterType?: string;
  handleFilterType: (key?: string) => void;
};

export default function FilterType({ filterType, handleFilterType }: Props) {
  const [isFilterTypeOpen, setIsFilterTypeOpen] = useState(false);

  const typeFilters = [
    { key: "TV", label: "TV" },
    { key: "OVA", label: "OVA" },
    { key: "Movie", label: "Movie" }
  ];

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterTypeOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Filter by: {filterType || "Type"}
          {isFilterTypeOpen ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
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
              <CheckIcon
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
