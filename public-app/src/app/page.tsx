import { statisticService } from "@/services/statistic.service";

import GeneralFooter from "@/components/GeneralFooter";
import HeroSection from "@/components/home/HeroSection";
import TopMedias from "@/components/home/TopMedias";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "bearking58 Otaku Corner: Personal Reviews of Anime, Manga, and Light Novels",
  description:
    "Dive into bearking58's personal otaku media collection, featuring candid reviews and ratings of anime, manga, and light novels. Explore insights from an average Japanese media enthusiast.",
  alternates: {
    canonical: "/"
  }
};

export default async function Page() {
  const queryClient = new QueryClient();

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
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-gradient-to-r from-[#ffafbd] via-[#ffc3a0] to-[#ffeecf]">
        <HeroSection />
        <TopMedias />
        <GeneralFooter />
      </div>
    </HydrationBoundary>
  );
}
