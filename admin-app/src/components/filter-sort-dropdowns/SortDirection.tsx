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
  sort?: string;
  order?: SORT_ORDER;
  handleSort: (key: string) => void;
};

export default function SortDirection({ sort, order, handleSort }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Sort by:{" "}
          {sort === "title"
            ? "Title"
            : sort === "score"
              ? "MAL Score"
              : "Personal Score"}
          {order === SORT_ORDER.ASCENDING ? (
            <ArrowUpIcon className="ml-2 w-4 h-4" />
          ) : (
            <ArrowDownIcon className="ml-2 w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleSort("title")}>
          Title
          {sort === "title" && (
            <span className="ml-1">
              {order === SORT_ORDER.ASCENDING ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("score")}>
          MAL Score
          {sort === "score" && (
            <span className="ml-1">
              {order === SORT_ORDER.ASCENDING ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("personal_score")}>
          Personal Score
          {sort === "personal_score" && (
            <span className="ml-1">
              {order === SORT_ORDER.ASCENDING ? (
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
