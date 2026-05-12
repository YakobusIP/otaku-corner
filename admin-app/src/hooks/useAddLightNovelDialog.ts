import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { lightNovelService } from "@/services/light-novel.service";

import { toast } from "@/hooks/useToast";

import type { LightNovelCreateRequest } from "@/types/light-novel.type";

import { lightNovelToCreateRequest } from "@/lib/media-dialog-helpers";
import { mediaKeys } from "@/lib/query-keys";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { Manga, MangaClient } from "@tutkli/jikan-ts";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";

const mangaClient = new MangaClient();

const JIKAN_LIGHTNOVEL_SEARCH_KEY = ["jikan-lightnovel-search"] as const;

export type UseAddLightNovelDialogArgs = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export function useAddLightNovelDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: UseAddLightNovelDialogArgs) {
  const queryClient = useQueryClient();

  const [selectedLightNovel, setSelectedLightNovel] = useState<Manga[]>([]);
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
    queryKey: [...JIKAN_LIGHTNOVEL_SEARCH_KEY, searchTrimmed],
    enabled: searchEnabled,
    initialPageParam: 1,
    retry: false,
    staleTime: 60_000,
    queryFn: async ({ pageParam }) => {
      try {
        const response = await mangaClient.getMangaSearch({
          q: searchTrimmed,
          limit: 10,
          page: pageParam as number,
          type: "Lightnovel"
        });
        return {
          results: response.data,
          pagination: response.pagination
        };
      } catch (err: unknown) {
        const status =
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status;
        const isRateLimited = status === 429;
        toast({
          variant: "destructive",
          title: isRateLimited
            ? "Too many requests"
            : "Uh oh! Something went wrong",
          description: isRateLimited
            ? "Jikan is rate-limited. Wait a moment and try again."
            : "Failed to fetch light novel list from Jikan"
        });
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
    () => selectedLightNovel.find((m) => m.mal_id === activeDetailId) ?? null,
    [selectedLightNovel, activeDetailId]
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
      for (const m of selectedLightNovel) {
        if (m.mal_id in prev) next[m.mal_id] = prev[m.mal_id];
      }
      return next;
    });
  }, [selectedLightNovel]);

  const selectionHasDuplicate = useMemo(
    () => selectedLightNovel.some((m) => duplicateMap[m.mal_id] === true),
    [duplicateMap, selectedLightNovel]
  );

  const searchLoadingInitial =
    searchEnabled && isFetching && !isFetchingNextPage;

  const addLightNovelMutation = useMutation({
    mutationFn: async (data: LightNovelCreateRequest[]) => {
      const response = await lightNovelService.create(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (addedIds, variables) => {
      if (variables?.length) {
        await Promise.all(
          variables.map((item) =>
            queryClient.invalidateQueries({
              queryKey: mediaKeys.malDuplicate("lightNovel", item.id)
            })
          )
        );
      }
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("lightNovel")
      });
      await resetParent();

      toast({
        title: "All set!",
        description:
          addedIds.length === 1
            ? "Light novel added successfully"
            : `${addedIds.length} light novels added successfully`
      });

      setSelectedLightNovel([]);
      setActiveDetailId(null);
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const handleOpenChange = (open: boolean) => {
    setOpenDialog(open);
    if (!open) {
      setSelectedLightNovel([]);
      setActiveDetailId(null);
      setDuplicateMap({});
      setSearchQuery("");
      queryClient.removeQueries({
        queryKey: [...JIKAN_LIGHTNOVEL_SEARCH_KEY],
        exact: false
      });
    }
  };

  const addFromSearch = (ln: Manga) => {
    setSelectedLightNovel((prev) => {
      if (prev.some((m) => m.mal_id === ln.mal_id)) return prev;
      return [...prev, ln];
    });
  };

  const clearSelection = () => {
    setSelectedLightNovel([]);
    setActiveDetailId(null);
    setDuplicateMap({});
  };

  const removeSelected = (malId: number) => {
    setSelectedLightNovel((prev) => prev.filter((m) => m.mal_id !== malId));
    setActiveDetailId((id) => (id === malId ? null : id));
  };

  const submitAdds = useCallback(async () => {
    const existsList = await Promise.all(
      selectedLightNovel.map((m) =>
        queryClient
          .fetchQuery({
            queryKey: mediaKeys.malDuplicate("lightNovel", m.mal_id),
            queryFn: async (): Promise<boolean> => {
              const r = await lightNovelService.getDuplicates(m.mal_id);
              if (!r.success)
                throw new Error(r.error ?? "Duplicate check failed");
              return r.data.exists;
            },
            staleTime: 60_000
          })
          .catch(() => null)
      )
    );
    const ready = selectedLightNovel.filter((_m, i) => existsList[i] === false);

    if (ready.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to add",
        description:
          selectedLightNovel.length === 0
            ? "Select at least one light novel."
            : "All selected titles are already in your library."
      });
      return;
    }

    const slugCounts: Record<string, number> = {};
    const payload: LightNovelCreateRequest[] = ready.map((ln) =>
      lightNovelToCreateRequest(ln, slugCounts)
    );

    addLightNovelMutation.mutate(payload);
  }, [addLightNovelMutation, queryClient, selectedLightNovel]);

  const hasSelection = selectedLightNovel.length > 0;

  const selectedMalIds = useMemo(
    () => new Set(selectedLightNovel.map((m) => m.mal_id)),
    [selectedLightNovel]
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
    selectedLightNovel,
    handleDuplicateStatus,
    removeSelected,
    clearSelection,
    hasSelection,
    handleOpenChange,
    submitAdds,
    addLightNovelMutation,
    selectionHasDuplicate
  };
}
