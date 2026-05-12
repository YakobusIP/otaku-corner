import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { useToast } from "@/hooks/useToast";

import type { PaginatedListPage } from "@/types/general.type";

import { cn } from "@/lib/utils";

import {
  QueryKey,
  UseQueryOptions,
  useInfiniteQuery,
  useQuery
} from "@tanstack/react-query";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";

type QueryConfig<T> = {
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
} & Omit<UseQueryOptions<T[], unknown, T[], QueryKey>, "queryKey" | "queryFn">;

type InfiniteQueryConfig<T, K extends string | number> = {
  queryKey: (search: string) => QueryKey;
  pageSize?: number;
  fetchPage: (
    page: number,
    search: string,
    context?: { includeIds?: K[] }
  ) => Promise<PaginatedListPage<T>>;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
};

type Props<T, K extends string | number> = {
  selectedKey?: K;
  onChange: (key?: K, item?: T) => void;

  items?: T[];
  query?: QueryConfig<T>;
  infiniteQuery?: InfiniteQueryConfig<T, K>;

  getKey: (item: T) => K;
  getLabel: (item: T) => string;

  title?: string;
  placeholder?: string;
  emptyText?: string;
  buttonFallbackLabel?: string;
  buttonClassName?: string;

  showAllOption?: boolean;
  allOptionLabel?: string;
};

export default function FilterPopover<T, K extends string | number>({
  selectedKey,
  onChange,
  items,
  query,
  infiniteQuery,
  getKey,
  getLabel,
  title = "Filter by",
  placeholder,
  emptyText,
  buttonFallbackLabel,
  buttonClassName,
  showAllOption = false,
  allOptionLabel
}: Props<T, K>) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [scrollRoot, setScrollRoot] = useState<Element | null>(null);

  const [debouncedSearch] = useDebounce(searchInput, 300);

  const isInfinite = Boolean(infiniteQuery);

  useEffect(() => {
    if (!isOpen) setSearchInput("");
  }, [isOpen]);

  const {
    data,
    error,
    isPending: queryPending,
    isFetching: queryFetching
  } = useQuery({
    ...(query ?? ({} as QueryConfig<T>)),
    enabled: Boolean(query) && !isInfinite && isOpen && (query?.enabled ?? true)
  }) as {
    data?: T[];
    error: Error | null;
    isPending: boolean;
    isFetching: boolean;
  };

  const pageSize = infiniteQuery?.pageSize ?? 20;

  const {
    data: infiniteData,
    error: infiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: infinitePending,
    isFetching: infiniteFetching
  } = useInfiniteQuery({
    queryKey: infiniteQuery
      ? [
          ...infiniteQuery.queryKey(debouncedSearch),
          pageSize,
          selectedKey ?? null
        ]
      : (["filter-popover-infinite-disabled"] as const),
    enabled: Boolean(infiniteQuery && isOpen),
    queryFn: async ({ pageParam }) => {
      if (!infiniteQuery) throw new Error("Missing infinite query config");
      const page = pageParam as number;
      const includeIds =
        page === 1 && selectedKey !== undefined ? [selectedKey] : undefined;
      return infiniteQuery.fetchPage(page, debouncedSearch, { includeIds });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.metadata;
      return page < pageCount ? page + 1 : undefined;
    },
    staleTime: infiniteQuery?.staleTime,
    refetchOnWindowFocus: infiniteQuery?.refetchOnWindowFocus
  });

  const fetchNextIfNeeded = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { ref: loadMoreRef } = useInView({
    skip:
      !isInfinite ||
      !isOpen ||
      !hasNextPage ||
      isFetchingNextPage ||
      !scrollRoot,
    root: scrollRoot ?? undefined,
    rootMargin: "80px 0px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible) return;
      fetchNextIfNeeded();
    }
  });

  const flattened: T[] = useMemo(() => {
    if (isInfinite) {
      const pages = infiniteData?.pages ?? [];
      return pages.flatMap((p) => p.data);
    }
    return [];
  }, [infiniteData?.pages, isInfinite]);

  const options: T[] | undefined = useMemo(() => {
    if (isInfinite) return flattened;
    return data ?? items;
  }, [data, flattened, isInfinite, items]);

  const firstError = error ?? infiniteError;

  useEffect(() => {
    if (firstError) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: firstError.message
      });
    }
  }, [firstError, toast]);

  const selected = useMemo(() => {
    if (selectedKey === undefined) return undefined;
    return options?.find((option) => getKey(option) === selectedKey);
  }, [options, selectedKey, getKey]);

  const buttonLabel = selected ? getLabel(selected) : buttonFallbackLabel;

  const handlePick = (item?: T) => {
    if (!item) {
      onChange(undefined, undefined);
      setIsOpen(false);
      return;
    }

    const key = getKey(item);
    if (selectedKey !== undefined && key === selectedKey) {
      onChange(undefined, undefined);
    } else {
      onChange(key, item);
    }
    setIsOpen(false);
  };

  const listLoadingFirst =
    isOpen &&
    ((isInfinite && infinitePending && !flattened.length) ||
      (!isInfinite && Boolean(query) && queryPending && data === undefined));
  const listEmpty =
    (isInfinite &&
      isOpen &&
      !infiniteFetching &&
      !flattened.length &&
      !infinitePending) ||
    (!isInfinite &&
      isOpen &&
      Boolean(query) &&
      !queryPending &&
      !queryFetching &&
      Array.isArray(data) &&
      data.length === 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full", buttonClassName)}
        >
          <p className="truncate text-center">
            {title}: {buttonLabel}
          </p>
          {isOpen ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="popover-content-width-full p-0"
        portalled={false}
      >
        <Command shouldFilter={!isInfinite}>
          <CommandInput
            placeholder={placeholder}
            {...(isInfinite
              ? { value: searchInput, onValueChange: setSearchInput }
              : {})}
          />
          <CommandList ref={setScrollRoot}>
            {listLoadingFirst ? (
              <CommandLoading>Loading...</CommandLoading>
            ) : null}
            {isInfinite ? (
              listEmpty ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  {emptyText}
                </div>
              ) : null
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  value="__ALL__"
                  onSelect={() => handlePick(undefined)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedKey === undefined ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="whitespace-normal">{allOptionLabel}</span>
                </CommandItem>
              )}

              {options?.map((item) => {
                const key = getKey(item);
                const label = getLabel(item);
                return (
                  <CommandItem
                    key={String(key)}
                    value={`${String(key)}\u0000${label}`}
                    onSelect={() => handlePick(item)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedKey === key ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">{label}</p>
                  </CommandItem>
                );
              })}
              {isInfinite && hasNextPage ? (
                <div
                  ref={loadMoreRef}
                  className="pointer-events-none h-2 w-full shrink-0"
                  aria-hidden
                />
              ) : null}
              {isInfinite && isFetchingNextPage ? (
                <div className="text-muted-foreground py-2 text-center text-xs">
                  Loading more…
                </div>
              ) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
