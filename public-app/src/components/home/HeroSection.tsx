"use client";

import { useEffect, useState } from "react";

import { statisticService } from "@/services/statistic.service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/useToast";

import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { BookIcon, LibraryIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const toast = useToast();

  const { data, error } = useQuery({
    queryKey: ["allTimeStats"],
    queryFn: () => statisticService.fetchAllTime()
  });

  if (error) {
    toast.toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: error.message
    });
  }

  const [animatedCounts, setAnimatedCounts] = useState({
    anime: 0,
    manga: 0,
    lightNovel: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      const animateCount = (
        target: number,
        key: keyof typeof animatedCounts
      ) => {
        let current = 0;
        const increment = target / 20;
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
        }, 50);
      };

      animateCount(data?.animeCount ?? 0, "anime");
      animateCount(data?.mangaCount ?? 0, "manga");
      animateCount(data?.lightNovelCount ?? 0, "lightNovel");
    }, 500);

    return () => clearTimeout(timer);
  }, [data]);

  const exploreRoutes = [
    {
      id: 1,
      path: "/anime",
      icon: (
        <PlayIcon
          size={20}
          className="group-hover:translate-x-1 transition-transform"
        />
      ),
      text: "Explore Anime"
    },
    {
      id: 2,
      path: "/manga",
      icon: (
        <BookIcon
          size={20}
          className="group-hover:translate-x-1 transition-transform"
        />
      ),
      text: "Explore Manga"
    },
    {
      id: 3,
      path: "/light-novel",
      icon: (
        <LibraryIcon
          size={20}
          className="group-hover:translate-x-1 transition-transform"
        />
      ),
      text: "Explore Light Novels"
    }
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={cn(
              "space-y-8 transition-all duration-1000",
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            )}
          >
            <div className="space-y-4">
              <Badge className="bg-white/20 backdrop-blur-sm text-slate-800 border border-white/30 hover:text-white animate-pulse">
                ✨ Personal Hobby Tracking Platform
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 leading-tight">
                Track My{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Anime, Manga,
                </span>{" "}
                and{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Light Novels
                </span>
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed max-w-lg">
                This platform provides reviews and ratings for anime, manga, and
                light novels that I&apos;ve consumed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {exploreRoutes.map((route) => {
                return (
                  <Link
                    key={route.id}
                    href={route.path}
                    className="w-full xl:w-fit"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-slate-800 hover:bg-slate-700 hover:text-white group"
                    >
                      {route.icon}
                      {route.text}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800">
                  {animatedCounts.anime}
                </div>
                <div className="text-sm text-slate-600">Anime Watched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800">
                  {animatedCounts.manga}
                </div>
                <div className="text-sm text-slate-600">Manga Read</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800">
                  {animatedCounts.lightNovel}
                </div>
                <div className="text-sm text-slate-600">Light Novels Read</div>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "relative transition-all duration-1000 delay-300",
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            )}
          >
            <Image
              src="/hero_image.webp"
              alt="Hero Image"
              width={500}
              height={500}
              className="rounded-2xl object-cover shadow-2xl border border-white/30"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
