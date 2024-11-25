import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { PROGRESS_STATUS } from "@/lib/enums";
import { cn } from "@/lib/utils";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type Props = {
  filterProgressStatus?: keyof typeof PROGRESS_STATUS;
  handleFilterProgressStatus: (key?: keyof typeof PROGRESS_STATUS) => void;
};

export default function FilterProgressStatus({
  filterProgressStatus,
  handleFilterProgressStatus
}: Props) {
  const [isFilterProgressStatusOpen, setIsFilterProgressStatusOpen] =
    useState(false);

  return (
    <DropdownMenu
      onOpenChange={(value) => setIsFilterProgressStatusOpen(value)}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Filter by:{" "}
          {filterProgressStatus
            ? PROGRESS_STATUS[filterProgressStatus]
            : "Progress Status"}
          {isFilterProgressStatusOpen ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterProgressStatus(undefined)}>
          All Progress Status
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {(
          Object.keys(PROGRESS_STATUS) as Array<keyof typeof PROGRESS_STATUS>
        ).map((filter) => {
          return (
            <DropdownMenuItem
              key={filter}
              onClick={() => handleFilterProgressStatus(filter)}
            >
              <CheckIcon
                className={cn(
                  "mr-2 h-4 w-4",
                  filterProgressStatus === filter ? "opacity-100" : "opacity-0"
                )}
              />
              {PROGRESS_STATUS[filter]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
