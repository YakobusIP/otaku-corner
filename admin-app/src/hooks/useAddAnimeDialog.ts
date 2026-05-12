import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { animeService } from "@/services/anime.service";

import { toast } from "@/hooks/useToast";

import type { AnimeCreateRequest } from "@/types/anime.type";

import { animeToCreateRequest } from "@/lib/media-dialog-helpers";
import { mediaKeys } from "@/lib/query-keys";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { Anime, AnimeClient } from "@tutkli/jikan-ts";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";

const animeClient = new AnimeClient();

const JIKAN_ANIME_SEARCH_KEY = ["jikan-anime-search"] as const;

export type UseAddAnimeDialogArgs = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetParent: () => Promise<void>;
};

export function useAddAnimeDialog({
  openDialog,
  setOpenDialog,
  resetParent
}: UseAddAnimeDialogArgs) {
  const queryClient = useQueryClient();

  const [selectedAnime, setSelectedAnime] = useState<Anime[]>([]);
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
    queryKey: [...JIKAN_ANIME_SEARCH_KEY, searchTrimmed],
    enabled: searchEnabled,
    initialPageParam: 1,
    retry: false,
    staleTime: 60_000,
    queryFn: async ({ pageParam }) => {
      try {
        const response = await animeClient.getAnimeSearch({
          q: searchTrimmed,
          limit: 10,
          page: pageParam as number
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
            : "Failed to fetch anime list from Jikan"
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
    () => selectedAnime.find((a) => a.mal_id === activeDetailId) ?? null,
    [selectedAnime, activeDetailId]
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
      for (const a of selectedAnime) {
        if (a.mal_id in prev) next[a.mal_id] = prev[a.mal_id];
      }
      return next;
    });
  }, [selectedAnime]);

  const selectionHasDuplicate = useMemo(
    () => selectedAnime.some((a) => duplicateMap[a.mal_id] === true),
    [duplicateMap, selectedAnime]
  );

  const searchLoadingInitial =
    searchEnabled && isFetching && !isFetchingNextPage;

  const addAnimeMutation = useMutation({
    mutationFn: async (data: AnimeCreateRequest[]) => {
      const response = await animeService.create(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async (addedIds, variables) => {
      if (variables?.length) {
        await Promise.all(
          variables.map((item) =>
            queryClient.invalidateQueries({
              queryKey: mediaKeys.malDuplicate("anime", item.id)
            })
          )
        );
      }
      await queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.statusCounts("anime")
      });
      await resetParent();

      toast({
        title: "All set!",
        description:
          addedIds.length === 1
            ? "Anime added successfully"
            : `${addedIds.length} anime added successfully`
      });

      setSelectedAnime([]);
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
      setSelectedAnime([]);
      setActiveDetailId(null);
      setDuplicateMap({});
      setSearchQuery("");
      queryClient.removeQueries({
        queryKey: [...JIKAN_ANIME_SEARCH_KEY],
        exact: false
      });
    }
  };

  const addFromSearch = (anime: Anime) => {
    setSelectedAnime((prev) => {
      if (prev.some((a) => a.mal_id === anime.mal_id)) return prev;
      return [...prev, anime];
    });
  };

  const clearSelection = () => {
    setSelectedAnime([]);
    setActiveDetailId(null);
    setDuplicateMap({});
  };

  const removeSelected = (malId: number) => {
    setSelectedAnime((prev) => prev.filter((a) => a.mal_id !== malId));
    setActiveDetailId((id) => (id === malId ? null : id));
  };

  const submitAdds = useCallback(async () => {
    const existsList = await Promise.all(
      selectedAnime.map((a) =>
        queryClient
          .fetchQuery({
            queryKey: mediaKeys.malDuplicate("anime", a.mal_id),
            queryFn: async (): Promise<boolean> => {
              const r = await animeService.getDuplicates(a.mal_id);
              if (!r.success)
                throw new Error(r.error ?? "Duplicate check failed");
              return r.data.exists;
            },
            staleTime: 60_000
          })
          .catch(() => null)
      )
    );
    const ready = selectedAnime.filter((_a, i) => existsList[i] === false);

    if (ready.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to add",
        description:
          selectedAnime.length === 0
            ? "Select at least one anime."
            : "All selected titles are already in your library."
      });
      return;
    }

    const slugCounts: Record<string, number> = {};
    const payload: AnimeCreateRequest[] = ready.map((anime) =>
      animeToCreateRequest(anime, slugCounts)
    );

    addAnimeMutation.mutate(payload);
  }, [addAnimeMutation, queryClient, selectedAnime]);

  const hasSelection = selectedAnime.length > 0;

  const selectedMalIds = useMemo(
    () => new Set(selectedAnime.map((a) => a.mal_id)),
    [selectedAnime]
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
    selectedAnime,
    handleDuplicateStatus,
    removeSelected,
    clearSelection,
    hasSelection,
    handleOpenChange,
    submitAdds,
    addAnimeMutation,
    selectionHasDuplicate
  };
}
