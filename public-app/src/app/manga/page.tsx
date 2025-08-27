import { mangaService } from "@/services/manga.service";

import GeneralFooter from "@/components/GeneralFooter";
import { MangaProvider } from "@/components/context/MangaContext";
import MangaHeader from "@/components/manga/MangaHeader";
import MangaListSection from "@/components/manga/MangaListSection";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

const PAGINATION_SIZE = 15;

export const metadata: Metadata = {
  title: "Manga Collection | Otaku Corner",
  description:
    "Browse through bearking58's manga collection, featuring straightforward reviews and ratings. Find compelling stories and steer clear of the duds with helpful insights.",
  alternates: {
    canonical: "/manga"
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
        "mangas",
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
        undefined
      ],
      queryFn: () =>
        mangaService.fetchAll(
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
          undefined
        ),
      retry: false
    }),
    queryClient.fetchQuery({
      queryKey: ["mangaStatusCounts"],
      queryFn: () => mangaService.fetchStatusCounts(),
      staleTime: Infinity,
      retry: false
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MangaProvider>
        <div className="flex flex-col min-h-[100dvh] main-gradient-bg">
          <MangaHeader />
          <MangaListSection />
          <GeneralFooter />
        </div>
      </MangaProvider>
    </HydrationBoundary>
  );
}
