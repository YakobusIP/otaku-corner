import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

import { AuthorEntity } from "@/types/entity.type";

import { cn } from "@/lib/utils";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon
} from "lucide-react";

type Props = {
  authorList: AuthorEntity[];
  isLoadingAuthor: boolean;
  filterAuthor?: string;
  handleFilterAuthor: (key?: string) => void;
};

export default function FilterAuthor({
  authorList,
  isLoadingAuthor,
  filterAuthor,
  handleFilterAuthor
}: Props) {
  const [isFilterAuthorOpen, setIsFilterAuthorOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterAuthorOpen(value)}>
      <DropdownMenuTrigger asChild>
        {isLoadingAuthor ? (
          <Button variant="outline" size="sm" className="w-full" disabled>
            <div className="flex items-center justify-center gap-2">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              Fetching authors...
            </div>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            Filter by:{" "}
            {authorList.find((author) => author.id === filterAuthor)?.name ||
              "Author"}
            {isFilterAuthorOpen ? (
              <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterAuthor(undefined)}>
          All Authors
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[200px]">
          {authorList.map((author) => {
            return (
              <DropdownMenuItem
                key={author.id}
                onClick={() => handleFilterAuthor(author.id)}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    filterAuthor === author.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {author.name}
              </DropdownMenuItem>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
