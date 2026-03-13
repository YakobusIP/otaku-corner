import { useCallback, useMemo } from "react";

import { useMediaFilters } from "@/components/context/MediaFiltersContext";
import MediaRow from "@/components/media/MediaRow";
import { Button } from "@/components/ui/button";

import { useAnimeList } from "@/hooks/useAnimeList";
import { useCombinedMediaList } from "@/hooks/useCombinedMediaList";
import { useLightNovelList } from "@/hooks/useLightNovelList";
import { useMangaList } from "@/hooks/useMangaList";
import { useToast } from "@/hooks/useToast";
import { mediaKeys } from "@/lib/query-keys";
import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/lightnovel.service";
import { mangaService } from "@/services/manga.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function MediaListSection() {
  const { state, setState } = useMediaFilters();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isAll = state.mediaType === "all";

  const deleteMutation = useMutation({
    mutationFn: async ({
      mediaType,
      id
    }: {
      mediaType: "anime" | "manga" | "lightNovel";
      id: number;
    }) => {
      if (mediaType === "anime") await animeService.remove([id]);
      else if (mediaType === "manga") await mangaService.remove([id]);
      else await lightNovelService.remove([id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      toast.toast({ title: "Deleted", description: "Media removed successfully" });
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

  const animeQuery = useAnimeList(isAll || state.mediaType === "anime");
  const mangaQuery = useMangaList(isAll || state.mediaType === "manga");
  const lightNovelQuery = useLightNovelList(isAll || state.mediaType === "lightNovel");
  const combinedQuery = useCombinedMediaList(isAll);

  const rows = useMemo(() => {
    if (isAll) return combinedQuery.items;
    if (state.mediaType === "anime") {
      return (
        animeQuery.data?.data.map((item) => ({
          mediaType: "anime" as const,
          id: item.id,
          slug: item.slug,
          title: item.title,
          titleJapanese: item.titleJapanese,
          score: item.score,
          personalScore: item.personalScore,
          progressStatus: item.progressStatus,
          imageUrl: item.images.large_image_url ?? item.images.image_url,
          subtitle: item.type
        })) ?? []
      );
    }
    if (state.mediaType === "manga") {
      return (
        mangaQuery.data?.data.map((item) => ({
          mediaType: "manga" as const,
          id: item.id,
          slug: item.slug,
          title: item.title,
          titleJapanese: item.titleJapanese,
          score: item.score,
          personalScore: item.personalScore,
          progressStatus: item.progressStatus,
          imageUrl: item.images.large_image_url ?? item.images.image_url,
          subtitle: `${item.chaptersCount ?? 0} ch / ${item.volumesCount ?? 0} vol`
        })) ?? []
      );
    }

    return (
      lightNovelQuery.data?.data.map((item) => ({
        mediaType: "lightNovel" as const,
        id: item.id,
        slug: item.slug,
        title: item.title,
        titleJapanese: item.titleJapanese,
        score: item.score,
        personalScore: item.personalScore,
        progressStatus: item.progressStatus,
        imageUrl: item.images.large_image_url ?? item.images.image_url,
        subtitle: `${item.volumesCount ?? 0} volumes`
      })) ?? []
    );
  }, [
    animeQuery.data,
    combinedQuery.items,
    isAll,
    lightNovelQuery.data,
    mangaQuery.data,
    state.mediaType
  ]);

  const metadata = isAll
    ? undefined
    : state.mediaType === "anime"
      ? animeQuery.data?.metadata
      : state.mediaType === "manga"
        ? mangaQuery.data?.metadata
        : lightNovelQuery.data?.metadata;

  const isLoading =
    animeQuery.isLoading ||
    mangaQuery.isLoading ||
    lightNovelQuery.isLoading ||
    combinedQuery.isLoading;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl">
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

      {metadata ? (
        <div className="border-t border-border/60 p-3 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {metadata.page} of {metadata.pageCount} ({metadata.itemCount} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={metadata.page <= 1}
              onClick={() => setState({ page: Math.max(1, state.page - 1) })}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={metadata.page >= metadata.pageCount}
              onClick={() =>
                setState({ page: Math.min(metadata.pageCount, state.page + 1) })
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
