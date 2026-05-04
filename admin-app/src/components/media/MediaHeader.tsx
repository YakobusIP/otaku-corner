import { ChangeEvent, useEffect, useRef, useState } from "react";

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
  const lastPushedQueryRef = useRef(state.query);

  useEffect(() => {
    if (state.query === debouncedQuery && state.page === 1) return;
    setState({ query: debouncedQuery, page: 1 });
    lastPushedQueryRef.current = debouncedQuery;
  }, [debouncedQuery, setState, state.page, state.query]);

  useEffect(() => {
    if (state.query === lastPushedQueryRef.current) {
      return;
    }
    setLocalQuery(state.query);
    lastPushedQueryRef.current = state.query;
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
    <div className="sticky top-2 z-30 space-y-3 rounded-xl border border-border/60 bg-card/95 p-3 shadow-xs">
      <div className="flex min-w-0 flex-col gap-3">
        <Tabs
          className="w-full shrink-0"
          value={state.mediaType}
          onValueChange={(value) =>
            setState({
              mediaType: value as "all" | "anime" | "manga" | "lightNovel",
              page: 1
            })
          }
        >
          <TabsList className="flex w-full tablet:inline-flex tablet:w-auto tablet:max-w-full desktop:inline-flex desktop:w-auto">
            <TabsTrigger className="flex-1 tablet:flex-initial desktop:flex-initial" value="all">
              All
            </TabsTrigger>
            <TabsTrigger className="flex-1 tablet:flex-initial desktop:flex-initial" value="anime">
              Anime
            </TabsTrigger>
            <TabsTrigger className="flex-1 tablet:flex-initial desktop:flex-initial" value="manga">
              Manga
            </TabsTrigger>
            <TabsTrigger className="flex-1 tablet:flex-initial desktop:flex-initial" value="lightNovel">
              Light Novel
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full min-w-0 flex-col gap-2 tablet:flex-row tablet:flex-wrap tablet:items-center tablet:gap-2 desktop:flex-row desktop:flex-wrap desktop:items-center desktop:gap-2">
          <Input
            placeholder="Search title or synonyms…"
            value={localQuery}
            onChange={handleSearch}
            parentClassName="h-10 w-full min-w-0 flex-1 basis-full tablet:basis-0 tablet:min-w-48 tablet:flex-1 desktop:min-w-56"
            startIcon={SearchIcon}
          />
          <div className="grid w-full min-w-0 shrink-0 grid-cols-2 gap-2 tablet:flex tablet:w-auto tablet:max-w-full tablet:flex-none tablet:flex-row tablet:[&_button]:w-auto desktop:flex desktop:w-auto desktop:max-w-full desktop:flex-none desktop:flex-row desktop:[&_button]:w-auto [&_button]:w-full">
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
