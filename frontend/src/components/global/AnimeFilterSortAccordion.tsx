import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { SortOrder } from "@/enum/general.enum";
import SortDirection from "@/components/general/anime/anime-list/SortDirection";
import FilterGenre from "@/components/general/anime/anime-list/FilterGenre";
import FilterStudio from "@/components/general/anime/anime-list/FilterStudio";
import FilterTheme from "@/components/general/anime/anime-list/FilterTheme";
import FilterMALScore from "@/components/general/anime/anime-list/FilterMALScore";
import FilterPersonalScore from "@/components/general/anime/anime-list/FilterPersonalScore";
import FilterType from "@/components/general/anime/anime-list/FilterType";
import { AnimeFilterSort } from "@/types/anime.type";
import { GenreEntity, StudioEntity, ThemeEntity } from "@/types/entity.type";

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

export default function AnimeFilterSortAccordion({
  animeFilterSort,
  setAnimeFilterSort,
  genreList,
  isLoadingGenre,
  studioList,
  isLoadingStudio,
  themeList,
  isLoadingTheme
}: Props) {
  const handleSort = (key: string) => {
    setAnimeFilterSort((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder:
        prev.sortBy === key
          ? prev.sortOrder === SortOrder.ASCENDING
            ? SortOrder.DESCENDING
            : SortOrder.ASCENDING
          : SortOrder.ASCENDING
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
              <Filter />
              <p className="text-base tracking-normal font-semibold">
                Filter & Sort
              </p>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 grid-rows-8 lg:grid-cols-4 lg:grid-rows-2 gap-4">
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
