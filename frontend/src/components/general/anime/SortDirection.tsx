import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SortOrder } from "@/enum/general.enum";
import { ArrowDown, ArrowUp } from "lucide-react";

type Props = {
  sortBy: string;
  sortOrder: SortOrder;
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
        <Button variant="outline" size="sm">
          Sort by: {sortBy === "title" ? "Title" : "Rating"}
          {sortOrder === SortOrder.ASCENDING ? (
            <ArrowUp className="ml-2 w-4 h-4" />
          ) : (
            <ArrowDown className="ml-2 w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleSort("title")}>
          Title
          {sortBy === "title" && (
            <span className="ml-1">
              {sortOrder === SortOrder.ASCENDING ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("rating")}>
          Rating
          {sortBy === "rating" && (
            <span className="ml-1">
              {sortOrder === SortOrder.ASCENDING ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
