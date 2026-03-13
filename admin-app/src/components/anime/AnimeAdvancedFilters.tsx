import { Dispatch, SetStateAction, useContext } from "react";

import { AnimeContext } from "@/components/context/AnimeContext";
import { Button } from "@/components/ui/button";

import { XIcon } from "lucide-react";

import FilterGenre from "../filter-sort-dropdowns/FilterGenre";
import FilterMALScore from "../filter-sort-dropdowns/FilterMALScore";
import FilterPersonalScore from "../filter-sort-dropdowns/FilterPersonalScore";
import FilterStatusCheck from "../filter-sort-dropdowns/FilterStatusCheck";
import FilterStudio from "../filter-sort-dropdowns/FilterStudio";
import FilterTheme from "../filter-sort-dropdowns/FilterTheme";
import FilterType from "../filter-sort-dropdowns/FilterType";

type Props = {
  setShowAdvancedFilters: Dispatch<SetStateAction<boolean>>;
};

export default function AnimeAdvancedFilters({
  setShowAdvancedFilters
}: Props) {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("Filters must be used within an AnimeProvider");
  }

  const { state, setState } = context;
  const { filters } = state;

  const handleFilter =
    <K extends keyof typeof filters>(field: K) =>
    (value?: number | string) => {
      setState({
        page: 1,
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
      page: 1,
      filters: Object.fromEntries(
        Object.keys(filters).map((k) => [k, undefined])
      ) as typeof filters
    });
  };

  return (
    <div className="mt-4 p-4 bg-card/70 backdrop-blur-xl rounded-lg border border-border/60 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Advanced Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedFilters(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <XIcon size={16} />
        </Button>
      </div>

      <div className="grid grid=cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Genre
          </label>
          <FilterGenre
            selectedGenre={filters.genre}
            handleFilterGenre={handleFilter("genre")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Studio
          </label>
          <FilterStudio
            selectedStudio={filters.studio}
            handleFilterStudio={handleFilter("studio")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Theme
          </label>
          <FilterTheme
            selectedTheme={filters.theme}
            handleFilterTheme={handleFilter("theme")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            MAL Score
          </label>
          <FilterMALScore
            selectedMALScore={filters.malScore}
            handleFilterMALScore={handleFilter("malScore")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Personal Score
          </label>
          <FilterPersonalScore
            selectedPersonalScore={filters.personalScore}
            handleFilterPersonalScore={handleFilter("personalScore")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Type
          </label>
          <FilterType
            selectedType={filters.type}
            handleFilterType={handleFilter("type")}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Status Check
          </label>
          <FilterStatusCheck
            selectedStatusCheck={filters.statusCheck}
            handleFilterStatusCheck={handleFilter("statusCheck")}
          />
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            disabled={enableClearAllFilter}
            onClick={handleClearAllFilter}
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
