import {
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
      queryKey: ["topMedias"],
      queryFn: () => statisticService.fetchTopMediaAndYearlyCount(),
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
      queryKey: ["recentReviews", 5],
      queryFn: () => statisticService.fetchRecentReviews(5),
      retry: false
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900">
        <HomeHeroWithNav />
        <HomeYearProgressSection />
        <div className="relative overflow-hidden bg-white">
          <div className="absolute inset-x-0 bottom-0 top-8 z-0">
            <Image
              src="/hero_lower_image.webp"
              alt=""
              fill
              className="object-cover object-[80%_bottom]"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-x-0 top-0 z-0 h-[380px] bg-linear-to-b from-white via-white/90 to-white/20" />
          <div className="absolute inset-x-0 bottom-0 z-0 h-44 bg-linear-to-t from-white via-white/75 to-white/0" />
          <HomeInsightsCarousel />
          <HomeQuoteSection />
        </div>
        <GeneralFooter />
      </div>
    </HydrationBoundary>
  );
}
