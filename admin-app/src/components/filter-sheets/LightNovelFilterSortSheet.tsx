import { Dispatch, SetStateAction } from "react";

import FilterAuthor from "@/components/filter-sort-dropdowns/FilterAuthor";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterProgressStatus from "@/components/filter-sort-dropdowns/FilterProgressStatus";
import FilterStatusCheck from "@/components/filter-sort-dropdowns/FilterStatusCheck";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import useWideScreen from "@/hooks/useWideScreen";

import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import { LightNovelFilterSort } from "@/types/lightnovel.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { FilterIcon } from "lucide-react";

type Props = {
  lightNovelFilterSort: LightNovelFilterSort;
  setLightNovelFilterSort: Dispatch<SetStateAction<LightNovelFilterSort>>;
  authorList: AuthorEntity[];
  isLoadingAuthor: boolean;
  genreList: GenreEntity[];
  isLoadingGenre: boolean;
  themeList: ThemeEntity[];
  isLoadingTheme: boolean;
};

export default function LightNovelFilterSortSheet({
  lightNovelFilterSort,
  setLightNovelFilterSort,
  authorList,
  isLoadingAuthor,
  genreList,
  isLoadingGenre,
  themeList,
  isLoadingTheme
}: Props) {
  const isWideScreen = useWideScreen();

  const handleSort = (key: string) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder:
        prev.sortBy === key
          ? prev.sortOrder === SORT_ORDER.ASCENDING
            ? SORT_ORDER.DESCENDING
            : SORT_ORDER.ASCENDING
          : SORT_ORDER.ASCENDING
    }));
  };

  const handleFilterAuthor = (key?: number) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterAuthor: key
    }));
  };

  const handleFilterGenre = (key?: number) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterGenre: key
    }));
  };

  const handleFilterTheme = (key?: number) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterTheme: key
    }));
  };

  const handleFilterProgressStatus = (key?: keyof typeof PROGRESS_STATUS) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterProgressStatus: key
    }));
  };

  const handleFilterMALScore = (key?: string) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterMALScore: key
    }));
  };

  const handleFilterPersonalScore = (key?: string) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterPersonalScore: key
    }));
  };

  const handleFilterStatusCheck = (key?: string) => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterStatusCheck: key
    }));
  };

  const enableClearAllFilter =
    !lightNovelFilterSort.filterAuthor &&
    !lightNovelFilterSort.filterGenre &&
    !lightNovelFilterSort.filterTheme &&
    !lightNovelFilterSort.filterMALScore &&
    !lightNovelFilterSort.filterPersonalScore &&
    !lightNovelFilterSort.filterStatusCheck;

  const handleClearAllFilter = () => {
    setLightNovelFilterSort((prev) => ({
      ...prev,
      filterAuthor: undefined,
      filterGenre: undefined,
      filterTheme: undefined,
      filterMALScore: undefined,
      filterPersonalScore: undefined,
      filterStatusCheck: undefined
    }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="w-4 h-4" />
          {isWideScreen && "Filter & Sort"}
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Light Novel Filter & Sort</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[50vh] xl:h-auto">
          <div className="grid grid-cols-1 grid-rows-9 xl:grid-cols-5 xl:grid-rows-2 gap-4 mt-2">
            <SortDirection
              sortBy={lightNovelFilterSort.sortBy}
              sortOrder={lightNovelFilterSort.sortOrder}
              handleSort={handleSort}
            />
            <FilterAuthor
              authorList={authorList}
              isLoadingAuthor={isLoadingAuthor}
              filterAuthor={lightNovelFilterSort.filterAuthor}
              handleFilterAuthor={handleFilterAuthor}
            />
            <FilterGenre
              genreList={genreList}
              isLoadingGenre={isLoadingGenre}
              filterGenre={lightNovelFilterSort.filterGenre}
              handleFilterGenre={handleFilterGenre}
            />
            <FilterTheme
              themeList={themeList}
              isLoadingTheme={isLoadingTheme}
              filterTheme={lightNovelFilterSort.filterTheme}
              handleFilterTheme={handleFilterTheme}
            />
            <FilterProgressStatus
              filterProgressStatus={lightNovelFilterSort.filterProgressStatus}
              handleFilterProgressStatus={handleFilterProgressStatus}
            />
            <FilterMALScore
              filterMALScore={lightNovelFilterSort.filterMALScore}
              handleFilterMALScore={handleFilterMALScore}
            />
            <FilterPersonalScore
              filterPersonalScore={lightNovelFilterSort.filterPersonalScore}
              handleFilterPersonalScore={handleFilterPersonalScore}
            />
            <FilterStatusCheck
              filterStatusCheck={lightNovelFilterSort.filterStatusCheck}
              handleFilterStatusCheck={handleFilterStatusCheck}
            />
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={enableClearAllFilter}
              onClick={handleClearAllFilter}
            >
              Clear All
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
