import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AuthorEntity } from "@/types/entity.type";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  authorList: AuthorEntity[];
  isLoadingAuthor: boolean;
  filterAuthor?: number;
  handleFilterAuthor: (key?: number) => void;
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
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching authors...
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            Filter by:{" "}
            {authorList.find((author) => author.id === filterAuthor)?.name ||
              "Author"}
            {isFilterAuthorOpen ? (
              <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
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
                <Check
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
