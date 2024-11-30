"use client";

import { useContext } from "react";

import { AnimeContext } from "@/components/context/AnimeContext";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterProgressStatus from "@/components/filter-sort-dropdowns/FilterProgressStatus";
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

import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { FilterIcon } from "lucide-react";

type Props = {
  genreList: GenreEntity[];
  isLoadingGenre?: boolean;
  studioList: StudioEntity[];
  isLoadingStudio?: boolean;
  themeList: ThemeEntity[];
  isLoadingTheme?: boolean;
};

export default function AnimeFilterSortSheet({
  genreList,
  isLoadingGenre = false,
  studioList,
  isLoadingStudio = false,
  themeList,
  isLoadingTheme = false
}: Props) {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("Filters must be used within an AnimeProvider");
  }

  const { state, setState } = context;

  const handleSort = (key: string) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        sortBy: key,
        sortOrder:
          state.filters.sortBy === key
            ? state.filters.sortOrder === SORT_ORDER.ASCENDING
              ? SORT_ORDER.DESCENDING
              : SORT_ORDER.ASCENDING
            : SORT_ORDER.ASCENDING
      }
    });
  };

  const handleFilterGenre = (key?: number) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterGenre: key
      }
    });
  };

  const handleFilterStudio = (key?: number) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterStudio: key
      }
    });
  };

  const handleFilterTheme = (key?: number) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterTheme: key
      }
    });
  };

  const handleFilterProgressStatus = (key?: keyof typeof PROGRESS_STATUS) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterProgressStatus: key
      }
    });
  };

  const handleFilterMALScore = (key?: string) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterMALScore: key
      }
    });
  };

  const handleFilterPersonalScore = (key?: string) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterPersonalScore: key
      }
    });
  };

  const handleFilterType = (key?: string) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterType: key
      }
    });
  };

  const enableClearAllFilter =
    !state.filters.filterGenre &&
    !state.filters.filterStudio &&
    !state.filters.filterTheme &&
    !state.filters.filterMALScore &&
    !state.filters.filterPersonalScore &&
    !state.filters.filterType;

  const handleClearAllFilter = () => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterGenre: undefined,
        filterStudio: undefined,
        filterTheme: undefined,
        filterMALScore: undefined,
        filterPersonalScore: undefined,
        filterType: undefined
      }
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-fit mb-2">
          <FilterIcon className="w-4 h-4" />
          Filter & Sort
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Anime Filter & Sort</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[50vh] xl:h-auto">
          <div className="grid grid-cols-1 grid-rows-10 xl:grid-cols-5 xl:grid-rows-2 gap-4 mt-2">
            <SortDirection
              sortBy={state.filters.sortBy}
              sortOrder={state.filters.sortOrder}
              handleSort={handleSort}
            />
            <FilterGenre
              genreList={genreList}
              isLoadingGenre={isLoadingGenre}
              filterGenre={state.filters.filterGenre}
              handleFilterGenre={handleFilterGenre}
            />
            <FilterStudio
              studioList={studioList}
              isLoadingStudio={isLoadingStudio}
              filterStudio={state.filters.filterStudio}
              handleFilterStudio={handleFilterStudio}
            />
            <FilterTheme
              themeList={themeList}
              isLoadingTheme={isLoadingTheme}
              filterTheme={state.filters.filterTheme}
              handleFilterTheme={handleFilterTheme}
            />
            <FilterProgressStatus
              filterProgressStatus={state.filters.filterProgressStatus}
              handleFilterProgressStatus={handleFilterProgressStatus}
            />
            <FilterMALScore
              filterMALScore={state.filters.filterMALScore}
              handleFilterMALScore={handleFilterMALScore}
            />
            <FilterPersonalScore
              filterPersonalScore={state.filters.filterPersonalScore}
              handleFilterPersonalScore={handleFilterPersonalScore}
            />
            <FilterType
              filterType={state.filters.filterType}
              handleFilterType={handleFilterType}
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
