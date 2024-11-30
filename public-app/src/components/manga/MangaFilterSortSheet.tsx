"use client";

import { useContext } from "react";

import { MangaContext } from "@/components/context/MangaContext";
import FilterAuthor from "@/components/filter-sort-dropdowns/FilterAuthor";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterProgressStatus from "@/components/filter-sort-dropdowns/FilterProgressStatus";
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

import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { FilterIcon } from "lucide-react";

type Props = {
  authorList: AuthorEntity[];
  isLoadingAuthor?: boolean;
  genreList: GenreEntity[];
  isLoadingGenre?: boolean;
  themeList: ThemeEntity[];
  isLoadingTheme?: boolean;
};

export default function MangaFilterSortSheet({
  authorList,
  isLoadingAuthor = false,
  genreList,
  isLoadingGenre = false,
  themeList,
  isLoadingTheme = false
}: Props) {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("Filters must be used within an MangaProvider");
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

  const handleFilterAuthor = (key?: number) => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterAuthor: key
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

  const enableClearAllFilter =
    !state.filters.filterAuthor &&
    !state.filters.filterGenre &&
    !state.filters.filterTheme &&
    !state.filters.filterMALScore &&
    !state.filters.filterPersonalScore;

  const handleClearAllFilter = () => {
    setState({
      page: 1,
      filters: {
        ...state.filters,
        filterAuthor: undefined,
        filterGenre: undefined,
        filterTheme: undefined,
        filterMALScore: undefined,
        filterPersonalScore: undefined
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
          <SheetTitle>Manga Filter & Sort</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[50vh] xl:h-auto">
          <div className="grid grid-cols-1 grid-rows-10 xl:grid-cols-5 xl:grid-rows-2 gap-4 mt-2">
            <SortDirection
              sortBy={state.filters.sortBy}
              sortOrder={state.filters.sortOrder}
              handleSort={handleSort}
            />
            <FilterAuthor
              authorList={authorList}
              isLoadingAuthor={isLoadingAuthor}
              filterAuthor={state.filters.filterAuthor}
              handleFilterAuthor={handleFilterAuthor}
            />
            <FilterGenre
              genreList={genreList}
              isLoadingGenre={isLoadingGenre}
              filterGenre={state.filters.filterGenre}
              handleFilterGenre={handleFilterGenre}
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
