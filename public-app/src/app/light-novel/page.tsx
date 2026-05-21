import { lightNovelService } from "@/services/lightnovel.service";

import GeneralFooter from "@/components/GeneralFooter";
import { LightNovelProvider } from "@/components/context/LightNovelContext";
import LightNovelHeader from "@/components/light-novel/LightNovelHeader";
import LightNovelListSection from "@/components/light-novel/LightNovelListSection";
import HeroWallpaper from "@/components/layout/HeroWallpaper";

import {
  buildLightNovelListFiltersFromSearchParams,
  getLightNovelListInfiniteQueryOptions
} from "@/lib/public-list-infinite-queries";
import { publicListKeys } from "@/lib/query-keys";

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
  const listFilters = buildLightNovelListFiltersFromSearchParams(params);

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      getLightNovelListInfiniteQueryOptions(listFilters)
    ),
    queryClient
      .prefetchQuery({
        queryKey: publicListKeys.lightNovelStatusCounts(),
        queryFn: () => lightNovelService.fetchStatusCounts(),
        staleTime: Infinity,
        retry: false
      })
      .catch(() => {})
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LightNovelProvider>
        <HeroWallpaper>
          <LightNovelHeader />
          <LightNovelListSection />
          <GeneralFooter />
        </HeroWallpaper>
      </LightNovelProvider>
    </HydrationBoundary>
  );
}
