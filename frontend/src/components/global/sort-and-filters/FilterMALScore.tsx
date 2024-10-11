import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { scoreOptions } from "@/lib/constants";

type Props = {
  filterMALScore?: string;
  handleFilterMALScore: (key?: string) => void;
};

export default function FilterMALScore({
  filterMALScore,
  handleFilterMALScore
}: Props) {
  const [isFilterMALScoreOpen, setIsFilterMALScoreOpen] = useState(false);

  const selectedFilterMALScore = scoreOptions.find(
    (filter) => filter.key === filterMALScore
  );

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterMALScoreOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Filter by:{" "}
          {selectedFilterMALScore
            ? selectedFilterMALScore.optionLabel
            : "MAL Score"}
          {isFilterMALScoreOpen ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterMALScore(undefined)}>
          All MAL Scores
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {scoreOptions.map((filter) => {
          return (
            <DropdownMenuItem
              key={filter.key}
              onClick={() => handleFilterMALScore(filter.key)}
            >
              <CheckIcon
                className={cn(
                  "mr-2 h-4 w-4",
                  filterMALScore === filter.key ? "opacity-100" : "opacity-0"
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
