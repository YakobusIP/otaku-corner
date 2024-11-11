import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { scoreOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type Props = {
  filterPersonalScore?: string;
  handleFilterPersonalScore: (key?: string) => void;
};

export default function FilterPersonalScore({
  filterPersonalScore,
  handleFilterPersonalScore
}: Props) {
  const [isFilterPersonalScoreOpen, setIsFilterPersonalScoreOpen] =
    useState(false);

  const selectedFilterPersonalScore = scoreOptions.find(
    (filter) => filter.key === filterPersonalScore
  );

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterPersonalScoreOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Filter by:{" "}
          {selectedFilterPersonalScore
            ? selectedFilterPersonalScore.optionLabel
            : "Personal Score"}
          {isFilterPersonalScoreOpen ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterPersonalScore(undefined)}>
          All Personal Scores
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {scoreOptions.map((filter) => {
          return (
            <DropdownMenuItem
              key={filter.key}
              onClick={() => handleFilterPersonalScore(filter.key)}
            >
              <CheckIcon
                className={cn(
                  "mr-2 h-4 w-4",
                  filterPersonalScore === filter.key
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
              {filter.optionLabel}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
