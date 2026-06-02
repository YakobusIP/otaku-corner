"use client";

import { useEffect, useState } from "react";

import HomePublicNavbar from "@/components/home/HomePublicNavbar";
import HomeUpperSectionImage from "@/components/layout/HomeUpperSectionImage";
import SlideUpInView from "@/components/motion/SlideUpInView";
import { Badge } from "@/components/ui/badge";

import { useHomeAllTimeStats } from "@/hooks/useHomeStatistics";

import {
  PUBLIC_MEDIA_TYPES,
  PUBLIC_MEDIA_TYPE_CONFIG,
  type PublicMediaTypeId
} from "@/lib/public-media-type";
import { cn } from "@/lib/utils";

import {
  BookOpenIcon,
  LibraryIcon,
  PlayIcon,
  SparklesIcon
} from "lucide-react";

const HERO_COUNTER_ICONS = {
  anime: PlayIcon,
  manga: BookOpenIcon,
  lightNovel: LibraryIcon
} as const;

export default function HomeHeroWithNav() {
  const { allTimeStatsQuery } = useHomeAllTimeStats();
  const { data } = allTimeStatsQuery;

  const [animatedCounts, setAnimatedCounts] = useState<
    Record<PublicMediaTypeId, number>
  >({
    anime: 0,
    manga: 0,
    lightNovel: 0
  });

  useEffect(() => {
    const intervalIds: ReturnType<typeof setInterval>[] = [];

    const timer = setTimeout(() => {
      const animateCount = (target: number, key: PublicMediaTypeId) => {
        let current = 0;
        const increment = Math.max(target / 20, 1);
        const interval = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          setAnimatedCounts((prev) => ({
            ...prev,
            [key]: Math.floor(current)
          }));
        }, 100);

        intervalIds.push(interval);
      };

      PUBLIC_MEDIA_TYPES.forEach((mediaTypeId) => {
        const countKey = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId].allTimeCountKey;
        animateCount(data?.[countKey] ?? 0, mediaTypeId);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      intervalIds.forEach((interval) => clearInterval(interval));
    };
  }, [data]);

  const counterItems = PUBLIC_MEDIA_TYPES.map((mediaTypeId) => {
    const config = PUBLIC_MEDIA_TYPE_CONFIG[mediaTypeId];
    return {
      key: mediaTypeId,
      label: config.heroCounterLabel,
      value: animatedCounts[mediaTypeId],
      icon: HERO_COUNTER_ICONS[mediaTypeId],
      iconBg: config.heroCounterIconBg
    };
  });

  return (
    <section className="relative min-h-[640px] w-full overflow-hidden bg-white lg:min-h-[660px]">
      <HomeUpperSectionImage />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-b from-white/0 via-white/80 to-white" />

      <div className="relative z-10 flex min-h-[640px] flex-col lg:min-h-[660px]">
        <HomePublicNavbar />

        <SlideUpInView className="mx-auto box-border flex w-full max-w-[1400px] flex-1 -translate-y-7 flex-col justify-center px-4 pb-36 pt-4 sm:px-8 sm:pb-40 lg:px-12">
          <div className="mt-6 w-full max-w-full space-y-6 sm:max-w-136">
            <Badge className="motion-safe:animate-pulse inline-flex gap-1.5 border border-rose-200/80 hover:border-rose-200/80 bg-rose-100/80 hover:bg-rose-100/80 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-none backdrop-blur-md">
              <SparklesIcon className="h-3 w-3" aria-hidden />
              My Personal Tracking Hub
            </Badge>
            <h1 className="text-4xl font-bold leading-tight text-[#32132f] drop-shadow-[0_1px_0_rgba(255,255,255,0.65)] sm:text-5xl lg:text-[3rem]">
              Track My{" "}
              <span className="bg-linear-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
                Anime
              </span>
              , <br />
              <span className="bg-linear-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
                Manga
              </span>
              , and <br />
              <span className="bg-linear-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                Light Novels
              </span>
            </h1>
            <p className="max-w-lg text-base font-semibold leading-relaxed text-[#4b3a4c]/90 drop-shadow-[0_2px_10px_rgba(255,255,255,0.92)] max-sm:drop-shadow-[0_2px_14px_rgba(255,255,255,0.98)] sm:text-lg sm:drop-shadow-none">
              A personal space to track, reflect, and celebrate the series that
              inspire me.
            </p>
          </div>

          <div className="mt-6 grid w-full max-w-full grid-cols-1 gap-4 sm:max-w-2xl sm:grid-cols-3">
            {counterItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-4 rounded-lg border border-white/75 bg-white/70 px-4 py-3 shadow-[0_14px_36px_rgba(244,114,182,0.16)] backdrop-blur-md"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                      item.iconBg
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tabular-nums text-[#3a1d39]">
                      {item.value}
                    </div>
                    <div className="text-sm font-medium text-[#5b4a5c]">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SlideUpInView>
      </div>
    </section>
  );
}
