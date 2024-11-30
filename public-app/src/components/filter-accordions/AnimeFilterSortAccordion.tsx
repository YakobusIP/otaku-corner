"use client";

import { Dispatch, SetStateAction } from "react";

import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterProgressStatus from "@/components/filter-sort-dropdowns/FilterProgressStatus";
import FilterStudio from "@/components/filter-sort-dropdowns/FilterStudio";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import FilterType from "@/components/filter-sort-dropdowns/FilterType";
import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import { AnimeFilterSort } from "@/types/anime.type";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { FilterIcon } from "lucide-react";

type Props = {
  animeFilterSort: AnimeFilterSort;
  setAnimeFilterSort: Dispatch<SetStateAction<AnimeFilterSort>>;
  genreList: GenreEntity[];
  isLoadingGenre?: boolean;
  studioList: StudioEntity[];
  isLoadingStudio?: boolean;
  themeList: ThemeEntity[];
  isLoadingTheme?: boolean;
};

export default function AnimeFilterSortAccordion({
  animeFilterSort,
  setAnimeFilterSort,
  genreList,
  isLoadingGenre = false,
  studioList,
  isLoadingStudio = false,
  themeList,
  isLoadingTheme = false
}: Props) {
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

  const handleFilterGenre = (key?: number) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterGenre: key
    }));
  };

  const handleFilterStudio = (key?: number) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterStudio: key
    }));
  };

  const handleFilterTheme = (key?: number) => {
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

  const enableClearAllFilter =
    !animeFilterSort.filterGenre &&
    !animeFilterSort.filterStudio &&
    !animeFilterSort.filterTheme &&
    !animeFilterSort.filterMALScore &&
    !animeFilterSort.filterPersonalScore &&
    !animeFilterSort.filterType;

  const handleClearAllFilter = () => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      filterGenre: undefined,
      filterStudio: undefined,
      filterTheme: undefined,
      filterMALScore: undefined,
      filterPersonalScore: undefined,
      filterType: undefined
    }));
  };

  return (
    <section className="mb-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="filter-and-sort">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center justify-center gap-2">
              <FilterIcon />
              <p className="text-base tracking-normal font-semibold">
                Filter & Sort
              </p>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 grid-rows-9 xl:grid-cols-5 xl:grid-rows-2 gap-4">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
