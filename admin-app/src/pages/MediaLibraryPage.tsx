import { useMemo } from "react";

import { MediaFiltersProvider, useMediaFilters } from "@/components/context/MediaFiltersContext";
import AdminLayout from "@/components/layout/AdminLayout";
import MediaHeader from "@/components/media/MediaHeader";
import MediaListSection from "@/components/media/MediaListSection";
import { useAnimeList } from "@/hooks/useAnimeList";
import { useLightNovelList } from "@/hooks/useLightNovelList";
import { useMangaList } from "@/hooks/useMangaList";

function MediaLibraryContent() {
  const { state } = useMediaFilters();

  const animeQuery = useAnimeList(state.mediaType === "all" || state.mediaType === "anime");
  const mangaQuery = useMangaList(state.mediaType === "all" || state.mediaType === "manga");
  const lightNovelQuery = useLightNovelList(
    state.mediaType === "all" || state.mediaType === "lightNovel"
  );

  const totalCount = useMemo(() => {
    if (state.mediaType === "anime") return animeQuery.data?.metadata.itemCount;
    if (state.mediaType === "manga") return mangaQuery.data?.metadata.itemCount;
    if (state.mediaType === "lightNovel") {
      return lightNovelQuery.data?.metadata.itemCount;
    }
    return (
      (animeQuery.data?.metadata.itemCount ?? 0) +
      (mangaQuery.data?.metadata.itemCount ?? 0) +
      (lightNovelQuery.data?.metadata.itemCount ?? 0)
    );
  }, [
    animeQuery.data?.metadata.itemCount,
    lightNovelQuery.data?.metadata.itemCount,
    mangaQuery.data?.metadata.itemCount,
    state.mediaType
  ]);

  return (
    <AdminLayout
      title="Media Library"
      description="Combined search with dedicated sections for anime, manga, and light novel."
    >
      <div className="space-y-4">
        <MediaHeader totalCount={totalCount} />
        <MediaListSection />
      </div>
    </AdminLayout>
  );
}

export default function MediaLibraryPage() {
  return (
    <MediaFiltersProvider>
      <MediaLibraryContent />
    </MediaFiltersProvider>
  );
}
