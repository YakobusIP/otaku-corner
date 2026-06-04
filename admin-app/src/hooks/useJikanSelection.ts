import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import type { ServiceResult } from "@/types/general.type";

import { mediaKeys } from "@/lib/query-keys";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export interface JikanMediaItem {
  mal_id: number;
}

type JikanSearchPage<TItem extends JikanMediaItem> = {
  results: TItem[];
  pagination?: {
    has_next_page?: boolean;
    items?: { total?: number };
  };
};

export type UseJikanSelectionConfig<TItem extends JikanMediaItem, TCreate> = {
  /** Unique prefix for the Jikan search query key, e.g. "jikan-anime-search" */
  searchKeyPrefix: string;
  /** Performs the Jikan search for the given query and page number */
  searchFn: (query: string, page: number) => Promise<JikanSearchPage<TItem>>;
  /** Creates entities via the backend service */
  createFn: (data: TCreate[]) => Promise<ServiceResult<number[]>>;
  /** Converts a Jikan item to a create request payload */
  toCreateRequest: (item: TItem, slugCounts: Record<string, number>) => TCreate;
  /** Checks if a MAL ID already exists in the library */
  duplicateCheckFn: (
    malId: number
  ) => Promise<ServiceResult<{ exists: boolean }>>;
  /** Media type key for query invalidation: "anime" | "manga" | "lightNovel" */
  mediaTypeKey: "anime" | "manga" | "lightNovel";
  /** Human-readable label for toasts and messages */
  mediaLabel: string;
};

export type UseJikanSelectionArgs<TItem extends JikanMediaItem, TCreate> = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
  config: UseJikanSelectionConfig<TItem, TCreate>;
};

export function useJikanSelection<TItem extends JikanMediaItem, TCreate>({
  openDialog,
  setOpenDialog,
  resetParent,
  config
}: UseJikanSelectionArgs<TItem, TCreate>) {
  const queryClient = useQueryClient();

  const [selectedItems, setSelectedItems] = useState<TItem[]>([]);
  const [activeDetailId, setActiveDetailId] = useState<number | null>(null);
  const [duplicateMap, setDuplicateMap] = useState<
    Record<number, boolean | null>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const scrollAreaRef = useCallback((node: HTMLDivElement | null) => {
    setScrollRoot(node);
  }, []);

  const searchTrimmed = debouncedSearch.trim();
  const searchEnabled = openDialog && searchTrimmed.length >= 2;

  const searchQueryInfinite = useInfiniteQuery({
    queryKey: [config.searchKeyPrefix, searchTrimmed],
    enabled: searchEnabled,
    initialPageParam: 1,
    retry: false,
    staleTime: 60_000,
    queryFn: async ({ pageParam }) => {
      try {
        return await config.searchFn(searchTrimmed, pageParam as number);
      } catch (err: unknown) {
        const status =
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status;
        const isRateLimited = status === 429;
        toast.error(
          isRateLimited ? "Too many requests" : "Uh oh! Something went wrong",
          {
            description: isRateLimited
              ? "Jikan is rate-limited. Wait a moment and try again."
              : `Failed to fetch ${config.mediaLabel} list from Jikan`
          }
        );
        throw err;
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.pagination?.has_next_page ? allPages.length + 1 : undefined
  });

  const {
    data: searchPages,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isError
  } = searchQueryInfinite;

  const searchResults = useMemo(
    () => searchPages?.pages.flatMap((p) => p.results) ?? [],
    [searchPages]
  );

  const searchTotal = useMemo(() => {
    const first = searchPages?.pages[0];
    const total = first?.pagination?.items?.total;
    return typeof total === "number" ? total : null;
  }, [searchPages]);

  const fetchNextIfNeeded = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { ref: loadMoreRef } = useInView({
    skip: !hasNextPage || isFetchingNextPage || !scrollRoot,
    root: scrollRoot ?? undefined,
    rootMargin: "120px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible) return;
      fetchNextIfNeeded();
    }
  });

  const activeDetail = useMemo(
    () => selectedItems.find((item) => item.mal_id === activeDetailId) ?? null,
    [selectedItems, activeDetailId]
  );

  const handleDuplicateStatus = useCallback(
    (malId: number, status: boolean | null) => {
      setDuplicateMap((prev) => {
        if (prev[malId] === status) return prev;
        return { ...prev, [malId]: status };
      });
    },
    []
  );

  useEffect(() => {
    setDuplicateMap((prev) => {
      const next: Record<number, boolean | null> = {};
      for (const item of selectedItems) {
        if (item.mal_id in prev) next[item.mal_id] = prev[item.mal_id];
      }
      return next;
    });
  }, [selectedItems]);

  const selectionHasDuplicate = useMemo(
    () => selectedItems.some((item) => duplicateMap[item.mal_id] === true),
    [duplicateMap, selectedItems]
  );

  const searchLoadingInitial =
    searchEnabled && isFetching && !isFetchingNextPage;

  const addMutation = useMutation({
    mutationFn: async (data: TCreate[]) => {
      const response = await config.createFn(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (addedIds, variables) => {
      if (variables?.length) {
        await Promise.all(
          variables.map((item) =>
            queryClient.invalidateQueries({
              queryKey: mediaKeys.malDuplicate(
                config.mediaTypeKey,
                (item as { id: number }).id
              )
            })
          )
        );
      }
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts(config.mediaTypeKey)
      });
      await resetParent();

      const count = (addedIds as unknown[]).length;
      const label =
        config.mediaLabel.charAt(0).toUpperCase() + config.mediaLabel.slice(1);
      toast.success("All set!", {
        description:
          count === 1
            ? `${label} added successfully`
            : `${count} ${config.mediaLabel} added successfully`
      });

      setSelectedItems([]);
      setActiveDetailId(null);
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast.error("Uh oh! Something went wrong", {
        description: error.message
      });
    }
  });

  const handleOpenChange = (open: boolean) => {
    setOpenDialog(open);
    if (!open) {
      setSelectedItems([]);
      setActiveDetailId(null);
      setDuplicateMap({});
      setSearchQuery("");
      queryClient.removeQueries({
        queryKey: [config.searchKeyPrefix],
        exact: false
      });
    }
  };

  const addFromSearch = (item: TItem) => {
    setSelectedItems((prev) => {
      if (prev.some((s) => s.mal_id === item.mal_id)) return prev;
      return [...prev, item];
    });
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setActiveDetailId(null);
    setDuplicateMap({});
  };

  const removeSelected = (malId: number) => {
    setSelectedItems((prev) => prev.filter((s) => s.mal_id !== malId));
    setActiveDetailId((id) => (id === malId ? null : id));
  };

  const submitAdds = useCallback(async () => {
    const existsList = await Promise.all(
      selectedItems.map((item) =>
        queryClient
          .fetchQuery({
            queryKey: mediaKeys.malDuplicate(config.mediaTypeKey, item.mal_id),
            queryFn: async (): Promise<boolean> => {
              const r = await config.duplicateCheckFn(item.mal_id);
              if (!r.success)
                throw new Error(r.error ?? "Duplicate check failed");
              return r.data.exists;
            },
            staleTime: 60_000
          })
          .catch(() => null)
      )
    );
    const ready = selectedItems.filter((_item, i) => existsList[i] === false);

    if (ready.length === 0) {
      toast.error("Nothing to add", {
        description:
          selectedItems.length === 0
            ? `Select at least one ${config.mediaLabel}.`
            : "All selected titles are already in your library."
      });
      return;
    }

    const slugCounts: Record<string, number> = {};
    const payload: TCreate[] = ready.map((item) =>
      config.toCreateRequest(item, slugCounts)
    );

    addMutation.mutate(payload);
  }, [addMutation, queryClient, selectedItems, config]);

  const hasSelection = selectedItems.length > 0;

  const selectedMalIds = useMemo(
    () => new Set(selectedItems.map((item) => item.mal_id)),
    [selectedItems]
  );

  return {
    scrollAreaRef,
    loadMoreRef,
    searchQuery,
    setSearchQuery,
    searchTrimmed,
    searchLoadingInitial,
    searchResults,
    searchTotal,
    isError,
    isFetchingNextPage,
    selectedMalIds,
    addFromSearch,
    activeDetail,
    activeDetailId,
    setActiveDetailId,
    selectedItems,
    handleDuplicateStatus,
    removeSelected,
    clearSelection,
    hasSelection,
    handleOpenChange,
    submitAdds,
    addMutation,
    selectionHasDuplicate
  };
}
