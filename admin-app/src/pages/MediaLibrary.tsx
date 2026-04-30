import { useState } from "react";

import { MediaFiltersProvider } from "@/components/context/MediaFiltersContext";
import AdminLayout from "@/components/layout/AdminLayout";
import MediaHeader from "@/components/media/MediaHeader";
import MediaListSection from "@/components/media/MediaListSection";

import { useMediaLibraryList } from "@/hooks/useMediaLibraryList";

function MediaLibraryContent() {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const listQuery = useMediaLibraryList(true);
  const totalCount = listQuery.data?.pages[0]?.metadata.itemCount;

  return (
    <AdminLayout
      title="Media Library"
      description="Combined search with dedicated sections for anime, manga, and light novel."
      scrollContainerRef={setScrollRoot}
    >
      <div className="space-y-4">
        <MediaHeader totalCount={totalCount} />
        <MediaListSection listQuery={listQuery} scrollRoot={scrollRoot} />
      </div>
    </AdminLayout>
  );
}

export default function MediaLibrary() {
  return (
    <MediaFiltersProvider>
      <MediaLibraryContent />
    </MediaFiltersProvider>
  );
}
