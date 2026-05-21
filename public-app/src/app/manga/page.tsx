import { mangaService } from "@/services/manga.service";

import GeneralFooter from "@/components/GeneralFooter";
import { MangaProvider } from "@/components/context/MangaContext";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import MangaHeader from "@/components/manga/MangaHeader";
import MangaListSection from "@/components/manga/MangaListSection";

import {
  buildMangaListFiltersFromSearchParams,
  getMangaListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";
import { publicListKeys } from "@/lib/query-keys";

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
  const listFilters = buildMangaListFiltersFromSearchParams(params);

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      getMangaListInfiniteQueryOptions(listFilters)
    ),
    queryClient
      .prefetchQuery({
        queryKey: publicListKeys.mangaStatusCounts(),
        queryFn: () => mangaService.fetchStatusCounts(),
        staleTime: Infinity,
        retry: false
      })
      .catch(() => {})
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MangaProvider>
        <HeroWallpaper>
          <MangaHeader />
          <MangaListSection />
          <GeneralFooter />
        </HeroWallpaper>
      </MangaProvider>
    </HydrationBoundary>
  );
}
