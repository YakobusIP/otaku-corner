import { ChangeEvent } from "react";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";
import MediaFilterSheet from "@/components/media/MediaFilterSheet";
import SortDirection from "@/components/filter-sort-dropdowns/SortDirection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  PROGRESS_STATUS,
  SORT_ORDER,
  type ProgressStatusKey
} from "@/lib/enums";
import { SearchIcon } from "lucide-react";

type Props = {
  totalCount?: number;
};

export default function MediaHeader({ totalCount }: Props) {
  const { state, setState } = useMediaFilters();

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ query: event.target.value, page: 1 });
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
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={state.mediaType}
          onValueChange={(value) =>
            setState({
              mediaType: value as "all" | "anime" | "manga" | "lightNovel",
              page: 1
            })
          }
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="anime">Anime</TabsTrigger>
            <TabsTrigger value="manga">Manga</TabsTrigger>
            <TabsTrigger value="lightNovel">Light Novel</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center lg:w-auto">
          <Input
            placeholder="Search across media..."
            value={state.query}
            onChange={handleSearch}
            parentClassName="h-10 w-full min-w-0 flex-1 sm:min-w-[320px] lg:min-w-[440px]"
            startIcon={SearchIcon}
          />
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:flex-row [&_button]:w-full sm:[&_button]:w-auto">
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
          {totalCount !== undefined ? (
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
          </Button>
        ))}
      </div>
    </div>
  );
}
