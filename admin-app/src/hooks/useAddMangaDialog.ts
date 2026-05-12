import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { mangaService } from "@/services/manga.service";

import { toast } from "@/hooks/useToast";

import type { MangaCreateRequest } from "@/types/manga.type";

import { mangaToCreateRequest } from "@/lib/media-dialog-helpers";
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

const JIKAN_MANGA_SEARCH_KEY = ["jikan-manga-search"] as const;

export type UseAddMangaDialogArgs = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export function useAddMangaDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: UseAddMangaDialogArgs) {
  const queryClient = useQueryClient();

  const [selectedManga, setSelectedManga] = useState<Manga[]>([]);
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
    queryKey: [...JIKAN_MANGA_SEARCH_KEY, searchTrimmed],
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
          type: "Manga"
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
            : "Failed to fetch manga list from Jikan"
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
    () => selectedManga.find((m) => m.mal_id === activeDetailId) ?? null,
    [selectedManga, activeDetailId]
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
      for (const m of selectedManga) {
        if (m.mal_id in prev) next[m.mal_id] = prev[m.mal_id];
      }
      return next;
    });
  }, [selectedManga]);

  const selectionHasDuplicate = useMemo(
    () => selectedManga.some((m) => duplicateMap[m.mal_id] === true),
    [duplicateMap, selectedManga]
  );

  const searchLoadingInitial =
    searchEnabled && isFetching && !isFetchingNextPage;

  const addMangaMutation = useMutation({
    mutationFn: async (data: MangaCreateRequest[]) => {
      const response = await mangaService.create(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (addedIds, variables) => {
      if (variables?.length) {
        await Promise.all(
          variables.map((item) =>
            queryClient.invalidateQueries({
              queryKey: mediaKeys.malDuplicate("manga", item.id)
            })
          )
        );
      }
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("manga")
      });
      await resetParent();

      toast({
        title: "All set!",
        description:
          addedIds.length === 1
            ? "Manga added successfully"
            : `${addedIds.length} manga added successfully`
      });

      setSelectedManga([]);
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
      setSelectedManga([]);
      setActiveDetailId(null);
      setDuplicateMap({});
      setSearchQuery("");
      queryClient.removeQueries({
        queryKey: [...JIKAN_MANGA_SEARCH_KEY],
        exact: false
      });
    }
  };

  const addFromSearch = (manga: Manga) => {
    setSelectedManga((prev) => {
      if (prev.some((m) => m.mal_id === manga.mal_id)) return prev;
      return [...prev, manga];
    });
  };

  const clearSelection = () => {
    setSelectedManga([]);
    setActiveDetailId(null);
    setDuplicateMap({});
  };

  const removeSelected = (malId: number) => {
    setSelectedManga((prev) => prev.filter((m) => m.mal_id !== malId));
    setActiveDetailId((id) => (id === malId ? null : id));
  };

  const submitAdds = useCallback(async () => {
    const existsList = await Promise.all(
      selectedManga.map((m) =>
        queryClient
          .fetchQuery({
            queryKey: mediaKeys.malDuplicate("manga", m.mal_id),
            queryFn: async (): Promise<boolean> => {
              const r = await mangaService.getDuplicates(m.mal_id);
              if (!r.success)
                throw new Error(r.error ?? "Duplicate check failed");
              return r.data.exists;
            },
            staleTime: 60_000
          })
          .catch(() => null)
      )
    );
    const ready = selectedManga.filter((_m, i) => existsList[i] === false);

    if (ready.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to add",
        description:
          selectedManga.length === 0
            ? "Select at least one manga."
            : "All selected titles are already in your library."
      });
      return;
    }

    const slugCounts: Record<string, number> = {};
    const payload: MangaCreateRequest[] = ready.map((manga) =>
      mangaToCreateRequest(manga, slugCounts)
    );

    addMangaMutation.mutate(payload);
  }, [addMangaMutation, queryClient, selectedManga]);

  const hasSelection = selectedManga.length > 0;

  const selectedMalIds = useMemo(
    () => new Set(selectedManga.map((m) => m.mal_id)),
    [selectedManga]
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
    selectedManga,
    handleDuplicateStatus,
    removeSelected,
    clearSelection,
    hasSelection,
    handleOpenChange,
    submitAdds,
    addMangaMutation,
    selectionHasDuplicate
  };
}
