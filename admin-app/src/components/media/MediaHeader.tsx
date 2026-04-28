import { ChangeEvent, useEffect, useState } from "react";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";
import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import MediaFilterSheet from "@/components/media/MediaFilterSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  PROGRESS_STATUS,
  type ProgressStatusKey,
  SORT_ORDER
} from "@/lib/enums";

import { SearchIcon } from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
  totalCount?: number;
};

export default function MediaHeader({ totalCount }: Props) {
  const { state, setState } = useMediaFilters();
  const [localQuery, setLocalQuery] = useState(state.query);
  const [debouncedQuery] = useDebounce(localQuery, 500);

  useEffect(() => {
    setState({ query: debouncedQuery, page: 1 });
  }, [debouncedQuery, setState]);

  useEffect(() => {
    if (state.query !== localQuery && state.query !== debouncedQuery) {
      setLocalQuery(state.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit localQuery/debouncedQuery so typing is not reset while debounce catches up
  }, [state.query]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(event.target.value);
  };

  const handleSort = (key: string) => {
    setState({
      page: 1,
      sortBy: key,
      sortOrder:
        state.sortBy === key
          ? state.sortOrder === SORT_ORDER.ASCENDING
            ? SORT_ORDER.DESCENDING
            : SORT_ORDER.ASCENDING
          : SORT_ORDER.ASCENDING
    });
  };

  return (
    <div className="sticky top-2 z-30 space-y-3 rounded-xl border border-border/60 bg-card/60 p-3 shadow-sm backdrop-blur-xl">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-3 md:gap-y-2">
        <Tabs
          className="w-full shrink-0 md:w-auto"
          value={state.mediaType}
          onValueChange={(value) =>
            setState({
              mediaType: value as "all" | "anime" | "manga" | "lightNovel",
              page: 1
            })
          }
        >
          <TabsList className="flex w-full md:inline-flex md:w-auto">
            <TabsTrigger className="flex-1 md:flex-initial" value="all">
              All
            </TabsTrigger>
            <TabsTrigger className="flex-1 md:flex-initial" value="anime">
              Anime
            </TabsTrigger>
            <TabsTrigger className="flex-1 md:flex-initial" value="manga">
              Manga
            </TabsTrigger>
            <TabsTrigger className="flex-1 md:flex-initial" value="lightNovel">
              Light Novel
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full min-w-0 flex-col gap-2 md:min-w-0 md:flex-1 md:basis-0 md:flex-row md:flex-wrap md:items-center md:gap-2">
          <Input
            placeholder="Search title or synonyms…"
            value={localQuery}
            onChange={handleSearch}
            parentClassName="h-10 w-full min-w-0 flex-1 basis-full md:basis-0 md:min-w-0"
            startIcon={SearchIcon}
          />
          <div className="grid w-full min-w-0 shrink-0 grid-cols-2 gap-2 md:flex md:w-auto md:max-w-full md:flex-none md:flex-row [&_button]:w-full md:[&_button]:w-auto">
            <SortDirection
              sort={state.sortBy}
              order={state.sortOrder}
              handleSort={handleSort}
            />
            <MediaFilterSheet />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        <Button
          size="sm"
          variant={state.progressStatus ? "ghost" : "default"}
          onClick={() => setState({ page: 1, progressStatus: undefined })}
          className="whitespace-nowrap"
        >
          All
          {!state.progressStatus && totalCount !== undefined ? (
            <Badge variant="secondary" className="ml-2">
              {totalCount}
            </Badge>
          ) : null}
        </Button>
        {(Object.keys(PROGRESS_STATUS) as ProgressStatusKey[]).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={state.progressStatus === key ? "default" : "ghost"}
            onClick={() => setState({ page: 1, progressStatus: key })}
            className="whitespace-nowrap"
          >
            {PROGRESS_STATUS[key]}
            {state.progressStatus === key && totalCount !== undefined ? (
              <Badge variant="secondary" className="ml-2">
                {totalCount}
              </Badge>
            ) : null}
          </Button>
        ))}
      </div>
    </div>
  );
}
