import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { SORT_ORDER } from "@/lib/enums";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

type Props = {
  sortBy: string;
  sortOrder: SORT_ORDER;
  handleSort: (key: string) => void;
};

export default function SortDirection({
  sortBy,
  sortOrder,
  handleSort
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Sort by:{" "}
          {sortBy === "title"
            ? "Title"
            : sortBy === "score"
              ? "MAL Score"
              : "Personal Score"}
          {sortOrder === SORT_ORDER.ASCENDING ? (
            <ArrowUpIcon className="ml-2 w-4 h-4" />
          ) : (
            <ArrowDownIcon className="ml-2 w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleSort("title")}>
          Title
          {sortBy === "title" && (
            <span className="ml-1">
              {sortOrder === SORT_ORDER.ASCENDING ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("score")}>
          MAL Score
          {sortBy === "score" && (
            <span className="ml-1">
              {sortOrder === SORT_ORDER.ASCENDING ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("personal_score")}>
          Personal Score
          {sortBy === "personal_score" && (
            <span className="ml-1">
              {sortOrder === SORT_ORDER.ASCENDING ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
