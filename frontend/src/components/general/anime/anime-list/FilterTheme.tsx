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
import { ThemeEntity } from "@/types/entity.type";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  themeList: ThemeEntity[];
  isLoadingTheme: boolean;
  filterTheme?: number;
  handleFilterTheme: (key?: number) => void;
};

export default function FilterTheme({
  themeList,
  isLoadingTheme,
  filterTheme,
  handleFilterTheme
}: Props) {
  const [isFilterThemeOpen, setIsFilterThemeOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(value) => setIsFilterThemeOpen(value)}>
      <DropdownMenuTrigger asChild>
        {isLoadingTheme ? (
          <Button variant="outline" size="sm" className="w-full" disabled>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching themes...
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            Filter by:{" "}
            {themeList.find((theme) => theme.id === filterTheme)?.name ||
              "Theme"}
            {isFilterThemeOpen ? (
              <ChevronUp className="ml-2 h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleFilterTheme(undefined)}>
          All Themes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[200px]">
          {themeList.map((theme) => {
            return (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => handleFilterTheme(theme.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    filterTheme === theme.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {theme.name}
              </DropdownMenuItem>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
