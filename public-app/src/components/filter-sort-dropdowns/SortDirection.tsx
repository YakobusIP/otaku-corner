import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { SORT_ORDER } from "@/lib/shared/enums";
import { cn } from "@/lib/shared/utils";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

type Props = {
  sort?: string;
  order?: SORT_ORDER;
  handleSort: (key: string) => void;
  compactBelowMd?: boolean;
};

const sortLabel = (sort?: string) =>
  sort === "title"
    ? "Title"
    : sort === "score"
      ? "MAL Score"
      : "Personal Score";

export default function SortDirection({
  sort,
  order,
  handleSort,
  compactBelowMd = false
}: Props) {
  const orderIcon = (
    <span className="shrink-0">
      {order === SORT_ORDER.ASCENDING ? (
        <ArrowUpIcon className="h-4 w-4" />
      ) : (
        <ArrowDownIcon className="h-4 w-4" />
      )}
    </span>
  );

  const sortLabelContent = (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      {orderIcon}
      <span>Sort by: {sortLabel(sort)}</span>
    </span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Sort by ${sortLabel(sort)}`}
          className={cn(
            "bg-white/60 backdrop-blur-sm border-white/40",
            compactBelowMd
              ? "max-md:size-10 max-md:shrink-0 max-md:justify-center max-md:px-0 md:h-10 md:w-fit md:px-4"
              : "w-full sm:w-fit"
          )}
        >
          {compactBelowMd ? (
            <>
              <ArrowUpDownIcon className="h-4 w-4 md:hidden" />
              <span className="hidden md:contents">{sortLabelContent}</span>
            </>
          ) : (
            sortLabelContent
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dropdown-content-width-full">
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
