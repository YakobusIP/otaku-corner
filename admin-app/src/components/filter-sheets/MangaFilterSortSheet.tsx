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
import { MangaFilterSort } from "@/types/manga.type";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

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

export default function MangaFilterSortSheet({
  mangaFilterSort,
  setMangaFilterSort,
  genreList,
  isLoadingGenre,
  authorList,
  isLoadingAuthor,
  themeList,
  isLoadingTheme
}: Props) {
  const isWideScreen = useWideScreen();

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

  const handleFilterProgressStatus = (key?: keyof typeof PROGRESS_STATUS) => {
    setMangaFilterSort((prev) => ({
      ...prev,
      filterProgressStatus: key
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="w-4 h-4" />
          {isWideScreen && "Filter & Sort"}
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Manga Filter & Sort</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[50vh] xl:h-auto">
          <div className="grid grid-cols-1 grid-rows-9 xl:grid-cols-5 xl:grid-rows-2 gap-4 mt-2">
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
            <FilterProgressStatus
              filterProgressStatus={mangaFilterSort.filterProgressStatus}
              handleFilterProgressStatus={handleFilterProgressStatus}
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
