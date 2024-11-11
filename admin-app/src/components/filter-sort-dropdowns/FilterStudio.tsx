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

import { StudioEntity } from "@/types/entity.type";

import { cn } from "@/lib/utils";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon
} from "lucide-react";

type Props = {
  studioList: StudioEntity[];
  isLoadingStudio: boolean;
  filterStudio?: string;
  handleFilterStudio: (key?: string) => void;
};

export default function FilterStudio({
  studioList,
  isLoadingStudio,
  filterStudio,
  handleFilterStudio
}: Props) {
  const [isFilterStudioOpen, setIsFilterStudioOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterStudioOpen(value)}>
      <DropdownMenuTrigger asChild>
        {isLoadingStudio ? (
          <Button variant="outline" size="sm" className="w-full" disabled>
            <div className="flex items-center justify-center gap-2">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              Fetching studios...
            </div>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            Filter by:{" "}
            {studioList.find((studio) => studio.id === filterStudio)?.name ||
              "Studio"}
            {isFilterStudioOpen ? (
              <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterStudio(undefined)}>
          All Studios
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[200px]">
          {studioList.map((studio) => {
            return (
              <DropdownMenuItem
                key={studio.id}
                onClick={() => handleFilterStudio(studio.id)}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    filterStudio === studio.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {studio.name}
              </DropdownMenuItem>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
