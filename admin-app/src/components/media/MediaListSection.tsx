import { useCallback, useMemo, useRef, useState } from "react";

import { animeService } from "@/services/anime.service";
import { lightNovelService } from "@/services/light-novel.service";
import { mangaService } from "@/services/manga.service";

import DeleteMediaAlertModal from "@/components/media/DeleteMediaAlertModal";
import MediaRow from "@/components/media/MediaRow";
import { mapMediaItemToRow } from "@/components/media/mapMediaItemToRow";
import { Button } from "@/components/ui/button";

import type { UseMediaLibraryListResult } from "@/hooks/useMediaLibraryList";

import { MediaType } from "@/types/general.type";

import { mediaKeys } from "@/lib/query-keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

type DeleteTarget = {
  mediaType: MediaType;
  id: number;
  title: string;
};

type Props = {
  listQuery: UseMediaLibraryListResult;
  scrollRoot: HTMLDivElement | null;
};

export default function MediaListSection({ listQuery, scrollRoot }: Props) {
  const queryClient = useQueryClient();

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

  const rows = useMemo(() => {
    const pages = listQuery.data?.pages ?? [];
    return pages.flatMap((page) => page.data.map(mapMediaItemToRow));
  }, [listQuery.data?.pages]);

  const { hasNextPage, isFetchingNextPage, isLoading } = listQuery;

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

  return (
    <div className="rounded-xl border border-border/40 bg-background/90">
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
              onRequestDelete={handleRequestDelete}
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
