import { useMediaFilters } from "@/components/context/MediaFiltersContext";
import FilterAuthor from "@/components/filter-sort-dropdowns/FilterAuthor";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterStatusCheck from "@/components/filter-sort-dropdowns/FilterStatusCheck";
import FilterStudio from "@/components/filter-sort-dropdowns/FilterStudio";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import FilterType from "@/components/filter-sort-dropdowns/FilterType";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import type { ScoreOption } from "@/types/general.type";

import { SlidersHorizontalIcon } from "lucide-react";

export default function MediaFilterSheet() {
  const { state, setState, resetFilters } = useMediaFilters();
  const isAll = state.mediaType === "all";
  const isAnime = state.mediaType === "anime";
  const isMangaOrLN =
    state.mediaType === "manga" || state.mediaType === "lightNovel";

  const showStudio = isAnime || isAll;
  const showType = isAnime || isAll;
  const showAuthor = isMangaOrLN || isAll;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="shrink-0 gap-2">
          <SlidersHorizontalIcon className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full tablet:max-w-md desktop:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Keep all existing filters while switching between media sections.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm mb-2">Genre</p>
            <FilterGenre
              selectedGenre={state.genre}
              handleFilterGenre={(key) => setState({ page: 1, genre: key })}
            />
          </div>
          <div>
            <p className="text-sm mb-2">Theme</p>
            <FilterTheme
              selectedTheme={state.theme}
              handleFilterTheme={(key) => setState({ page: 1, theme: key })}
            />
          </div>
          {showStudio ? (
            <div>
              <p className="text-sm mb-2">Studio</p>
              <FilterStudio
                selectedStudio={state.studio}
                handleFilterStudio={(key) => setState({ page: 1, studio: key })}
              />
              {isAll ? (
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Only affects anime in the combined list.
                </p>
              ) : null}
            </div>
          ) : null}
          {showType ? (
            <div>
              <p className="text-sm mb-2">Type</p>
              <FilterType
                selectedType={state.type}
                handleFilterType={(key) =>
                  setState({ page: 1, type: key as string | undefined })
                }
              />
              {isAll ? (
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Only affects anime in the combined list.
                </p>
              ) : null}
            </div>
          ) : null}
          {showAuthor ? (
            <div>
              <p className="text-sm mb-2">Author</p>
              <FilterAuthor
                selectedAuthor={state.author}
                handleFilterAuthor={(key) => setState({ page: 1, author: key })}
              />
              {isAll ? (
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Only affects manga and light novels; anime rows are hidden
                  when an author is selected.
                </p>
              ) : null}
            </div>
          ) : null}
          <div>
            <p className="text-sm mb-2">MAL Score</p>
            <FilterMALScore
              selectedMALScore={
                state.malScore as ScoreOption["key"] | undefined
              }
              handleFilterMALScore={(key) =>
                setState({ page: 1, malScore: key })
              }
            />
          </div>
          <div>
            <p className="text-sm mb-2">Personal Score</p>
            <FilterPersonalScore
              selectedPersonalScore={
                state.personalScore as ScoreOption["key"] | undefined
              }
              handleFilterPersonalScore={(key) =>
                setState({ page: 1, personalScore: key })
              }
            />
          </div>
          <div>
            <p className="text-sm mb-2">Status Check</p>
            <FilterStatusCheck
              selectedStatusCheck={state.statusCheck}
              handleFilterStatusCheck={(key) =>
                setState({ page: 1, statusCheck: key as string | undefined })
              }
            />
          </div>
          <Button variant="secondary" className="w-full" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
