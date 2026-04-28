import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/light-novel.service";
import { mangaService } from "@/services/manga.service";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";
import type { StatusCheck } from "@/components/data-table/DataTableStatuses";
import MediaRow from "@/components/media/MediaRow";
import { Button } from "@/components/ui/button";

import { useMediaLibraryList } from "@/hooks/useMediaLibraryList";
import { useToast } from "@/hooks/useToast";

import type { MediaLibraryListItem } from "@/types/media-library.type";

import { mediaKeys } from "@/lib/query-keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDaysIcon, ListIcon, NotebookPenIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";

function mapMediaItemToRow(item: MediaLibraryListItem) {
  if (item.mediaType === "anime") {
    const episodesFetched =
      !["Movie", "OVA"].includes(item.type) && item.fetchedEpisode > 0;
    const statusChecks: StatusCheck[] = [
      {
        key: `${item.title}-anime-episode-status`,
        Trigger: ListIcon,
        condition: ["Movie", "OVA"].includes(item.type) || episodesFetched,
        triggerColor: {
          success: "text-green-700",
          failed: "text-destructive"
        },
        message: {
          success: "Episodes fetched",
          failed: "Episodes missing"
        }
      },
      {
        key: `${item.title}-anime-review-status`,
        Trigger: NotebookPenIcon,
        condition: !!item.reviewText,
        triggerColor: {
          success: "text-green-700",
          failed: "text-destructive"
        },
        message: { success: "Review added", failed: "Review missing" }
      },
      {
        key: `${item.title}-anime-date-status`,
        Trigger: CalendarDaysIcon,
        condition: !!item.consumedAt,
        triggerColor: {
          success: "text-green-700",
          failed: "text-destructive"
        },
        message: {
          success: "Consumed date set",
          failed: "Consumed date missing"
        }
      }
    ];
    return {
      mediaType: "anime" as const,
      id: item.id,
      slug: item.slug,
      title: item.title,
      titleJapanese: item.titleJapanese,
      score: item.score,
      personalScore: item.personalScore,
      progressStatus: item.progressStatus ?? "",
      imageUrl: item.images.large_image_url ?? item.images.image_url,
      subtitle: item.type,
      statusChecks
    };
  }
  if (item.mediaType === "manga") {
    const statusChecks: StatusCheck[] = [
      {
        key: `${item.title}-manga-volume-status`,
        Trigger: ListIcon,
        condition: !!item.chaptersCount && !!item.volumesCount,
        triggerColor: {
          success: "text-green-700",
          failed: "text-destructive"
        },
        message: {
          success: "Chapter and volume count set",
          failed: "Chapter or volume count missing"
        }
      },
      {
        key: `${item.title}-manga-review-status`,
        Trigger: NotebookPenIcon,
        condition: !!item.reviewText,
        triggerColor: {
          success: "text-green-700",
          failed: "text-destructive"
        },
        message: { success: "Review added", failed: "Review missing" }
      },
      {
        key: `${item.title}-manga-date-status`,
        Trigger: CalendarDaysIcon,
        condition: !!item.consumedAt,
        triggerColor: {
          success: "text-green-700",
          failed: "text-destructive"
        },
        message: {
          success: "Consumed date set",
          failed: "Consumed date missing"
        }
      }
    ];
    return {
      mediaType: "manga" as const,
      id: item.id,
      slug: item.slug,
      title: item.title,
      titleJapanese: item.titleJapanese,
      score: item.score,
      personalScore: item.personalScore,
      progressStatus: item.progressStatus ?? "",
      imageUrl: item.images.large_image_url ?? item.images.image_url,
      subtitle: `${item.chaptersCount ?? 0} ch / ${item.volumesCount ?? 0} vol`,
      statusChecks
    };
  }
  const statusChecks: StatusCheck[] = [
    {
      key: `${item.title}-ln-volume-status`,
      Trigger: ListIcon,
      condition: !!item.volumesCount,
      triggerColor: {
        success: "text-green-700",
        failed: "text-destructive"
      },
      message: {
        success: "Volume count set",
        failed: "Volume count missing"
      }
    },
    {
      key: `${item.title}-ln-review-status`,
      Trigger: NotebookPenIcon,
      condition: !!item.reviewText,
      triggerColor: {
        success: "text-green-700",
        failed: "text-destructive"
      },
      message: { success: "Review added", failed: "Review missing" }
    },
    {
      key: `${item.title}-ln-date-status`,
      Trigger: CalendarDaysIcon,
      condition:
        !!item.volumesCount && item.volumeProgress.every((v) => v.consumedAt),
      triggerColor: {
        success: "text-green-700",
        failed: "text-destructive"
      },
      message: {
        success: "All consumed date set",
        failed: "Some consumed date missing"
      }
    }
  ];
  return {
    mediaType: "lightNovel" as const,
    id: item.id,
    slug: item.slug,
    title: item.title,
    titleJapanese: item.titleJapanese,
    score: item.score,
    personalScore: item.personalScore,
    progressStatus: item.progressStatus ?? "",
    imageUrl: item.images.large_image_url ?? item.images.image_url,
    subtitle: `${item.volumesCount ?? 0} volumes`,
    statusChecks
  };
}

export default function MediaListSection() {
  const { state } = useMediaFilters();
  const toast = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      mediaType,
      id
    }: {
      mediaType: "anime" | "manga" | "lightNovel";
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
      toast.toast({
        title: "Deleted",
        description: "Media removed successfully"
      });
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message
      });
    }
  });

  const handleDelete = useCallback(
    (mediaType: "anime" | "manga" | "lightNovel", id: number) => {
      deleteMutation.mutate({ mediaType, id });
    },
    [deleteMutation]
  );

  const listQuery = useMediaLibraryList(true);

  const rows = useMemo(() => {
    const pages = listQuery.data?.pages ?? [];
    return pages.flatMap((page) => page.data.map(mapMediaItemToRow));
  }, [listQuery.data?.pages]);

  const hasNextPage = listQuery.hasNextPage;
  const isFetchingNextPage = listQuery.isFetchingNextPage;
  const isLoading = listQuery.isLoading;

  const listQueryRef = useRef(listQuery);
  listQueryRef.current = listQuery;

  const fetchQueueRef = useRef(Promise.resolve());

  const enqueueFetchNextPage = useCallback(() => {
    fetchQueueRef.current = fetchQueueRef.current
      .then(async () => {
        const q = listQueryRef.current;
        if (!q.hasNextPage) return;
        await q.fetchNextPage();
      })
      .catch(() => {});
  }, []);

  const [scrollRoot, setScrollRoot] = useState<Element | undefined>(undefined);

  useEffect(() => {
    fetchQueueRef.current = Promise.resolve();
  }, [state.mediaType]);

  useEffect(() => {
    const main = document.querySelector("main");
    setScrollRoot(main ?? undefined);
  }, []);

  const { ref: loadMoreRef } = useInView({
    skip: !hasNextPage,
    root: scrollRoot,
    rootMargin: "0px 0px 72px 0px",
    threshold: 0,
    initialInView: false,
    onChange: (visible) => {
      if (!visible || !listQueryRef.current.hasNextPage) return;
      enqueueFetchNextPage();
    }
  });

  return (
    <div className="rounded-xl border border-border/40 bg-background/35 backdrop-blur-sm">
      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">
          Loading media list...
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          No media found for current filters.
        </div>
      ) : (
        <div className="space-y-2 p-2">
          {rows.map((row) => (
            <MediaRow
              key={`${row.mediaType}-${row.id}`}
              {...row}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {hasNextPage ? (
        <div ref={loadMoreRef} className="h-8 shrink-0" aria-hidden />
      ) : null}

      {hasNextPage || isFetchingNextPage ? (
        <div className="flex justify-center border-t border-border/40 p-3">
          <Button
            size="sm"
            variant="outline"
            disabled={isFetchingNextPage || !hasNextPage}
            onClick={() => enqueueFetchNextPage()}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
