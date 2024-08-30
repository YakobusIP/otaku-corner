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
  filterScore: string;
  handleFilterScore: (key: string) => void;
};

export default function FilterScore({ filterScore, handleFilterScore }: Props) {
  const [isFilterScoreOpen, setIsFilterScoreOpen] = useState(false);

  const scoreFilters = [
    { key: "poor", label: "Poor (1 - 3)" },
    { key: "average", label: "Average (4 - 6)" },
    { key: "good", label: "Good (7 - 8)" },
    { key: "excellent", label: "Excellent (9 - 10)" }
  ];

  const selectedFilterScore = scoreFilters.find(
    (filter) => filter.key === filterScore
  );

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterScoreOpen(value)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Filter by: {selectedFilterScore ? selectedFilterScore.label : "Score"}
          {isFilterScoreOpen ? (
            <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterScore("")}>
          All Scores
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {scoreFilters.map((filter) => {
          return (
            <DropdownMenuItem
              key={filter.key}
              onClick={() => handleFilterScore(filter.key)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  filterScore === filter.key ? "opacity-100" : "opacity-0"
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
