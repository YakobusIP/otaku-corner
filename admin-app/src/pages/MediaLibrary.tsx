import { useState } from "react";

import { MediaFiltersProvider } from "@/features/media-library/components/MediaFiltersContext";
import AdminLayout from "@/components/layout/AdminLayout";
import AddMediaDropdown from "@/features/media-library/components/AddMediaDropdown";
import MediaHeader from "@/features/media-library/components/MediaHeader";
import MediaListSection from "@/features/media-library/components/MediaListSection";

import { useMediaLibraryList } from "@/features/media-library/hooks/useMediaLibraryList";

function MediaLibraryContent() {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const listQuery = useMediaLibraryList(true);
  const totalCount = listQuery.data?.pages[0]?.metadata.itemCount;

  return (
    <AdminLayout
      title="Media Library"
      description="Combined search with dedicated sections for anime, manga, and light novel."
      scrollContainerRef={setScrollRoot}
      actions={<AddMediaDropdown />}
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
