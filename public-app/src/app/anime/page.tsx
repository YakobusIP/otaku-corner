import { animeService } from "@/services/anime.service";

import GeneralFooter from "@/components/GeneralFooter";
import AnimeHeader from "@/components/anime/AnimeHeader";
import AnimeListSection from "@/components/anime/AnimeListSection";
import { AnimeProvider } from "@/components/context/AnimeContext";

import {
  buildAnimeListFiltersFromSearchParams,
  getAnimeListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";
import { publicListKeys } from "@/lib/query-keys";

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
  const listFilters = buildAnimeListFiltersFromSearchParams(params);

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      getAnimeListInfiniteQueryOptions(listFilters)
    ),
    queryClient
      .prefetchQuery({
        queryKey: publicListKeys.animeStatusCounts(),
        queryFn: () => animeService.fetchStatusCounts(),
        staleTime: Infinity,
        retry: false
      })
      .catch(() => {})
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnimeProvider>
        <div className="flex flex-col min-h-dvh main-gradient-bg">
          <AnimeHeader />
          <AnimeListSection />
          <GeneralFooter />
        </div>
      </AnimeProvider>
    </HydrationBoundary>
  );
}
