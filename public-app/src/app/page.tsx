import { Suspense } from "react";

import TopMedias from "@/components/home/TopMedias";
import TopMediasSkeleton from "@/components/skeletons/TopMediasSkeleton";
import { Button } from "@/components/ui/button";

import { SORT_ORDER } from "@/lib/enums";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
  const exploreRoutes = [
    {
      id: 1,
      path: {
        pathname: "/anime",
        query: { page: "1", sortBy: "title", sortOrder: SORT_ORDER.ASCENDING }
      },
      text: "Explore Anime"
    },
    {
      id: 2,
      path: {
        pathname: "/manga",
        query: { page: "1", sortBy: "title", sortOrder: SORT_ORDER.ASCENDING }
      },
      text: "Explore Manga"
    },
    {
      id: 3,
      path: {
        pathname: "/light-novel",
        query: { page: "1", sortBy: "title", sortOrder: SORT_ORDER.ASCENDING }
      },
      text: "Explore Light Novels"
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
        <Suspense fallback={<TopMediasSkeleton />}>
          <TopMedias />
        </Suspense>
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
