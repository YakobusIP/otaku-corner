import { animeListConfig } from "@/components/anime/AnimeListConfig";
import GeneralFooter from "@/components/GeneralFooter";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import MediaListHeader from "@/components/media-list/MediaListHeader";
import MediaListProvider from "@/components/media-list/MediaListProvider";
import MediaListSection from "@/components/media-list/MediaListSection";

import { animeListQueryConfig } from "@/lib/anime-list-query";
import { animeListServerConfig } from "@/lib/anime-list-server";
import { animeListEntityLookups } from "@/lib/media-list-entity-lookups";
import { prefetchMediaListPage } from "@/lib/prefetch-media-list-page";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Collection | Otaku Corner",
  description:
    "Explore bearking58's curated anime collection, complete with honest reviews and ratings. Discover new favorites and avoid the misses with insights from an average fan.",
  alternates: {
    canonical: "/anime"
  }
};

type SearchParams = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function Page({ searchParams }: SearchParams) {
  const params = await searchParams;
  const listFilters =
    animeListServerConfig.buildListFiltersFromSearchParams(params);

  const queryClient = new QueryClient();

  await prefetchMediaListPage(queryClient, {
    listFilters,
    queryConfig: animeListQueryConfig,
    entityLookups: animeListEntityLookups
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaListProvider config={animeListConfig}>
        <HeroWallpaper>
          <MediaListHeader config={animeListConfig} />
          <MediaListSection config={animeListConfig} />
          <GeneralFooter />
        </HeroWallpaper>
      </MediaListProvider>
    </HydrationBoundary>
  );
}
