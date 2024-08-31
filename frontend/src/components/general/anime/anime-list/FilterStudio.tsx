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
import { StudioEntity } from "@/types/entity.type";

type Props = {
  studioList: StudioEntity[];
  isLoadingStudio: boolean;
  filterStudio?: number;
  handleFilterStudio: (key?: number) => void;
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
          <Button variant="outline" size="sm" disabled>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching studios...
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            Filter by:{" "}
            {studioList.find((studio) => studio.id === filterStudio)?.name ||
              "Studio"}
            {isFilterStudioOpen ? (
              <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterStudio(undefined)}>
          All Studios
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {studioList.map((studio) => {
          return (
            <DropdownMenuItem
              key={studio.id}
              onClick={() => handleFilterStudio(studio.id)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  filterStudio === studio.id ? "opacity-100" : "opacity-0"
                )}
              />
              {studio.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
