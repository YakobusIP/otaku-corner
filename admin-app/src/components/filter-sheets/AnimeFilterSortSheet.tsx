import { Dispatch, SetStateAction } from "react";

import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterProgressStatus from "@/components/filter-sort-dropdowns/FilterProgressStatus";
import FilterStatusCheck from "@/components/filter-sort-dropdowns/FilterStatusCheck";
import FilterStudio from "@/components/filter-sort-dropdowns/FilterStudio";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import FilterType from "@/components/filter-sort-dropdowns/FilterType";
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

import { AnimeFilterSort } from "@/types/anime.type";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { FilterIcon } from "lucide-react";

type Props = {
  animeFilterSort: AnimeFilterSort;
  setAnimeFilterSort: Dispatch<SetStateAction<AnimeFilterSort>>;
  genreList: GenreEntity[];
  isLoadingGenre: boolean;
  studioList: StudioEntity[];
  isLoadingStudio: boolean;
  themeList: ThemeEntity[];
  isLoadingTheme: boolean;
};

export default function AnimeFilterSortSheet({
  animeFilterSort,
  setAnimeFilterSort,
  genreList,
  isLoadingGenre,
  studioList,
  isLoadingStudio,
  themeList,
  isLoadingTheme
}: Props) {
  const isWideScreen = useWideScreen();

  const handleSort = (key: string) => {
    setAnimeFilterSort((prev) => ({
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

  const handleFilterGenre = (key?: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterGenre: key
    }));
  };

  const handleFilterStudio = (key?: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterStudio: key
    }));
  };

  const handleFilterTheme = (key?: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterTheme: key
    }));
  };

  const handleFilterProgressStatus = (key?: keyof typeof PROGRESS_STATUS) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterProgressStatus: key
    }));
  };

  const handleFilterMALScore = (key?: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterMALScore: key
    }));
  };

  const handleFilterPersonalScore = (key?: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterPersonalScore: key
    }));
  };

  const handleFilterType = (key?: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterType: key
    }));
  };

  const handleFilterStatusCheck = (key?: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterStatusCheck: key
    }));
  };

  const enableClearAllFilter =
    !animeFilterSort.filterGenre &&
    !animeFilterSort.filterStudio &&
    !animeFilterSort.filterTheme &&
    !animeFilterSort.filterMALScore &&
    !animeFilterSort.filterPersonalScore &&
    !animeFilterSort.filterType &&
    !animeFilterSort.filterStatusCheck;

  const handleClearAllFilter = () => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterGenre: undefined,
      filterStudio: undefined,
      filterTheme: undefined,
      filterMALScore: undefined,
      filterPersonalScore: undefined,
      filterType: undefined,
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
          <SheetTitle>Anime Filter & Sort</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[50vh] xl:h-auto">
          <div className="grid grid-cols-1 grid-rows-10 xl:grid-cols-5 xl:grid-rows-2 gap-4 mt-2">
            <SortDirection
              sortBy={animeFilterSort.sortBy}
              sortOrder={animeFilterSort.sortOrder}
              handleSort={handleSort}
            />
            <FilterGenre
              genreList={genreList}
              isLoadingGenre={isLoadingGenre}
              filterGenre={animeFilterSort.filterGenre}
              handleFilterGenre={handleFilterGenre}
            />
            <FilterStudio
              studioList={studioList}
              isLoadingStudio={isLoadingStudio}
              filterStudio={animeFilterSort.filterStudio}
              handleFilterStudio={handleFilterStudio}
            />
            <FilterTheme
              themeList={themeList}
              isLoadingTheme={isLoadingTheme}
              filterTheme={animeFilterSort.filterTheme}
              handleFilterTheme={handleFilterTheme}
            />
            <FilterProgressStatus
              filterProgressStatus={animeFilterSort.filterProgressStatus}
              handleFilterProgressStatus={handleFilterProgressStatus}
            />
            <FilterMALScore
              filterMALScore={animeFilterSort.filterMALScore}
              handleFilterMALScore={handleFilterMALScore}
            />
            <FilterPersonalScore
              filterPersonalScore={animeFilterSort.filterPersonalScore}
              handleFilterPersonalScore={handleFilterPersonalScore}
            />
            <FilterType
              filterType={animeFilterSort.filterType}
              handleFilterType={handleFilterType}
            />
            <FilterStatusCheck
              filterStatusCheck={animeFilterSort.filterStatusCheck}
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
