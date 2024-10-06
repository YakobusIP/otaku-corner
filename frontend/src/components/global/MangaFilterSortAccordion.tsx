import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { SORT_ORDER } from "@/lib/enums";
import SortDirection from "@/components/global/sort-and-filters/SortDirection";
import FilterAuthor from "@/components/global/sort-and-filters/FilterAuthor";
import FilterGenre from "@/components/global/sort-and-filters/FilterGenre";
import FilterTheme from "@/components/global/sort-and-filters/FilterTheme";
import FilterMALScore from "@/components/global/sort-and-filters/FilterMALScore";
import FilterPersonalScore from "@/components/global/sort-and-filters/FilterPersonalScore";
import { MangaFilterSort } from "@/types/manga.type";
import { GenreEntity, AuthorEntity, ThemeEntity } from "@/types/entity.type";

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
      SORT_ORDER:
        prev.sortBy === key
          ? prev.SORT_ORDER === SORT_ORDER.ASCENDING
            ? SORT_ORDER.DESCENDING
            : SORT_ORDER.ASCENDING
          : SORT_ORDER.ASCENDING
    }));
  };

  const handleFilterAuthor = (key?: number) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterAuthor: key
    }));
  };

  const handleFilterGenre = (key?: number) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterGenre: key
    }));
  };

  const handleFilterTheme = (key?: number) => {
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

  const enableClearAllFilter =
    !mangaFilterSort.filterAuthor &&
    !mangaFilterSort.filterGenre &&
    !mangaFilterSort.filterTheme &&
    !mangaFilterSort.filterMALScore &&
    !mangaFilterSort.filterPersonalScore;

  const handleClearAllFilter = () => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterAuthor: undefined,
      filterGenre: undefined,
      filterTheme: undefined,
      filterMALScore: undefined,
      filterPersonalScore: undefined
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
            <div className="grid grid-cols-1 grid-rows-8 xl:grid-cols-4 xl:grid-rows-2 gap-4">
              <SortDirection
                sortBy={mangaFilterSort.sortBy}
                SORT_ORDER={mangaFilterSort.SORT_ORDER}
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
