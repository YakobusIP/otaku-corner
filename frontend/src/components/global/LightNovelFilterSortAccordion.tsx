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
import SortDirection from "@/components/global/sort-and-filters/SortDirection";
import FilterAuthor from "@/components/global/sort-and-filters/FilterAuthor";
import FilterGenre from "@/components/global/sort-and-filters/FilterGenre";
import FilterTheme from "@/components/global/sort-and-filters/FilterTheme";
import FilterMALScore from "@/components/global/sort-and-filters/FilterMALScore";
import FilterPersonalScore from "@/components/global/sort-and-filters/FilterPersonalScore";
import { LightNovelFilterSort } from "@/types/lightnovel.type";
import { GenreEntity, AuthorEntity, ThemeEntity } from "@/types/entity.type";

type Props = {
  lightNovelFilterSort: LightNovelFilterSort;
  setLightNovelFilterSort: Dispatch<SetStateAction<LightNovelFilterSort>>;
  genreList: GenreEntity[];
  isLoadingGenre: boolean;
  authorList: AuthorEntity[];
  isLoadingAuthor: boolean;
  themeList: ThemeEntity[];
  isLoadingTheme: boolean;
};

export default function LightNovelFilterSortAccordion({
  lightNovelFilterSort,
  setLightNovelFilterSort,
  genreList,
  isLoadingGenre,
  authorList,
  isLoadingAuthor,
  themeList,
  isLoadingTheme
}: Props) {
  const handleSort = (key: string) => {
    setLightNovelFilterSort((prev) => ({
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

  const enableClearAllFilter =
    !lightNovelFilterSort.filterAuthor &&
    !lightNovelFilterSort.filterGenre &&
    !lightNovelFilterSort.filterTheme &&
    !lightNovelFilterSort.filterMALScore &&
    !lightNovelFilterSort.filterPersonalScore;

  const handleClearAllFilter = () => {
    setLightNovelFilterSort((prev) => ({
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
              <FilterMALScore
                filterMALScore={lightNovelFilterSort.filterMALScore}
                handleFilterMALScore={handleFilterMALScore}
              />
              <FilterPersonalScore
                filterPersonalScore={lightNovelFilterSort.filterPersonalScore}
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
