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
  filterStatusCheck?: string;
  handleFilterStatusCheck: (key?: string) => void;
};

export default function FilterStatusCheck({
  filterStatusCheck,
  handleFilterStatusCheck
}: Props) {
  const [isFilterStatusCheckOpen, setIsFilterStatusCheckOpen] = useState(false);

  const typeFilters = [
    { key: "complete", label: "Completed" },
    { key: "incomplete", label: "Incomplete" }
  ];

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterStatusCheckOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Filter by:{" "}
          {filterStatusCheck === "complete"
            ? "Completed"
            : filterStatusCheck === "incomplete"
              ? "Incomplete"
              : "Status Check"}
          {isFilterStatusCheckOpen ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterStatusCheck(undefined)}>
          All Status Checks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {typeFilters.map((filter) => {
          return (
            <DropdownMenuItem
              key={filter.key}
              onClick={() => handleFilterStatusCheck(filter.key)}
            >
              <CheckIcon
                className={cn(
                  "mr-2 h-4 w-4",
                  filterStatusCheck === filter.key ? "opacity-100" : "opacity-0"
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
