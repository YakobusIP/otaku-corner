import GeneralFooter from "@/components/GeneralFooter";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import { lightNovelListConfig } from "@/components/light-novel/LightNovelListConfig";
import MediaListHeader from "@/components/media-list/MediaListHeader";
import MediaListProvider from "@/components/media-list/MediaListProvider";
import MediaListSection from "@/components/media-list/MediaListSection";

import { lightNovelListQueryConfig } from "@/lib/media-list/light-novel-list-query";
import { lightNovelListServerConfig } from "@/lib/media-list/light-novel-list-server";
import { printedMediaListEntityLookups } from "@/lib/media-list/media-list-entity-lookups";
import { prefetchMediaListPage } from "@/lib/media-list/prefetch-media-list-page";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Light Novel Collection | Otaku Corner",
  description:
    "Explore bearking58's selection of light novels, accompanied by sincere reviews and ratings. Discover captivating narratives and avoid the letdowns with informed opinions.",
  alternates: {
    canonical: "/light-novel"
  }
};

type SearchParams = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function Page({ searchParams }: SearchParams) {
  const params = await searchParams;
  const listFilters =
    lightNovelListServerConfig.buildListFiltersFromSearchParams(params);

  const queryClient = new QueryClient();

  await prefetchMediaListPage(queryClient, {
    listFilters,
    queryConfig: lightNovelListQueryConfig,
    entityLookups: printedMediaListEntityLookups
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaListProvider config={lightNovelListConfig}>
        <HeroWallpaper>
          <MediaListHeader config={lightNovelListConfig} />
          <MediaListSection config={lightNovelListConfig} />
          <GeneralFooter />
        </HeroWallpaper>
      </MediaListProvider>
    </HydrationBoundary>
  );
}
