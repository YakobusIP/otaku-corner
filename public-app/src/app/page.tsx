import {
  HOME_RECENT_REVIEWS_LIMIT,
  HOME_TASTE_PROFILE_LIMIT,
  statisticService
} from "@/services/statistic.service";

import GeneralFooter from "@/components/GeneralFooter";
import HomeHeroWithNav from "@/components/home/HomeHeroWithNav";
import HomeInsightsCarousel from "@/components/home/HomeInsightsCarousel";
import HomeQuoteSection from "@/components/home/HomeQuoteSection";
import HomeYearProgressSection from "@/components/home/HomeYearProgressSection";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "bearking58 Otaku Corner: Personal Reviews of Anime, Manga, and Light Novels",
  description:
    "Dive into bearking58's personal otaku media collection, featuring candid reviews and ratings of anime, manga, and light novels. Explore insights from an average Japanese media enthusiast.",
  alternates: {
    canonical: "/"
  }
};

const currentYear = () => new Date().getFullYear();

export default async function Page() {
  const queryClient = new QueryClient();
  const year = currentYear();

  await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["allTimeStats"],
      queryFn: () => statisticService.fetchAllTime(),
      retry: false
    }),
    queryClient.fetchQuery({
      queryKey: ["topMedias", year],
      queryFn: () => statisticService.fetchTopMediaAndYearlyCount(year),
      retry: false
    }),
    queryClient.fetchQuery({
      queryKey: ["mediaConsumption", "monthly", year],
      queryFn: () =>
        statisticService.fetchMediaConsumption("monthly", String(year)),
      retry: false
    }),
    queryClient.fetchQuery({
      queryKey: ["tasteProfile", HOME_TASTE_PROFILE_LIMIT],
      queryFn: () =>
        statisticService.fetchTasteProfile(HOME_TASTE_PROFILE_LIMIT),
      retry: false
    }),
    queryClient.fetchQuery({
      queryKey: ["recentReviews", HOME_RECENT_REVIEWS_LIMIT],
      queryFn: () =>
        statisticService.fetchRecentReviews(HOME_RECENT_REVIEWS_LIMIT),
      retry: false
    }),
    queryClient.fetchQuery({
      queryKey: ["statisticYearRange"],
      queryFn: () => statisticService.fetchYearRange(),
      retry: false
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen w-full max-w-full overflow-x-clip bg-white text-slate-900">
        <HomeHeroWithNav />
        <HomeYearProgressSection />
        <div className="relative overflow-hidden bg-transparent">
          <div className="absolute inset-x-0 bottom-0 top-8 z-0">
            <Image
              src="/hero_lower_image.webp"
              alt=""
              fill
              className="object-cover object-[80%_bottom]"
              sizes="100vw"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[340px] bg-linear-to-b from-white via-white/85 to-transparent" />
          <HomeInsightsCarousel />
          <HomeQuoteSection />
        </div>
        <GeneralFooter />
      </div>
    </HydrationBoundary>
  );
}
