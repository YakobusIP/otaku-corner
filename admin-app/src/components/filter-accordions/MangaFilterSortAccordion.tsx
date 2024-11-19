import { Dispatch, SetStateAction } from "react";

import FilterAuthor from "@/components/filter-sort-dropdowns/FilterAuthor";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterStatusCheck from "@/components/filter-sort-dropdowns/FilterStatusCheck";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import { AuthorEntity, GenreEntity, ThemeEntity } from "@/types/entity.type";
import { MangaFilterSort } from "@/types/manga.type";

import { SORT_ORDER } from "@/lib/enums";

import { FilterIcon } from "lucide-react";

type Props = {
  mangaFilterSort: MangaFilterSort;
  setMangaFilterSort: Dispatch<SetStateAction<MangaFilterSort>>;
  genreList: GenreEntity[];
  isLoadingGenre: boolean;
  authorList: AuthorEntity[];
  isLoadingAuthor: boolean;
  themeList: ThemeEntity[];
  isLoadingTheme: boolean;
};

export default function MangaFilterSortAccordion({
  mangaFilterSort,
  setMangaFilterSort,
  genreList,
  isLoadingGenre,
  authorList,
  isLoadingAuthor,
  themeList,
  isLoadingTheme
}: Props) {
  const handleSort = (key: string) => {
    setMangaFilterSort((prev) => ({
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

  const handleFilterAuthor = (key?: string) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterAuthor: key
    }));
  };

  const handleFilterGenre = (key?: string) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterGenre: key
    }));
  };

  const handleFilterTheme = (key?: string) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterTheme: key
    }));
  };

  const handleFilterMALScore = (key?: string) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterMALScore: key
    }));
  };

  const handleFilterPersonalScore = (key?: string) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterPersonalScore: key
    }));
  };

  const handleFilterStatusCheck = (key?: string) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterStatusCheck: key
    }));
  };

  const enableClearAllFilter =
    !mangaFilterSort.filterAuthor &&
    !mangaFilterSort.filterGenre &&
    !mangaFilterSort.filterTheme &&
    !mangaFilterSort.filterMALScore &&
    !mangaFilterSort.filterPersonalScore &&
    !mangaFilterSort.filterStatusCheck;

  const handleClearAllFilter = () => {
    setMangaFilterSort((prev) => ({
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
            <div className="grid grid-cols-1 grid-rows-8 xl:grid-cols-4 xl:grid-rows-2 gap-4">
              <SortDirection
                sortBy={mangaFilterSort.sortBy}
                sortOrder={mangaFilterSort.sortOrder}
                handleSort={handleSort}
              />
              <FilterAuthor
                authorList={authorList}
                isLoadingAuthor={isLoadingAuthor}
                filterAuthor={mangaFilterSort.filterAuthor}
                handleFilterAuthor={handleFilterAuthor}
              />
              <FilterGenre
                genreList={genreList}
                isLoadingGenre={isLoadingGenre}
                filterGenre={mangaFilterSort.filterGenre}
                handleFilterGenre={handleFilterGenre}
              />
              <FilterTheme
                themeList={themeList}
                isLoadingTheme={isLoadingTheme}
                filterTheme={mangaFilterSort.filterTheme}
                handleFilterTheme={handleFilterTheme}
              />
              <FilterMALScore
                filterMALScore={mangaFilterSort.filterMALScore}
                handleFilterMALScore={handleFilterMALScore}
              />
              <FilterPersonalScore
                filterPersonalScore={mangaFilterSort.filterPersonalScore}
                handleFilterPersonalScore={handleFilterPersonalScore}
              />
              <FilterStatusCheck
                filterStatusCheck={mangaFilterSort.filterStatusCheck}
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
