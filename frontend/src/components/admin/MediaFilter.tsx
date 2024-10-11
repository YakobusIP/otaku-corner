import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownChecked
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";

type Props = {
  mediaFilters: DropdownChecked[];
  handleMediaFilters: (index: number, checked: DropdownChecked) => void;
};

export default function MediaFilter({
  mediaFilters,
  handleMediaFilters
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <EyeIcon className="w-4 h-4" />
          <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">
            Visibility
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Visible Media</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={mediaFilters[0]}
          onCheckedChange={(checked) => handleMediaFilters(0, checked)}
        >
          Anime
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={mediaFilters[1]}
          onCheckedChange={(checked) => handleMediaFilters(1, checked)}
        >
          Manga
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={mediaFilters[2]}
          onCheckedChange={(checked) => handleMediaFilters(2, checked)}
        >
          Light Novel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
