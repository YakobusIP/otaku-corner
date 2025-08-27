import { lightNovelService } from "@/services/lightnovel.service";

import GeneralFooter from "@/components/GeneralFooter";
import { LightNovelProvider } from "@/components/context/LightNovelContext";
import LightNovelHeader from "@/components/light-novel/LightNovelHeader";
import LightNovelListSection from "@/components/light-novel/LightNovelListSection";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

const PAGINATION_SIZE = 15;

export const metadata: Metadata = {
  title: "Light Novel Collection | Otaku Corner",
  description:
    "Explore bearking58's selection of light novels, accompanied by sincere reviews and ratings. Discover captivating narratives and avoid the letdowns with informed opinions.",
  alternates: {
    canonical: "/light-novel"
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
        "lightNovels",
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
        lightNovelService.fetchAll(
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
      queryKey: ["lightNovelStatusCounts"],
      queryFn: () => lightNovelService.fetchStatusCounts(),
      staleTime: Infinity,
      retry: false
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LightNovelProvider>
        <div className="flex flex-col min-h-[100dvh] main-gradient-bg">
          <LightNovelHeader />
          <LightNovelListSection />
          <GeneralFooter />
        </div>
      </LightNovelProvider>
    </HydrationBoundary>
  );
}
