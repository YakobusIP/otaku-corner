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
  filterMALScore?: string;
  handleFilterMALScore: (key?: string) => void;
};

export default function FilterMALScore({
  filterMALScore,
  handleFilterMALScore
}: Props) {
  const [isFilterMALScoreOpen, setIsFilterMALScoreOpen] = useState(false);

  const scoreFilters = [
    { key: "poor", label: "Poor (1 - 3)" },
    { key: "average", label: "Average (4 - 6)" },
    { key: "good", label: "Good (7 - 8)" },
    { key: "excellent", label: "Excellent (9 - 10)" }
  ];

  const selectedFilterMALScore = scoreFilters.find(
    (filter) => filter.key === filterMALScore
  );

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterMALScoreOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full lg:w-fit">
          Filter by:{" "}
          {selectedFilterMALScore ? selectedFilterMALScore.label : "MAL Score"}
          {isFilterMALScoreOpen ? (
            <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterMALScore(undefined)}>
          All MAL Scores
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {scoreFilters.map((filter) => {
          return (
            <DropdownMenuItem
              key={filter.key}
              onClick={() => handleFilterMALScore(filter.key)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  filterMALScore === filter.key ? "opacity-100" : "opacity-0"
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
