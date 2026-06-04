import GeneralFooter from "@/components/GeneralFooter";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import { mangaListConfig } from "@/components/manga/MangaListConfig";
import MediaListHeader from "@/components/media-list/MediaListHeader";
import MediaListProvider from "@/components/media-list/MediaListProvider";
import MediaListSection from "@/components/media-list/MediaListSection";

import { mangaListQueryConfig } from "@/lib/media-list/manga-list-query";
import { mangaListServerConfig } from "@/lib/media-list/manga-list-server";
import { printedMediaListEntityLookups } from "@/lib/media-list/media-list-entity-lookups";
import { prefetchMediaListPage } from "@/lib/media-list/prefetch-media-list-page";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manga Collection | Otaku Corner",
  description:
    "Browse through bearking58's manga collection, featuring straightforward reviews and ratings. Find compelling stories and steer clear of the duds with helpful insights.",
  alternates: {
    canonical: "/manga"
  }
};

type SearchParams = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function Page({ searchParams }: SearchParams) {
  const params = await searchParams;
  const listFilters =
    mangaListServerConfig.buildListFiltersFromSearchParams(params);

  const queryClient = new QueryClient();

  await prefetchMediaListPage(queryClient, {
    listFilters,
    queryConfig: mangaListQueryConfig,
    entityLookups: printedMediaListEntityLookups
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaListProvider config={mangaListConfig}>
        <HeroWallpaper>
          <MediaListHeader config={mangaListConfig} />
          <MediaListSection config={mangaListConfig} />
          <GeneralFooter />
        </HeroWallpaper>
      </MediaListProvider>
    </HydrationBoundary>
  );
}
