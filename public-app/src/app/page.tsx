import HomeCard from "@/app/HomeCard";

import { fetchTopMediaAndYearlyCountService } from "@/services/statistic.service";

import { Button } from "@/components/ui/button";

import { MEDIA_TYPE } from "@/lib/enums";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title:
    "bearking58 Otaku Corner: Personal Reviews of Anime, Manga, and Light Novels",
  description:
    "Dive into bearking58's personal otaku media collection, featuring candid reviews and ratings of anime, manga, and light novels. Explore insights from an average Japanese media enthusiast."
};

export default async function Page() {
  const fetchHomeData = async () => {
    const response = await fetchTopMediaAndYearlyCountService();
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching home data:", response.error);
      redirect("/fetch-error");
    }
  };

  const homeData = await fetchHomeData();

  const exploreRoutes = [
    { id: 1, path: "/anime", text: "Explore Anime" },
    { id: 2, path: "/manga", text: "Explore Manga" },
    { id: 3, path: "/light-novel", text: "Explore Light Novels" }
  ];

  const topMedias = [
    {
      id: 1,
      cardTitle: "Anime Watched This Year",
      amount: homeData.anime.count,
      type: MEDIA_TYPE.ANIME,
      path: "/anime",
      image:
        homeData.anime.images?.large_image_url ||
        homeData.anime.images?.image_url ||
        "/placeholder.svg",
      mediaTitle: homeData.anime.title || "",
      rating: homeData.anime.score ? homeData.anime.score.toFixed(2) : 0
    },
    {
      id: 2,
      cardTitle: "Manga Read This Year",
      amount: homeData.manga.count,
      type: MEDIA_TYPE.MANGA,
      path: "/manga",
      image:
        homeData.manga.images?.large_image_url ||
        homeData.manga.images?.image_url ||
        "/placeholder.svg",
      mediaTitle: homeData.manga.title || "",
      rating: homeData.manga.score ? homeData.manga.score.toFixed(2) : 0
    },
    {
      id: 3,
      cardTitle: "Light Novels Read This Year",
      amount: homeData.lightNovel.count,
      type: MEDIA_TYPE.LIGHT_NOVEL,
      path: "/light-novel",
      image:
        homeData.lightNovel.images?.large_image_url ||
        homeData.lightNovel.images?.image_url ||
        "/placeholder.svg",
      mediaTitle: homeData.lightNovel.title || "",
      rating: homeData.lightNovel.score
        ? homeData.lightNovel.score.toFixed(2)
        : 0
    }
  ];

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-primary text-primary-foreground pt-16 pb-12 md:py-16 xl:py-20">
        <div className="container">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 xl:gap-16">
            <div className="flex flex-col gap-4">
              <h1 className="max-w-[650px]">
                Track My Anime, Manga, and Light Novels
              </h1>
              <h4 className="text-primary-foreground/80 max-w-[650px]">
                This platform provides reviews and ratings for anime, manga, and
                light novels that I&apos;ve consumed.
              </h4>
              <div className="flex flex-col xl:flex-row items-center gap-4">
                {exploreRoutes.map((route) => {
                  return (
                    <Link
                      key={route.id}
                      href={route.path}
                      className="w-full xl:w-fit"
                    >
                      <Button variant="secondary" className="w-full xl:w-fit">
                        {route.text}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
            <Image
              src="/hero_image.webp"
              alt="Hero Image"
              width={500}
              height={500}
              className="rounded-xl object-cover"
              priority
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-16 xl:py-20">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {topMedias.map((media) => {
                return <HomeCard key={media.id} {...media} />;
              })}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted py-6 text-muted-foreground">
        <div className="container flex items-center justify-between">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Otaku Corner
          </p>
        </div>
      </footer>
    </div>
  );
}
