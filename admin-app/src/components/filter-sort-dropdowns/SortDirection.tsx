import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { SORT_ORDER } from "@/lib/enums";
import { cn } from "@/lib/utils";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

type Props = {
  sort?: string;
  order?: SORT_ORDER;
  handleSort: (key: string) => void;
  /** Narrow, centered trigger on small screens (e.g. media library toolbar). */
  compactMobile?: boolean;
};

export default function SortDirection({
  sort,
  order,
  handleSort,
  compactMobile = false
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className={cn(
            "h-10 min-w-0 shrink-0 gap-1 px-2 text-sm tablet:w-auto tablet:max-w-52 tablet:px-3 desktop:w-auto desktop:max-w-52 desktop:px-3 lg:max-w-none lg:min-w-[170px]",
            compactMobile
              ? "w-auto justify-center px-3 tablet:justify-start desktop:justify-start"
              : "w-full justify-center tablet:justify-start desktop:justify-start"
          )}
        >
          <span className="min-w-0 truncate text-center tablet:text-left desktop:text-left">
            Sort by:{" "}
            {sort === "title"
              ? "Title"
              : sort === "score"
                ? "MAL Score"
                : "Personal Score"}
          </span>
          {order === SORT_ORDER.ASCENDING ? (
            <ArrowUpIcon className="ml-1 h-4 w-4 shrink-0" />
          ) : (
            <ArrowDownIcon className="ml-1 h-4 w-4 shrink-0" />
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
