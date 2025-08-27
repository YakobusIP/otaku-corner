import { animeService } from "@/services/anime.service";

import GeneralFooter from "@/components/GeneralFooter";
import AnimeHeader from "@/components/anime/AnimeHeader";
import AnimeListSection from "@/components/anime/AnimeListSection";
import { AnimeProvider } from "@/components/context/AnimeContext";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

const PAGINATION_SIZE = 10;

export const metadata: Metadata = {
  title: "Anime Collection | Otaku Corner",
  description:
    "Explore bearking58's curated anime collection, complete with honest reviews and ratings. Discover new favorites and avoid the misses with insights from an average fan.",
  alternates: {
    canonical: "/anime"
  }
};

type SearchParams = {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
};

export default async function Page({ searchParams }: SearchParams) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const query = params.q ?? "";
  const status = params.status as keyof typeof PROGRESS_STATUS | undefined;

  const sort = "title";
  const order = SORT_ORDER.ASCENDING;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.fetchQuery({
      queryKey: [
        "animes",
        page,
        PAGINATION_SIZE,
        query,
        sort,
        order,
        undefined,
        undefined,
        undefined,
        status,
        undefined,
        undefined,
        undefined
      ],
      queryFn: () =>
        animeService.fetchAll(
          page,
          PAGINATION_SIZE,
          query,
          sort,
          order,
          undefined,
          undefined,
          undefined,
          status,
          undefined,
          undefined,
          undefined
        ),
      retry: false
    }),
    queryClient.fetchQuery({
      queryKey: ["animeStatusCounts"],
      queryFn: () => animeService.fetchStatusCounts(),
      staleTime: Infinity,
      retry: false
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnimeProvider>
        <div className="flex flex-col min-h-[100dvh] main-gradient-bg">
          <AnimeHeader />
          <AnimeListSection />
          <GeneralFooter />
        </div>
      </AnimeProvider>
    </HydrationBoundary>
  );
}
