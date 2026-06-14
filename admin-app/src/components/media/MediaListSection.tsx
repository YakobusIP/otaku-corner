import { Fragment, useCallback, useMemo, useRef, useState } from "react";

import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/light-novel.service";
import { mangaService } from "@/services/manga.service";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";
import {
  ListLoadingBounceDots,
  ListRetryButton,
  ListStatusPanel
} from "@/components/list-status/ListStatusPanel";
import DeleteMediaAlertModal from "@/components/media/DeleteMediaAlertModal";
import MediaRow from "@/components/media/MediaRow";
import { mapMediaItemToRow } from "@/components/media/mapMediaItemToRow";
import { Button } from "@/components/ui/button";

import { useLoadingDots } from "@/hooks/useLoadingDots";
import type { UseMediaLibraryListResult } from "@/hooks/useMediaLibraryList";

import { MediaType } from "@/types/general.type";

import { type MediaTypeFilter, mediaKeys } from "@/lib/query-keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CompassIcon, FilterXIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

type DeleteTarget = {
  mediaType: MediaType;
  id: number;
  title: string;
};

type MediaListStatusCopy = {
  loadingImageAlt: string;
  loadingTitle: string;
  emptyTitle: string;
  emptyDescription: string;
};

const MEDIA_LIST_STATUS_COPY: Record<MediaTypeFilter, MediaListStatusCopy> = {
  all: {
    loadingImageAlt: "Loading media",
    loadingTitle: "Fetching media",
    emptyTitle: "No Media Found",
    emptyDescription: "We couldn't find any media matching your search"
  },
  anime: {
    loadingImageAlt: "Loading animes",
    loadingTitle: "Fetching animes",
    emptyTitle: "No Anime Found",
    emptyDescription: "We couldn't find any anime matching your search"
  },
  manga: {
    loadingImageAlt: "Loading mangas",
    loadingTitle: "Fetching mangas",
    emptyTitle: "No Manga Found",
    emptyDescription: "We couldn't find any manga matching your search"
  },
  lightNovel: {
    loadingImageAlt: "Loading light novels",
    loadingTitle: "Fetching light novels",
    emptyTitle: "No Light Novel Found",
    emptyDescription: "We couldn't find any light novel matching your search"
  }
};

type Props = {
  listQuery: UseMediaLibraryListResult;
  scrollRoot: HTMLDivElement | null;
};

export default function MediaListSection({ listQuery, scrollRoot }: Props) {
  const queryClient = useQueryClient();
  const { state, resetFilters, setState } = useMediaFilters();
  const statusCopy = MEDIA_LIST_STATUS_COPY[state.mediaType];

  const {
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isRefetching,
    refetch
  } = listQuery;

  const loadingDots = useLoadingDots(isLoading);

  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const deleteTargetRef = useRef<DeleteTarget | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async ({
      mediaType,
      id
    }: {
      mediaType: MediaType;
      id: number;
    }) => {
      if (mediaType === "anime") {
        const r = await animeService.remove([id]);
        if (!r.success) throw new Error(r.error);
      } else if (mediaType === "manga") {
        const r = await mangaService.remove([id]);
        if (!r.success) throw new Error(r.error);
      } else {
        const r = await lightNovelService.remove([id]);
        if (!r.success) throw new Error(r.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success("Deleted", { description: "Media removed successfully" });
    },
    onError: (error: Error) => {
      toast.error("Delete failed", { description: error.message });
    }
  });

  const handleRequestDelete = useCallback(
    (mediaType: MediaType, id: number, title: string) => {
      const target = { mediaType, id, title };
      deleteTargetRef.current = target;
      setPendingDelete(target);
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    const target = deleteTargetRef.current;
    if (!target) return;
    deleteMutation.mutate(
      { mediaType: target.mediaType, id: target.id },
      {
        onSettled: () => {
          deleteTargetRef.current = null;
          setPendingDelete(null);
        }
      }
    );
  }, [deleteMutation]);

  const browseAll = useCallback(() => {
    setState({
      mediaType: "all",
      query: "",
      page: 1,
      genre: undefined,
      studio: undefined,
      theme: undefined,
      author: undefined,
      malScore: undefined,
      personalScore: undefined,
      type: undefined,
      statusCheck: undefined
    });
  }, [setState]);

  const rows = useMemo(() => {
    const pages = listQuery.data?.pages ?? [];
    return pages.flatMap((page) => page.data.map(mapMediaItemToRow));
  }, [listQuery.data?.pages]);

  const listQueryRef = useRef(listQuery);
  listQueryRef.current = listQuery;

  const fetchNextIfNeeded = useCallback(() => {
    const q = listQueryRef.current;
    if (!q.hasNextPage || q.isFetchingNextPage) return;
    void q.fetchNextPage();
  }, []);

  const { ref: loadMoreRef } = useInView({
    skip: !hasNextPage,
    root: scrollRoot ?? undefined,
    rootMargin: "0px 0px 72px 0px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible) return;
      fetchNextIfNeeded();
    }
  });

  if (isLoading) {
    return (
      <ListStatusPanel
        imageSrc="/loading.webp"
        imageAlt={statusCopy.loadingImageAlt}
        title={
          <Fragment>
            {statusCopy.loadingTitle}
            <span className="inline-block w-8 text-left">{loadingDots}</span>
          </Fragment>
        }
        description="Pulling the data from another dimension..."
        hint="Just a moment"
        footer={<ListLoadingBounceDots />}
        busy
      />
    );
  }

  if (isError) {
    return (
      <ListStatusPanel
        imageSrc="/error.webp"
        imageAlt="Failed to load media list"
        title="Failed to load media list"
        description="Something went wrong while fetching your library."
        hint="You can try loading the list again."
        footer={
          <ListRetryButton
            onRetry={() => void refetch()}
            isRetrying={isRefetching}
          />
        }
      />
    );
  }

  if (rows.length === 0) {
    return (
      <ListStatusPanel
        imageSrc="/no-result.webp"
        imageAlt="No result"
        titleClassName="text-2xl font-bold text-foreground md:text-3xl"
        descriptionClassName="text-sm font-medium text-muted-foreground md:text-lg"
        title={
          <Fragment>
            {statusCopy.emptyTitle}
            {state.query ? ` for "${state.query}"` : null}
          </Fragment>
        }
        description={statusCopy.emptyDescription}
        hint="Perhaps try a different keyword or check for typos"
        footer={
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              className="bg-rose-400 text-white hover:bg-rose-500"
              onClick={resetFilters}
            >
              <FilterXIcon />
              Clear Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white"
              onClick={browseAll}
            >
              <CompassIcon />
              Browse All Media
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-background/90">
      <div className="space-y-2 p-2">
        {rows.map((row) => (
          <MediaRow
            key={`${row.mediaType}-${row.id}`}
            {...row}
            onRequestDelete={handleRequestDelete}
          />
        ))}
      </div>

      {hasNextPage ? (
        <div ref={loadMoreRef} className="h-8 shrink-0" aria-hidden />
      ) : null}

      {hasNextPage || isFetchingNextPage ? (
        <div className="flex justify-center border-t border-border/40 p-3">
          <Button
            size="sm"
            variant="outline"
            disabled={isFetchingNextPage || !hasNextPage}
            onClick={fetchNextIfNeeded}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}

      <DeleteMediaAlertModal
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            deleteTargetRef.current = null;
            setPendingDelete(null);
          }
        }}
        itemTitle={pendingDelete?.title ?? null}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
