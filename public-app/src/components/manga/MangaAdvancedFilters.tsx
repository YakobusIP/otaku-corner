"use client";

import { Dispatch, SetStateAction, useContext } from "react";

import { MangaContext } from "@/components/context/MangaContext";
import FilterAuthor from "@/components/filter-sort-dropdowns/FilterAuthor";
import FilterGenre from "@/components/filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "@/components/filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "@/components/filter-sort-dropdowns/FilterPersonalScore";
import FilterTheme from "@/components/filter-sort-dropdowns/FilterTheme";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { XIcon } from "lucide-react";

type Props = {
  setShowAdvancedFilters: Dispatch<SetStateAction<boolean>>;
  layout?: "inline" | "dialog";
};

export default function MangaAdvancedFilters({
  setShowAdvancedFilters,
  layout = "inline"
}: Props) {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("Filters must be used within an MangaProvider");
  }

  const { state, setState } = context;
  const { filters } = state;

  const handleFilter =
    <K extends keyof typeof filters>(field: K) =>
    (value?: number | string) => {
      setState({
        filters: {
          ...filters,
          [field]: value
        }
      });
    };

  const enableClearAllFilter = Object.values(filters).every(
    (v) => v === undefined
  );

  const handleClearAllFilter = () => {
    setState({
      filters: Object.fromEntries(
        Object.keys(filters).map((k) => [k, undefined])
      ) as typeof filters
    });
  };

  const filterFields = (
    <div
      className={cn(
        "grid gap-4",
        layout === "dialog"
          ? "grid-cols-1"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Genre
        </label>
        <FilterGenre
          selectedGenre={filters.genre}
          handleFilterGenre={handleFilter("genre")}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Author
        </label>
        <FilterAuthor
          selectedAuthor={filters.author}
          handleFilterAuthor={handleFilter("author")}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Theme
        </label>
        <FilterTheme
          selectedTheme={filters.theme}
          handleFilterTheme={handleFilter("theme")}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          MAL Score
        </label>
        <FilterMALScore
          selectedMALScore={filters.malScore}
          handleFilterMALScore={handleFilter("malScore")}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Personal Score
        </label>
        <FilterPersonalScore
          selectedPersonalScore={filters.personalScore}
          handleFilterPersonalScore={handleFilter("personalScore")}
        />
      </div>

      {layout === "inline" ? (
        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
            disabled={enableClearAllFilter}
            onClick={handleClearAllFilter}
          >
            Clear All
          </Button>
        </div>
      ) : null}
    </div>
  );

  const clearAllButton = (
    <Button
      variant="outline"
      className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
      disabled={enableClearAllFilter}
      onClick={handleClearAllFilter}
    >
      Clear All
    </Button>
  );

  if (layout === "dialog") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/40 px-4 py-4 pr-12">
          <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {filterFields}
        </div>
        <div className="shrink-0 border-t border-white/40 px-4 py-4">
          {clearAllButton}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white/60 backdrop-blur-xl rounded-lg border border-white/40 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedFilters(false)}
          className="text-slate-600 hover:text-slate-800"
        >
          <XIcon size={16} />
        </Button>
      </div>

      {filterFields}
    </div>
  );
}
